<?php

declare(strict_types=1);

namespace App\Services\Notifications;

use App\Enums\BookingStatus;
use App\Models\Booking;
use App\Models\BookingMessage;
use App\Models\DeviceToken;
use App\Models\Quote;
use App\Models\QuoteRequest;
use App\Models\Review;
use App\Models\TechnicianProfile;
use App\Models\User;
use App\Services\Marketplace\RequestMatcher;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Who gets a push notification for what, in their own language.
 *
 * Every method schedules the work with `defer()`, so it runs after the
 * response has been sent and only when the request succeeded; a Firebase
 * problem is logged and never breaks the action that caused it.
 *
 * `data.route` is the app screen a tap opens.
 */
class Notifier
{
    public const NEW_JOB = 'new_job';

    public const NEW_OFFER = 'new_offer';

    public const OFFER_ACCEPTED = 'offer_accepted';

    public const JOB_UPDATE = 'job_update';

    public const MESSAGE = 'message';

    public const VERIFICATION = 'verification';

    public const REVIEW = 'review';

    public function __construct(private readonly Fcm $fcm, private readonly RequestMatcher $matcher) {}

    /** A customer posted a request: tell verified professionals who can bid on it. */
    public function newRequest(QuoteRequest $request): void
    {
        $this->later(function () use ($request): void {
            $request->loadMissing('category');
            $max = (int) config('pakfix.push.new_job_max_pros', 50);
            // The widest a professional's radius can be; canBid() checks each one exactly.
            $radius = (int) config('pakfix.matching.max_radius_km', 50);
            $dLat = $radius / 111.32;
            $dLng = $radius / (111.32 * max(cos(deg2rad((float) $request->latitude)), 0.01));

            TechnicianProfile::query()
                ->publiclyVisible()
                ->where('is_accepting_jobs', true)
                ->whereBetween('latitude', [(float) $request->latitude - $dLat, (float) $request->latitude + $dLat])
                ->whereBetween('longitude', [(float) $request->longitude - $dLng, (float) $request->longitude + $dLng])
                ->with('user')
                ->limit($max * 3)
                ->get()
                ->filter(fn (TechnicianProfile $p) => $p->user !== null && $this->matcher->canBid($p, $request))
                ->take($max)
                ->each(fn (TechnicianProfile $p) => $this->push($p->user, self::NEW_JOB, [
                    'en' => ['New job near you', $this->summary($request)],
                    'ur' => ['آپ کے قریب نیا کام', $this->summary($request)],
                ], ['route' => "/pro/jobs/{$request->uuid}"]));
        });
    }

    /** A professional sent an offer: tell the customer. */
    public function newOffer(Quote $quote, QuoteRequest $request): void
    {
        $this->later(function () use ($quote, $request): void {
            $customer = User::find($request->customer_id);
            $name = $quote->technicianProfile?->displayName() ?? 'A professional';
            $price = 'Rs '.number_format(intdiv((int) $quote->total_minor, 100));

            $this->push($customer, self::NEW_OFFER, [
                'en' => ['New offer: '.$price, "{$name} sent you an offer. Compare and choose."],
                'ur' => ['نئی آفر: '.$price, "{$name} نے آپ کو آفر بھیجی ہے۔ موازنہ کر کے منتخب کریں۔"],
            ], ['route' => "/requests/{$request->uuid}"]);
        });
    }

    /** The customer chose this professional. */
    public function offerAccepted(Booking $booking): void
    {
        $this->later(function () use ($booking): void {
            $pro = $this->proUser($booking);
            $this->push($pro, self::OFFER_ACCEPTED, [
                'en' => ['Your offer was accepted', 'You got the job '.$booking->reference.'. Open it to see the address.'],
                'ur' => ['آپ کی آفر قبول ہو گئی', 'آپ کو کام '.$booking->reference.' مل گیا۔ پتہ دیکھنے کے لیے کھولیں۔'],
            ], ['route' => "/pro/bookings/{$booking->uuid}"]);
        });
    }

    /** A booking moved on; the other side hears about the steps that matter. */
    public function bookingChanged(Booking $booking, BookingStatus $to, string $byRole): void
    {
        $this->later(function () use ($booking, $to, $byRole): void {
            $pro = $booking->technicianProfile?->displayName() ?? 'Your professional';

            if ($byRole === 'technician') {
                $text = match ($to) {
                    BookingStatus::TechnicianOnWay => ['en' => ['On the way', "{$pro} is on the way."], 'ur' => ['راستے میں', "{$pro} راستے میں ہیں۔"]],
                    BookingStatus::Arrived => ['en' => ['Arrived', "{$pro} has arrived."], 'ur' => ['پہنچ گئے', "{$pro} پہنچ گئے ہیں۔"]],
                    BookingStatus::Completed => ['en' => ['Job done', 'Check the work, then confirm and pay in cash.'], 'ur' => ['کام مکمل', 'کام چیک کریں، پھر تصدیق کر کے نقد ادائیگی کریں۔']],
                    BookingStatus::Cancelled => ['en' => ['Job cancelled', "{$pro} cancelled job {$booking->reference}."], 'ur' => ['کام منسوخ', "{$pro} نے کام {$booking->reference} منسوخ کر دیا۔"]],
                    default => null,
                };
                if ($text !== null) {
                    $this->push(User::find($booking->customer_id), self::JOB_UPDATE, $text, ['route' => "/bookings/{$booking->uuid}"]);
                }

                return;
            }

            $text = match ($to) {
                BookingStatus::CustomerConfirmed => ['en' => ['Job confirmed', "The customer confirmed {$booking->reference} and the cash payment."], 'ur' => ['کام کی تصدیق', "کسٹمر نے {$booking->reference} اور نقد ادائیگی کی تصدیق کر دی۔"]],
                BookingStatus::QuoteAccepted => ['en' => ['New price approved', "You can carry on with {$booking->reference}."], 'ur' => ['نئی قیمت منظور', "آپ {$booking->reference} پر کام جاری رکھ سکتے ہیں۔"]],
                BookingStatus::Cancelled => ['en' => ['Job cancelled', "The customer cancelled {$booking->reference}."], 'ur' => ['کام منسوخ', "کسٹمر نے {$booking->reference} منسوخ کر دیا۔"]],
                default => null,
            };
            if ($text !== null) {
                $this->push($this->proUser($booking), self::JOB_UPDATE, $text, ['route' => "/pro/bookings/{$booking->uuid}"]);
            }
        });
    }

    /** After inspecting, the professional asks for a new price. */
    public function revisedPrice(Booking $booking): void
    {
        $this->later(function () use ($booking): void {
            $this->push(User::find($booking->customer_id), self::JOB_UPDATE, [
                'en' => ['New price to approve', 'Your professional sent a revised price after inspecting.'],
                'ur' => ['نئی قیمت کی منظوری', 'معائنے کے بعد آپ کے پروفیشنل نے نئی قیمت بھیجی ہے۔'],
            ], ['route' => "/bookings/{$booking->uuid}"]);
        });
    }

    public function newMessage(Booking $booking, BookingMessage $message, User $sender): void
    {
        $this->later(function () use ($booking, $message, $sender): void {
            $toCustomer = $sender->id !== $booking->customer_id;
            $recipient = $toCustomer ? User::find($booking->customer_id) : $this->proUser($booking);
            $from = $toCustomer
                ? ($booking->technicianProfile?->displayName() ?? 'Your professional')
                : (strtok((string) $sender->name, ' ') ?: 'Customer');
            $preview = $message->body !== null && $message->body !== '' ? Str::limit($message->body, 100) : null;

            $this->push($recipient, self::MESSAGE, [
                'en' => [$from, $preview ?? '📷 Photo'],
                'ur' => [$from, $preview ?? '📷 تصویر'],
            ], ['route' => "/chat/{$booking->uuid}"]);
        });
    }

    public function verificationDecided(TechnicianProfile $profile, bool $approved, ?string $reason = null): void
    {
        $this->later(function () use ($profile, $approved, $reason): void {
            $text = $approved
                ? ['en' => ["You're verified", 'You can now receive jobs and send offers.'], 'ur' => ['آپ کی تصدیق ہو گئی', 'اب آپ کو کام مل سکتے ہیں اور آپ آفرز بھیج سکتے ہیں۔']]
                : ['en' => ['Verification needs changes', Str::limit((string) $reason, 120)], 'ur' => ['تصدیق میں تبدیلی درکار', Str::limit((string) $reason, 120)]];

            $this->push($profile->user, self::VERIFICATION, $text, ['route' => '/verification']);
        });
    }

    public function newReview(Booking $booking, Review $review): void
    {
        $this->later(function () use ($booking, $review): void {
            $stars = str_repeat('★', max(1, min(5, (int) $review->rating)));
            $this->push($this->proUser($booking), self::REVIEW, [
                'en' => ["New review {$stars}", $review->comment ? Str::limit($review->comment, 100) : 'Tap to see it and reply.'],
                'ur' => ["نیا ریویو {$stars}", $review->comment ? Str::limit($review->comment, 100) : 'دیکھنے اور جواب دینے کے لیے دبائیں۔'],
            ], ['route' => "/pro/bookings/{$booking->uuid}"]);
        });
    }

    // ------------------------------------------------------------------

    /** Runs after the response, never failing the request. */
    private function later(callable $work): void
    {
        if (! config('pakfix.push.enabled') || ! $this->fcm->isConfigured()) {
            return;
        }

        defer(function () use ($work): void {
            try {
                $work();
            } catch (\Throwable $e) {
                Log::warning('Push notification failed: '.$e->getMessage());
            }
        });
    }

    /**
     * @param  array{en: array{0: string, 1: string}, ur: array{0: string, 1: string}}  $text
     * @param  array<string, string>  $data
     */
    private function push(?User $user, string $type, array $text, array $data = []): void
    {
        if ($user === null || $user->status === User::STATUS_DELETED || ! $this->wants($user, $type)) {
            return;
        }

        [$title, $body] = $text[$user->locale === 'ur' ? 'ur' : 'en'];

        DeviceToken::query()->where('user_id', $user->id)->active()->get()
            ->each(function (DeviceToken $device) use ($title, $body, $type, $data): void {
                $result = $this->fcm->send($device->token, $title, $body, ['type' => $type, ...$data]);
                if ($result === Fcm::INVALID_TOKEN) {
                    $device->forceFill(['is_active' => false])->save();
                }
            });
    }

    /** Respects `notification_preferences` (push on unless turned off). */
    private function wants(User $user, string $type): bool
    {
        $push = DB::table('notification_preferences')
            ->where('user_id', $user->id)
            ->where('notification_type', $type)
            ->value('push');

        return $push === null || (bool) $push;
    }

    private function proUser(Booking $booking): ?User
    {
        $booking->loadMissing('technicianProfile.user');

        return $booking->technicianProfile?->user;
    }

    private function summary(QuoteRequest $request): string
    {
        $description = Str::limit((string) $request->description, 80);

        return $request->category?->name ? $request->category->name.': '.$description : $description;
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Public\ContactRequest;
use App\Models\ContactMessage;
use App\Notifications\ContactMessageReceived;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Notification;

/**
 * `POST /contact` -- the public contact form.
 *
 * The message is stored before anything is sent, so a mail outage never
 * loses it; the support inbox is notified on the queue.
 */
class ContactController extends Controller
{
    public function __invoke(ContactRequest $request): JsonResponse
    {
        $message = ContactMessage::create([
            ...$request->safe()->except('website'),
            'user_id' => $request->user('sanctum')?->getKey(),
            'status' => ContactMessage::STATUS_NEW,
            'ip_address' => $request->ip(),
            'user_agent' => substr((string) $request->userAgent(), 0, 255),
        ]);

        Notification::route('mail', config('pakfix.brand.support_email'))
            ->notify(new ContactMessageReceived($message));

        return ApiResponse::created(
            ['reference' => strtoupper(substr($message->uuid, 0, 8))],
            'Thanks, your message has reached the PakFix team. We reply by email, usually within one working day.'
        );
    }
}

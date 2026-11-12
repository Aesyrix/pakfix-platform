<?php

declare(strict_types=1);

use App\Support\ContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The first content seed described a different product: twelve cities,
 * card / JazzCash / Easypaisa / bank payments, photo diagnosis, refunds,
 * rented-property records, plus three sample testimonials from cities PakFix
 * does not serve. This makes the live FAQ say what PakFix actually does.
 *
 * Only rows still holding the original seeded text are touched, so anything
 * an admin has already rewritten stays as it is. Nothing is deleted.
 */
return new class extends Migration
{
    /** question => [seeded answer, corrected answer (null = switch off)] */
    public const FAQS = [
        'How does the AI diagnosis work?' => [
            'You describe the problem or send a photo. PakFix returns the likely cause, how urgent it is, a realistic cost range and the kind of professional you need. It is guidance, not a guarantee -- the professional confirms on site.',
            'You describe the problem in your own words, in English or Roman Urdu. PakFix AI suggests the likely cause, how urgent it is, the right service and its usual price range. It is guidance, not a diagnosis: the professional checks on site.',
        ],
        'Is PakFix free to use?' => [
            'Creating an account, asking the assistant and requesting quotes are free. You only pay for the work you agree to.',
            'For customers, yes: creating an account, asking PakFix AI, posting a job and getting offers are free. You pay the professional, in cash, only for the work you agree to.',
        ],
        'How are professionals verified?' => [
            'Every professional submits identity documents and, where relevant, trade certificates. A member of the PakFix team reviews each one by hand before the profile goes live.',
            'Every professional submits their CNIC (front and back) and a selfie. A member of the PakFix team reviews them by hand before the professional can offer on jobs.',
        ],
        'What if I am not happy with the work?' => [
            'Raise a dispute from the booking within the platform. Support reviews the evidence from both sides and can order a partial or full refund.',
            'Report a problem from the job in the app. The PakFix team reviews what both sides say and helps resolve it. Payment is in cash between you and the professional, so do not pay until you are satisfied the work is done.',
        ],
        'How do I pay?' => [
            'Cash on service and bank transfer are available everywhere. Card, JazzCash and Easypaisa are enabled city by city.',
            'In cash, to the professional, after you confirm the work is done. Online payments are not available yet.',
        ],
        'Which cities does PakFix cover?' => [
            'PakFix is live in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Hyderabad and Abbottabad, and is expanding.',
            'PakFix is starting in Islamabad and Rawalpindi. More cities will follow.',
        ],
        'Can I use PakFix for a rented home?' => [
            'Yes. Mark the property as rented when you add it, and keep the maintenance history with you.',
            null,
        ],
        'What happens in an emergency?' => [
            'Choose Emergency Repair. The request is raised as high priority and sent to professionals who offer emergency call-outs. PakFix does not promise a fixed response time.',
            'Choose Emergency Repair, or Roadside Help for a car or bike. The request goes first to verified professionals nearby who take emergency jobs. PakFix does not promise a fixed response time.',
        ],
    ];

    /** Seeded sample testimonials (not real customers): switched off. */
    public const SAMPLE_TESTIMONIALS = ['Ayesha S.', 'Bilal A.', 'Sana M.'];

    /** Seeded About-page sentences that described features PakFix does not have => corrected. */
    public const ABOUT_FIXES = [
        ['Describe it or send a photo, and get a plain-language explanation of what is likely wrong, how serious it is, and what it typically costs to fix.', 'Describe it in your own words and get a plain-language explanation of what is likely wrong, how serious it is, and the right service to call.'],
        ['- **Keeps the price clear.** You see a quote and accept it before work starts.', '- **Lets you choose the price.** Verified professionals send offers, or you name your own price, and you accept one before work starts. You pay in cash when the job is done.'],
        ['- **Remembers your home.** Every repair, appliance and service date stays on your property\'s record.','- **Keeps your jobs in one place.** Every job, offer and chat stays in your account.'],
        ['PakFix is live in Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, Gujranwala, Sialkot, Hyderabad and Abbottabad, and growing.', 'PakFix is starting in Islamabad and Rawalpindi, and will grow city by city.'],
    ];

    public function up(): void
    {
        foreach (self::FAQS as $question => [$seeded, $corrected]) {
            DB::table('faqs')
                ->where('question', $question)
                ->where('answer', $seeded)
                ->update($corrected === null
                    ? ['is_active' => false, 'updated_at' => now()]
                    : ['answer' => $corrected, 'updated_at' => now()]);
        }

        DB::table('testimonials')
            ->whereIn('author_name', self::SAMPLE_TESTIMONIALS)
            ->whereIn('author_location', ['Lahore', 'Karachi', 'Islamabad'])
            ->update(['is_published' => false, 'updated_at' => now()]);

        // The property-manager banner pointed at a page for a service PakFix does not offer.
        DB::table('content_blocks')
            ->where('key', 'home.property_manager_cta')
            ->where('cta_url', '/for-property-managers')
            ->update(['is_active' => false, 'updated_at' => now()]);

        // The About page in the CMS: replace only the original sentences, keep any admin edits.
        $about = DB::table('cms_pages')->where('slug', 'about')->first();
        if ($about !== null) {
            $body = str_replace(array_column(self::ABOUT_FIXES, 0), array_column(self::ABOUT_FIXES, 1), (string) $about->body);
            if ($body !== $about->body) {
                DB::table('cms_pages')->where('slug', 'about')->update(['body' => $body, 'updated_at' => now()]);
            }
        }

        ContentCache::flush();
    }

    public function down(): void
    {
        // Content corrections are not reversed.
    }
};

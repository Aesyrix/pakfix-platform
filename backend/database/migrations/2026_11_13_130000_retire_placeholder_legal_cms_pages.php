<?php

declare(strict_types=1);

use App\Support\ContentCache;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The first content seed created one-line placeholder CMS pages for the
 * terms, privacy and refund policies and for safety, served at /pages/<slug>.
 * The real pages now live at /terms-of-service, /privacy-policy,
 * /refund-policy and /safety (routes/web.php redirects the old addresses),
 * so the placeholders are unpublished. Only rows still holding the seeded
 * placeholder text are touched; nothing is deleted.
 */
return new class extends Migration
{
    /** slug => the seeded placeholder body */
    public const PLACEHOLDERS = [
        'terms-of-service' => 'Placeholder terms. Replace with copy reviewed by a Pakistani legal adviser before launch.',
        'privacy-policy' => 'Placeholder privacy policy. Must describe how CNIC documents, addresses and payment data are stored and who can access them.',
        'refund-policy' => 'Placeholder refund policy covering disputes, partial refunds and the window in which a customer can raise one.',
        'safety' => 'How PakFix classifies dangerous problems, what the assistant will not talk you through, and what to do in an emergency.',
    ];

    public function up(): void
    {
        foreach (self::PLACEHOLDERS as $slug => $body) {
            DB::table('cms_pages')
                ->where('slug', $slug)
                ->where('body', $body)
                ->update(['is_published' => false, 'updated_at' => now()]);
        }

        ContentCache::flush();
    }

    public function down(): void
    {
        // Placeholders are not brought back.
    }
};

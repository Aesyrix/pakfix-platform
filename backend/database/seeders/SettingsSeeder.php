<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

/**
 * The settings an admin can edit from the dashboard. Values seeded here are
 * the defaults; SettingsRepository falls back to config/pakfix.php and
 * config/ai.php for anything missing, so deleting a row is never fatal.
 *
 * Secret rows are created empty. Credentials are entered through the admin UI
 * and stored encrypted -- they are never committed to the repository.
 */
class SettingsSeeder extends Seeder
{
    /**
     * key, group, value, type, label, public
     *
     * @return list<array{0:string,1:string,2:mixed,3:string,4:string,5:bool}>
     */
    private function settings(): array
    {
        return [
            // Brand -- safe for the public frontend bootstrap call.
            ['platform.name', 'general', 'PakFix', Setting::TYPE_STRING, 'Platform name', true],
            ['platform.tagline', 'general', 'Show the Problem. Get It Fixed.', Setting::TYPE_STRING, 'Tagline', true],
            ['platform.support_email', 'general', 'support@pakfix.pk', Setting::TYPE_STRING, 'Support email', true],
            ['platform.support_phone', 'general', '+92 300 0000000', Setting::TYPE_STRING, 'Support phone', true],
            ['platform.whatsapp', 'general', '', Setting::TYPE_STRING, 'WhatsApp number', true],
            ['platform.currency', 'general', 'PKR', Setting::TYPE_STRING, 'Currency', true],
            ['platform.maintenance_mode', 'general', false, Setting::TYPE_BOOLEAN, 'Maintenance mode', true],

            // Commission and tax -- server-side money rules.
            ['commission.type', 'commission', 'percentage', Setting::TYPE_STRING, 'Commission type', false],
            ['commission.percentage', 'commission', '10', Setting::TYPE_STRING, 'Default commission (%)', false],
            ['commission.tax_percentage', 'commission', '0', Setting::TYPE_STRING, 'Tax (%)', false],

            // Bookings.
            ['booking.max_open_per_customer', 'booking', '10', Setting::TYPE_INTEGER, 'Max open bookings per customer', false],
            ['booking.cancellation_window_minutes', 'booking', '60', Setting::TYPE_INTEGER, 'Free cancellation window (minutes)', false],
            ['booking.auto_confirm_after_hours', 'booking', '48', Setting::TYPE_INTEGER, 'Auto-confirm completed jobs after (hours)', false],

            // AI.
            ['ai.enabled', 'ai', true, Setting::TYPE_BOOLEAN, 'AI assistant enabled', true],
            ['ai.provider', 'ai', 'openai', Setting::TYPE_STRING, 'Active AI provider', false],
            ['ai.model', 'ai', '', Setting::TYPE_STRING, 'Model override', false],
            ['ai.vision_model', 'ai', '', Setting::TYPE_STRING, 'Image analysis model override', false],
            ['ai.temperature', 'ai', '0.2', Setting::TYPE_STRING, 'Temperature', false],
            ['ai.max_tokens', 'ai', '1500', Setting::TYPE_INTEGER, 'Max tokens', false],
            ['ai.free_diagnoses_per_day', 'ai', '5', Setting::TYPE_INTEGER, 'Free diagnoses per user per day', false],
            ['ai.system_prompt', 'ai', '', Setting::TYPE_STRING, 'System prompt override', false],

            // Matching.
            ['matching.default_radius_km', 'matching', '15', Setting::TYPE_INTEGER, 'Default search radius (km)', false],
            ['matching.max_candidates', 'matching', '25', Setting::TYPE_INTEGER, 'Max professionals invited per job', false],

            // Uploads.
            ['uploads.max_image_kb', 'uploads', '8192', Setting::TYPE_INTEGER, 'Max image size (KB)', false],
            ['uploads.max_video_kb', 'uploads', '51200', Setting::TYPE_INTEGER, 'Max video size (KB)', false],

            // Channels.
            ['notifications.sms_enabled', 'notifications', false, Setting::TYPE_BOOLEAN, 'SMS notifications', false],
            ['notifications.whatsapp_enabled', 'notifications', false, Setting::TYPE_BOOLEAN, 'WhatsApp notifications', false],
            ['notifications.push_enabled', 'notifications', false, Setting::TYPE_BOOLEAN, 'Push notifications', false],

            // Payments.
            ['payments.cash_enabled', 'payments', true, Setting::TYPE_BOOLEAN, 'Cash on service', true],
            ['payments.bank_transfer_enabled', 'payments', true, Setting::TYPE_BOOLEAN, 'Bank transfer', true],
            ['payments.jazzcash_enabled', 'payments', false, Setting::TYPE_BOOLEAN, 'JazzCash', true],
            ['payments.easypaisa_enabled', 'payments', false, Setting::TYPE_BOOLEAN, 'Easypaisa', true],
            ['payments.card_enabled', 'payments', false, Setting::TYPE_BOOLEAN, 'Card payments', true],

            // SEO.
            ['seo.default_title', 'seo', 'PakFix | Pakistan Smart Home Repair Platform', Setting::TYPE_STRING, 'Default page title', true],
            ['seo.default_description', 'seo', 'Upload a photo, describe the problem, and book a verified professional near you.', Setting::TYPE_STRING, 'Default meta description', true],
        ];
    }

    /** Credential slots. Created empty and encrypted on write. */
    private function secrets(): array
    {
        return [
            ['ai.openai_api_key', 'ai', 'OpenAI API key'],
            ['ai.gemini_api_key', 'ai', 'Gemini API key'],
            ['ai.anthropic_api_key', 'ai', 'Anthropic API key'],
            ['maps.google_key', 'maps', 'Google Maps API key'],
            ['payments.stripe_secret', 'payments', 'Stripe secret key'],
            ['payments.jazzcash_password', 'payments', 'JazzCash password'],
            ['payments.jazzcash_salt', 'payments', 'JazzCash integrity salt'],
            ['payments.easypaisa_hash_key', 'payments', 'Easypaisa hash key'],
            ['notifications.sms_api_key', 'notifications', 'SMS gateway API key'],
            ['notifications.whatsapp_token', 'notifications', 'WhatsApp token'],
        ];
    }

    public function run(): void
    {
        foreach ($this->settings() as [$key, $group, $value, $type, $label, $public]) {
            $setting = Setting::firstOrNew(['key' => $key]);

            // Only fill in metadata and defaults; never clobber a value an
            // admin has already changed.
            $setting->fill([
                'group' => $group,
                'type' => $type,
                'label' => $label,
                'is_secret' => false,
                'is_public' => $public,
            ]);

            if (! $setting->exists) {
                $setting->setTypedValue($value);
            }

            $setting->save();
        }

        foreach ($this->secrets() as [$key, $group, $label]) {
            Setting::firstOrCreate(
                ['key' => $key],
                [
                    'group' => $group,
                    'type' => Setting::TYPE_SECRET,
                    'label' => $label,
                    'value' => null,
                    'is_secret' => true,
                    'is_public' => false,
                ]
            );
        }

        $this->command?->info(sprintf('Seeded %d settings.', Setting::count()));
    }
}

<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\Audit\AuditLogger;
use App\Support\ApiResponse;
use App\Support\ContentCache;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Site-wide settings that belong to marketing: brand, contact details,
 * social links and SEO defaults.
 *
 * Deliberately limited to those groups. Commission, payments and AI
 * credentials are money and security settings; they get their own screens,
 * permissions and audit trail in later phases rather than a generic form.
 */
class SettingController extends Controller
{
    private const EDITABLE_GROUPS = ['general', 'social', 'seo'];

    public function index(): JsonResponse
    {
        $settings = Setting::whereIn('group', self::EDITABLE_GROUPS)
            ->where('is_secret', false)
            ->orderBy('group')
            ->orderBy('id')
            ->get()
            ->map(fn (Setting $setting) => [
                'key' => $setting->key,
                'group' => $setting->group,
                'label' => $setting->label,
                'type' => $setting->type,
                'value' => $setting->typedValue(),
            ]);

        return ApiResponse::success($settings);
    }

    /** `{ "values": { "platform.support_phone": "+92 ...", ... } }` */
    public function update(Request $request, AuditLogger $audit): JsonResponse
    {
        $request->validate(['values' => ['required', 'array', 'min:1']]);

        $values = $request->input('values');

        $settings = Setting::whereIn('key', array_keys($values))
            ->whereIn('group', self::EDITABLE_GROUPS)
            ->where('is_secret', false)
            ->get()
            ->keyBy('key');

        $errors = [];

        foreach ($values as $key => $value) {
            if (! $settings->has($key)) {
                $errors["values.{$key}"] = ['This setting cannot be edited here.'];
                continue;
            }

            if ($message = $this->validationError($settings[$key], $value)) {
                $errors["values.{$key}"] = [$message];
            }
        }

        if ($errors !== []) {
            return ApiResponse::validationFailed($errors);
        }

        DB::transaction(function () use ($values, $settings, $audit): void {
            foreach ($values as $key => $value) {
                $setting = $settings[$key];
                $before = $setting->typedValue();

                $setting->setTypedValue(is_string($value) ? trim($value) : $value);
                $setting->save();

                if ($before !== $setting->typedValue()) {
                    $audit->record('setting.updated', $setting, [$key => $before], [$key => $setting->typedValue()]);
                }
            }
        });

        ContentCache::flush();

        return ApiResponse::success(null, 'Settings saved.');
    }

    private function validationError(Setting $setting, mixed $value): ?string
    {
        if ($setting->type === Setting::TYPE_BOOLEAN) {
            return is_bool($value) ? null : 'Must be on or off.';
        }

        if ($value !== null && ! is_string($value)) {
            return 'Must be text.';
        }

        $value = trim((string) $value);

        if (mb_strlen($value) > 500) {
            return 'Must be 500 characters or fewer.';
        }

        if (str_starts_with($setting->key, 'social.') && $value !== '' && ! str_starts_with($value, 'https://')) {
            return 'Use a full https:// link.';
        }

        if ($setting->key === 'platform.support_email' && ! filter_var($value, FILTER_VALIDATE_EMAIL)) {
            return 'Must be a valid email address.';
        }

        if (in_array($setting->key, ['platform.name', 'seo.default_title'], true) && $value === '') {
            return 'This cannot be empty.';
        }

        return null;
    }
}

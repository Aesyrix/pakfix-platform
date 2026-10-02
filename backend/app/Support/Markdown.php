<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Renders CMS and blog Markdown to HTML that is safe to put in a page.
 *
 * Editors write Markdown, never HTML. Raw HTML in the source is stripped and
 * unsafe link schemes (javascript:, data:) are refused, so a compromised
 * editor account cannot plant a script on the public site.
 */
final class Markdown
{
    public static function toHtml(?string $markdown): string
    {
        if ($markdown === null || trim($markdown) === '') {
            return '';
        }

        return Str::markdown($markdown, [
            'html_input' => 'strip',
            'allow_unsafe_links' => false,
            'max_nesting_level' => 20,
        ]);
    }

    /** A plain-text excerpt, for meta descriptions and cards. */
    public static function excerpt(?string $markdown, int $limit = 160): string
    {
        $text = trim(preg_replace('/\s+/', ' ', strip_tags(self::toHtml($markdown))) ?? '');

        return Str::limit($text, $limit);
    }
}

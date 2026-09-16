<?php

declare(strict_types=1);

namespace App\Enums;

enum MediaType: string
{
    case Image = 'image';
    case Video = 'video';
    case Document = 'document';
    case Audio = 'audio';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

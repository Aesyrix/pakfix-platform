<?php

declare(strict_types=1);

namespace App\Enums;

enum PropertyType: string
{
    case House = 'house';
    case Apartment = 'apartment';
    case Rental = 'rental';
    case Office = 'office';
    case Shop = 'shop';
    case Warehouse = 'warehouse';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::House => 'House',
            self::Apartment => 'Apartment',
            self::Rental => 'Rental property',
            self::Office => 'Office',
            self::Shop => 'Commercial shop',
            self::Warehouse => 'Warehouse',
            self::Other => 'Other',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

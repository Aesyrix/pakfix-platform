<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The eight roles PakFix recognises. Role names are persisted by
 * spatie/laravel-permission; this enum is the single source of truth for
 * their spelling so a typo can never silently create an eighth-and-a-half role.
 */
enum UserRole: string
{
    case Customer = 'customer';
    case Technician = 'technician';
    case Company = 'company';
    case PropertyManager = 'property_manager';
    case SupportAgent = 'support_agent';
    case Admin = 'admin';
    case SuperAdmin = 'super_admin';

    public function label(): string
    {
        return match ($this) {
            self::Customer => 'Customer',
            self::Technician => 'Technician',
            self::Company => 'Service Company',
            self::PropertyManager => 'Property Manager',
            self::SupportAgent => 'Support Agent',
            self::Admin => 'Admin',
            self::SuperAdmin => 'Super Admin',
        };
    }

    /** Roles that may sign up through the public registration endpoint. */
    public static function selfRegisterable(): array
    {
        return [self::Customer, self::Technician, self::Company, self::PropertyManager];
    }

    /** Roles that reach the internal admin surface. */
    public function isStaff(): bool
    {
        return in_array($this, [self::SupportAgent, self::Admin, self::SuperAdmin], true);
    }

    /** The dashboard a freshly authenticated user lands on. */
    public function homePath(): string
    {
        return match ($this) {
            self::Customer, self::PropertyManager => '/dashboard',
            self::Technician, self::Company => '/pro',
            self::SupportAgent, self::Admin, self::SuperAdmin => '/admin',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}

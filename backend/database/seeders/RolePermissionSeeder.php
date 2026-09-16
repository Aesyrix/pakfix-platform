<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\UserRole;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Roles and permissions. Authorisation is checked on the server for every
 * sensitive action; the frontend only uses these names to decide what to
 * render, never to decide what is allowed.
 *
 * Re-running this seeder is safe: everything is created by firstOrCreate and
 * role grants are synced, so adding a permission here rolls it out without a
 * hand-written migration.
 */
class RolePermissionSeeder extends Seeder
{
    /**
     * Grouped for readability only; the stored name is what matters.
     *
     * @var array<string, list<string>>
     */
    private const PERMISSIONS = [
        'properties' => ['properties.view', 'properties.manage'],
        'bookings' => [
            'bookings.view.own', 'bookings.view.assigned', 'bookings.view.any',
            'bookings.create', 'bookings.update', 'bookings.cancel',
            'bookings.assign', 'bookings.update.status',
        ],
        'quotes' => [
            'quotes.view.own', 'quotes.create', 'quotes.respond', 'quotes.view.any',
        ],
        'ai' => ['ai.use', 'ai.view.any', 'ai.configure'],
        'technicians' => [
            'technicians.view', 'technicians.manage.own',
            'technicians.verify', 'technicians.suspend',
        ],
        'companies' => ['companies.manage.own', 'companies.manage.any'],
        'payments' => [
            'payments.view.own', 'payments.view.any',
            'payments.confirm', 'payments.refund', 'payouts.manage',
        ],
        'reviews' => ['reviews.create', 'reviews.respond', 'reviews.moderate'],
        'messaging' => ['messages.send', 'messages.moderate'],
        'support' => [
            'support.tickets.create', 'support.tickets.view.any',
            'support.tickets.respond', 'disputes.view.any', 'disputes.resolve',
        ],
        'maintenance' => ['maintenance.manage.own', 'maintenance.view.any'],
        'catalogue' => ['services.manage', 'locations.manage', 'coupons.manage'],
        'content' => ['content.manage', 'blog.manage'],
        'users' => ['users.view', 'users.manage', 'users.impersonate'],
        'platform' => [
            'settings.manage', 'roles.manage', 'audit.view',
            'analytics.view', 'reports.export',
        ],
    ];

    /**
     * What each role is granted. Super admin is deliberately absent: it is
     * given everything via a Gate::before rule in AuthServiceProvider, so a
     * newly added permission can never accidentally exclude it.
     *
     * @var array<string, list<string>>
     */
    private const ROLE_GRANTS = [
        UserRole::Customer->value => [
            'properties.view', 'properties.manage',
            'bookings.view.own', 'bookings.create', 'bookings.update', 'bookings.cancel',
            'quotes.view.own', 'quotes.respond',
            'ai.use',
            'technicians.view',
            'payments.view.own',
            'reviews.create',
            'messages.send',
            'support.tickets.create',
            'maintenance.manage.own',
        ],
        UserRole::PropertyManager->value => [
            'properties.view', 'properties.manage',
            'bookings.view.own', 'bookings.create', 'bookings.update', 'bookings.cancel',
            'quotes.view.own', 'quotes.respond',
            'ai.use',
            'technicians.view',
            'payments.view.own',
            'reviews.create',
            'messages.send',
            'support.tickets.create',
            'maintenance.manage.own',
        ],
        UserRole::Technician->value => [
            'bookings.view.assigned', 'bookings.update.status',
            'quotes.create', 'quotes.view.own',
            'technicians.manage.own', 'technicians.view',
            'payments.view.own',
            'reviews.respond',
            'messages.send',
            'support.tickets.create',
        ],
        UserRole::Company->value => [
            'bookings.view.assigned', 'bookings.assign', 'bookings.update.status',
            'quotes.create', 'quotes.view.own',
            'companies.manage.own', 'technicians.manage.own', 'technicians.view',
            'payments.view.own',
            'reviews.respond',
            'messages.send',
            'support.tickets.create',
        ],
        UserRole::SupportAgent->value => [
            'users.view',
            'bookings.view.any', 'quotes.view.any', 'ai.view.any',
            'technicians.view', 'payments.view.any',
            'messages.send', 'messages.moderate',
            'support.tickets.view.any', 'support.tickets.respond',
            'disputes.view.any',
            'reviews.moderate',
            'maintenance.view.any',
        ],
        UserRole::Admin->value => [
            'users.view', 'users.manage',
            'properties.view',
            'bookings.view.any', 'bookings.assign', 'bookings.cancel', 'bookings.update.status',
            'quotes.view.any',
            'ai.view.any', 'ai.configure',
            'technicians.view', 'technicians.verify', 'technicians.suspend',
            'companies.manage.any',
            'payments.view.any', 'payments.confirm', 'payments.refund', 'payouts.manage',
            'reviews.moderate',
            'messages.moderate',
            'support.tickets.view.any', 'support.tickets.respond',
            'disputes.view.any', 'disputes.resolve',
            'maintenance.view.any',
            'services.manage', 'locations.manage', 'coupons.manage',
            'content.manage', 'blog.manage',
            'settings.manage', 'audit.view', 'analytics.view', 'reports.export',
        ],
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $names) {
            foreach ($names as $name) {
                Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
            }
        }

        foreach (UserRole::cases() as $role) {
            $model = Role::firstOrCreate(['name' => $role->value, 'guard_name' => 'web']);

            if ($role === UserRole::SuperAdmin) {
                // Handled by the Gate::before rule; granting explicitly would
                // only go stale the next time a permission is added.
                continue;
            }

            $model->syncPermissions(self::ROLE_GRANTS[$role->value] ?? []);
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->command?->info(sprintf(
            'Seeded %d roles and %d permissions.',
            count(UserRole::cases()),
            Permission::count()
        ));
    }
}

<?php

declare(strict_types=1);

namespace Tests\Feature\Api\V1;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * A guest calling a protected API address gets a clean 401, even from a
 * browser that did not ask for JSON (this used to be a 500).
 */
class GuestApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_without_a_json_header_gets_401_not_500(): void
    {
        $this->get('/api/v1/bookings')
            ->assertUnauthorized()
            ->assertJsonPath('success', false);
    }

    public function test_a_guest_with_a_json_header_still_gets_401(): void
    {
        $this->getJson('/api/v1/bookings')->assertUnauthorized();
    }
}

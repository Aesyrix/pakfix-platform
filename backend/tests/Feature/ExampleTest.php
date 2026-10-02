<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

/**
 * The application boots and answers.
 *
 * `/` is covered by FrontendServingTest: without a website build it returns
 * 503 with instructions, which is why the stock "homepage returns 200" check
 * is not the right smoke test for PakFix.
 */
class ExampleTest extends TestCase
{
    public function test_the_health_check_responds(): void
    {
        $this->get('/up')->assertOk();
    }

    public function test_the_api_announces_its_version(): void
    {
        $this->getJson('/api/v1')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'PakFix API')
            ->assertJsonPath('data.version', 'v1');
    }
}

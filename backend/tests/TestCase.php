<?php

declare(strict_types=1);

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Drops the resolved auth guards so the next request starts from nothing.
     *
     * The test application is a single long-lived container, so once a guard
     * has resolved a user it keeps returning that user for the rest of the
     * test. In production every request boots fresh, so without this a test
     * that revokes a token and then calls the API again would pass whether or
     * not the revocation actually worked.
     */
    protected function forgetAuthenticatedUser(): static
    {
        $this->app['auth']->forgetGuards();

        return $this;
    }
}

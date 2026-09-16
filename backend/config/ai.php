<?php

declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| AI configuration
|--------------------------------------------------------------------------
| PakFix never talks to a vendor SDK directly. Everything goes through
| AiProviderInterface, and this file only decides which implementation the
| container hands out and what credentials it gets. The `settings` table
| overrides `default` at runtime, so an admin can switch providers without
| a deploy — see App\Services\Ai\AiManager.
*/

return [

    'enabled' => env('AI_ENABLED', true),

    // Overridable from the admin dashboard (settings key: ai.provider).
    'default' => env('AI_PROVIDER', 'openai'),

    // Shared generation defaults; a provider may override any of them.
    'temperature' => (float) env('AI_TEMPERATURE', 0.2),
    'max_tokens' => (int) env('AI_MAX_TOKENS', 1500),
    'timeout' => (int) env('AI_REQUEST_TIMEOUT', 60),

    // Usage limits. 0 means unlimited.
    'limits' => [
        'free_diagnoses_per_day' => (int) env('AI_FREE_DIAGNOSES_PER_DAY', 5),
        'messages_per_session' => 50,
        'images_per_message' => 5,
    ],

    'providers' => [

        'openai' => [
            'driver' => 'openai',
            'api_key' => env('OPENAI_API_KEY'),
            'base_url' => env('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
            'model' => env('OPENAI_MODEL', 'gpt-4o'),
            'vision_model' => env('OPENAI_VISION_MODEL', 'gpt-4o'),
        ],

        'gemini' => [
            'driver' => 'gemini',
            'api_key' => env('GEMINI_API_KEY'),
            'base_url' => env('GEMINI_BASE_URL', 'https://generativelanguage.googleapis.com/v1beta'),
            'model' => env('GEMINI_MODEL', 'gemini-2.0-flash'),
            'vision_model' => env('GEMINI_VISION_MODEL', 'gemini-2.0-flash'),
        ],

        'anthropic' => [
            'driver' => 'anthropic',
            'api_key' => env('ANTHROPIC_API_KEY'),
            'base_url' => env('ANTHROPIC_BASE_URL', 'https://api.anthropic.com/v1'),
            'model' => env('ANTHROPIC_MODEL', 'claude-sonnet-5'),
            'vision_model' => env('ANTHROPIC_VISION_MODEL', 'claude-sonnet-5'),
            'version' => env('ANTHROPIC_VERSION', '2023-06-01'),
        ],

        // Deterministic provider used by the test suite and by local
        // development when no API key is present. Never reaches the network.
        'fake' => [
            'driver' => 'fake',
        ],
    ],
];

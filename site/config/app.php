<?php

declare(strict_types=1);

return [
    'brand' => 'Core AI Platform',
    'base_url' => 'https://core-ai-platform.example',
    'default_locale' => 'ru',
    'locales' => [
        'ru' => [
            'label' => 'RU',
            'name' => 'Русский',
            'prefix' => '',
        ],
        'en' => [
            'label' => 'EN',
            'name' => 'English',
            'prefix' => 'en',
        ],
        'es' => [
            'label' => 'ES',
            'name' => 'Español',
            'prefix' => 'es',
        ],
    ],
    'pages' => [
        'home' => '',
        'platform' => 'platform',
        'agents' => 'agents',
        'pilot' => 'pilot',
    ],
    'contact_email' => 'hello@example.com',
    'social_image' => '/assets/social/og-default.svg',
];

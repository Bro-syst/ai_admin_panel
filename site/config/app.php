<?php

declare(strict_types=1);

$secretPath = dirname(__DIR__) . '/storage/secrets.php';
$secrets = is_file($secretPath) ? require $secretPath : [];
$secrets = is_array($secrets) ? $secrets : [];

$configString = static function (string $key, string $default = '', bool $trim = true) use ($secrets): string {
    $value = getenv($key);

    if (is_string($value) && $value !== '') {
        return $trim ? trim($value) : $value;
    }

    $secret = $secrets[$key] ?? null;

    if (is_scalar($secret) && (string) $secret !== '') {
        return $trim ? trim((string) $secret) : (string) $secret;
    }

    return $default;
};

$configInt = static function (string $key, int $default) use ($secrets): int {
    $value = getenv($key);

    if (is_string($value) && ctype_digit($value)) {
        return (int) $value;
    }

    $secret = $secrets[$key] ?? null;

    if (is_int($secret)) {
        return $secret;
    }

    if (is_string($secret) && ctype_digit($secret)) {
        return (int) $secret;
    }

    return $default;
};

return [
    'brand' => 'Core AI Platform',
    'base_url' => 'https://syn0rix.com',
    'default_locale' => 'en',
    'locales' => [
        'en' => [
            'label' => 'EN',
            'name' => 'English',
            'prefix' => 'en',
        ],
        'ru' => [
            'label' => 'RU',
            'name' => 'Русский',
            'prefix' => 'ru',
        ],
        'es' => [
            'label' => 'ES',
            'name' => 'Español',
            'prefix' => 'es',
        ],
    ],
    'locale_cookie' => [
        'name' => 'core_ai_platform_locale',
        'max_age' => 31536000,
    ],
    'pages' => [
        'home' => '',
        'platform' => 'platform',
        'agents' => 'agents',
        'solutions' => 'solutions',
        'solution_dc' => 'solutions/dc',
        'solution_billing' => 'solutions/billing',
        'solution_hsm' => 'solutions/hsm',
        'pilot' => 'pilot',
    ],
    'contact_email' => $configString('CONTACT_EMAIL', 'sales@syn0rix.com'),
    'contact_from_email' => $configString('CONTACT_FROM_EMAIL', 'sales@syn0rix.com'),
    'contact_smtp' => [
        'host' => $configString('CONTACT_SMTP_HOST', 'mail.your-server.de'),
        'port' => $configInt('CONTACT_SMTP_PORT', 587),
        'username' => $configString('CONTACT_SMTP_USERNAME', 'sales@syn0rix.com'),
        'password' => $configString('CONTACT_SMTP_PASSWORD', '', false),
        'encryption' => 'starttls',
        'timeout' => 12,
    ],
    'social_image' => '/assets/social/og-default.svg',
];

<?php

declare(strict_types=1);

function resolve_route(): array
{
    $locales = app_config('locales');
    $pages = app_config('pages');
    $defaultLocale = (string) app_config('default_locale');
    $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $segments = array_values(array_filter(explode('/', trim($requestPath, '/')), static fn (string $part): bool => $part !== ''));
    $locale = $defaultLocale;

    if (isset($segments[0]) && array_key_exists($segments[0], $locales) && $segments[0] !== $defaultLocale) {
        $locale = array_shift($segments);
    }

    $slug = $segments[0] ?? '';
    $page = array_search($slug, $pages, true);

    if ($slug === '') {
        $page = 'home';
    }

    if ($page === false || count($segments) > ($slug === '' ? 0 : 1)) {
        return [
            'locale' => $locale,
            'page' => 'home',
            'status' => 404,
        ];
    }

    return [
        'locale' => $locale,
        'page' => (string) $page,
        'status' => 200,
    ];
}

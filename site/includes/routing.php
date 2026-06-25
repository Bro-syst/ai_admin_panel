<?php

declare(strict_types=1);

function locale_prefix_map(): array
{
    $map = [];

    foreach (app_config('locales') as $locale => $details) {
        $prefix = trim((string) ($details['prefix'] ?? $locale), '/');

        if ($prefix !== '') {
            $map[$prefix] = (string) $locale;
        }
    }

    return $map;
}

function is_supported_locale(string $locale): bool
{
    return array_key_exists($locale, app_config('locales'));
}

function locale_from_cookie(): ?string
{
    $cookie = app_config('locale_cookie');
    $name = is_array($cookie) ? (string) ($cookie['name'] ?? '') : '';
    $locale = $name !== '' ? ($_COOKIE[$name] ?? null) : null;

    if (!is_string($locale) || !is_supported_locale($locale)) {
        return null;
    }

    return $locale;
}

function locale_from_accept_language(string $header): ?string
{
    $candidates = [];

    foreach (explode(',', $header) as $index => $part) {
        $pieces = array_map('trim', explode(';', trim($part)));
        $tag = strtolower(str_replace('_', '-', $pieces[0] ?? ''));

        if ($tag === '' || $tag === '*') {
            continue;
        }

        $quality = 1.0;

        foreach (array_slice($pieces, 1) as $piece) {
            if (str_starts_with($piece, 'q=')) {
                $quality = (float) substr($piece, 2);
            }
        }

        if ($quality <= 0) {
            continue;
        }

        $candidates[] = [
            'tag' => $tag,
            'quality' => $quality,
            'index' => $index,
        ];
    }

    usort($candidates, static function (array $a, array $b): int {
        $qualityComparison = $b['quality'] <=> $a['quality'];

        return $qualityComparison !== 0 ? $qualityComparison : $a['index'] <=> $b['index'];
    });

    foreach ($candidates as $candidate) {
        $tag = $candidate['tag'];
        $primary = explode('-', $tag)[0];

        if (is_supported_locale($tag)) {
            return $tag;
        }

        if (is_supported_locale($primary)) {
            return $primary;
        }
    }

    return null;
}

function preferred_locale(): string
{
    $cookieLocale = locale_from_cookie();

    if ($cookieLocale !== null) {
        return $cookieLocale;
    }

    $header = (string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? '');
    $browserLocale = locale_from_accept_language($header);

    return $browserLocale ?? (string) app_config('default_locale');
}

function remember_locale(string $locale): void
{
    if (!is_supported_locale($locale) || headers_sent()) {
        return;
    }

    $cookie = app_config('locale_cookie');
    $name = is_array($cookie) ? (string) ($cookie['name'] ?? '') : '';
    $maxAge = is_array($cookie) ? (int) ($cookie['max_age'] ?? 31536000) : 31536000;

    if ($name === '') {
        return;
    }

    setcookie($name, $locale, [
        'expires' => time() + $maxAge,
        'path' => '/',
        'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    $_COOKIE[$name] = $locale;
}

function append_request_query(string $path): string
{
    $query = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_QUERY);

    if (!is_string($query) || $query === '') {
        return $path;
    }

    return $path . '?' . $query;
}

function resolve_route(): array
{
    $pages = app_config('pages');
    $requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
    $segments = array_values(array_filter(explode('/', trim($requestPath, '/')), static fn (string $part): bool => $part !== ''));
    $prefixes = locale_prefix_map();
    $locale = null;
    $isExplicitLocale = false;

    if (isset($segments[0]) && array_key_exists($segments[0], $prefixes)) {
        $locale = $prefixes[array_shift($segments)];
        $isExplicitLocale = true;
    }

    $slug = implode('/', $segments);
    $page = array_search($slug, $pages, true);
    $locale ??= preferred_locale();

    if ($page === false) {
        return [
            'locale' => $locale,
            'page' => 'home',
            'status' => 404,
            'redirect_to' => null,
            'explicit_locale' => $isExplicitLocale,
        ];
    }

    if (!$isExplicitLocale) {
        return [
            'locale' => $locale,
            'page' => (string) $page,
            'status' => 302,
            'redirect_to' => append_request_query(page_path($locale, (string) $page)),
            'explicit_locale' => false,
        ];
    }

    return [
        'locale' => $locale,
        'page' => (string) $page,
        'status' => 200,
        'redirect_to' => null,
        'explicit_locale' => true,
    ];
}

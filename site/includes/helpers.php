<?php

declare(strict_types=1);

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function app_config(?string $key = null): mixed
{
    global $app;

    if ($key === null) {
        return $app;
    }

    return $app[$key] ?? null;
}

function is_list_array(mixed $value): bool
{
    return is_array($value) && array_keys($value) === range(0, count($value) - 1);
}

function current_origin(): string
{
    $configured = (string) app_config('base_url');

    if (!empty($_SERVER['HTTP_HOST'])) {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';

        return $scheme . '://' . $_SERVER['HTTP_HOST'];
    }

    return rtrim($configured, '/');
}

function page_path(string $locale, string $page): string
{
    $locales = app_config('locales');
    $pages = app_config('pages');
    $prefix = trim((string) ($locales[$locale]['prefix'] ?? ''), '/');
    $slug = trim((string) ($pages[$page] ?? ''), '/');
    $parts = array_values(array_filter([$prefix, $slug], static fn (string $part): bool => $part !== ''));

    return '/' . implode('/', $parts) . (count($parts) > 0 ? '/' : '');
}

function page_url(string $locale, string $page): string
{
    return current_origin() . page_path($locale, $page);
}

function csrf_token(): string
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    if (empty($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function csrf_is_valid(?string $token): bool
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }

    return is_string($token)
        && isset($_SESSION['csrf_token'])
        && is_string($_SESSION['csrf_token'])
        && hash_equals($_SESSION['csrf_token'], $token);
}

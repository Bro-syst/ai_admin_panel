<?php

declare(strict_types=1);

function load_locale(string $locale): array
{
    $path = dirname(__DIR__) . '/locales/' . $locale . '.php';

    if (!is_file($path)) {
        return [];
    }

    $data = require $path;

    return is_array($data) ? $data : [];
}

function array_path(array $source, string $path): mixed
{
    $value = $source;

    foreach (explode('.', $path) as $segment) {
        if (!is_array($value) || !array_key_exists($segment, $value)) {
            return null;
        }

        $value = $value[$segment];
    }

    return $value;
}

function t(string $key, mixed $default = null): mixed
{
    global $translations, $fallbackTranslations;

    $value = array_path($translations, $key);

    if ($value !== null) {
        return $value;
    }

    $fallback = array_path($fallbackTranslations, $key);

    return $fallback ?? $default ?? $key;
}

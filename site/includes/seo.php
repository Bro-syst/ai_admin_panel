<?php

declare(strict_types=1);

function page_meta(string $page): array
{
    $meta = t('meta.' . $page, []);

    if (!is_array($meta)) {
        return [
            'title' => app_config('brand'),
            'description' => '',
        ];
    }

    return $meta;
}

function hreflang_links(string $page): array
{
    $links = [];

    foreach (array_keys(app_config('locales')) as $locale) {
        $links[$locale] = page_url($locale, $page);
    }

    $links['x-default'] = page_url((string) app_config('default_locale'), $page);

    return $links;
}

function json_ld_for_page(string $locale, string $page): array
{
    $meta = page_meta($page);

    return [
        '@context' => 'https://schema.org',
        '@type' => 'WebPage',
        'name' => $meta['title'] ?? app_config('brand'),
        'description' => $meta['description'] ?? '',
        'url' => page_url($locale, $page),
        'inLanguage' => $locale,
        'isPartOf' => [
            '@type' => 'WebSite',
            'name' => app_config('brand'),
            'url' => page_url((string) app_config('default_locale'), 'home'),
        ],
        'publisher' => [
            '@type' => 'Organization',
            'name' => app_config('brand'),
        ],
    ];
}

<?php

declare(strict_types=1);

$meta = page_meta($currentPage);
$canonical = page_url($currentLocale, $currentPage);
$hreflangs = hreflang_links($currentPage);
$socialImage = current_origin() . app_config('social_image');
$jsonLd = json_encode(json_ld_for_page($currentLocale, $currentPage), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
?>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?= e($meta['title'] ?? app_config('brand')) ?></title>
    <meta name="description" content="<?= e($meta['description'] ?? '') ?>">
    <link rel="canonical" href="<?= e($canonical) ?>">
    <?php foreach ($hreflangs as $locale => $url): ?>
        <link rel="alternate" hreflang="<?= e($locale) ?>" href="<?= e($url) ?>">
    <?php endforeach; ?>
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="<?= e(app_config('brand')) ?>">
    <meta property="og:title" content="<?= e($meta['title'] ?? app_config('brand')) ?>">
    <meta property="og:description" content="<?= e($meta['description'] ?? '') ?>">
    <meta property="og:url" content="<?= e($canonical) ?>">
    <meta property="og:image" content="<?= e($socialImage) ?>">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?= e($meta['title'] ?? app_config('brand')) ?>">
    <meta name="twitter:description" content="<?= e($meta['description'] ?? '') ?>">
    <meta name="twitter:image" content="<?= e($socialImage) ?>">
    <link rel="preload" as="style" href="<?= e(asset('/static/styles.css')) ?>">
    <link rel="stylesheet" href="<?= e(asset('/static/styles.css')) ?>">
    <script type="application/ld+json"><?= $jsonLd ?></script>
</head>

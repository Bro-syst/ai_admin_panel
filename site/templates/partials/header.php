<?php

declare(strict_types=1);

$nav = t('site.nav', []);
?>
<header class="site-header">
    <div class="container header-inner">
        <a class="brand" href="<?= e(page_path($currentLocale, 'home')) ?>" aria-label="<?= e(app_config('brand')) ?>">
            <span class="brand-mark" aria-hidden="true">AI</span>
            <span>
                <strong><?= e(app_config('brand')) ?></strong>
                <small><?= e(t('site.descriptor')) ?></small>
            </span>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="<?= e(t('site.menu_label')) ?>">
            <span></span>
            <span></span>
            <span></span>
        </button>
        <nav class="site-nav" id="site-nav" aria-label="Primary">
            <?php foreach (['platform', 'agents', 'pilot'] as $page): ?>
                <a href="<?= e(page_path($currentLocale, $page)) ?>"><?= e($nav[$page] ?? $page) ?></a>
            <?php endforeach; ?>
            <a href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e($nav['contact'] ?? 'Contact') ?></a>
        </nav>
        <div class="header-actions">
            <?php require __DIR__ . '/language-switcher.php'; ?>
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
        </div>
    </div>
</header>

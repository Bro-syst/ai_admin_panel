<?php

declare(strict_types=1);

$nav = t('site.nav', []);
?>
<footer class="site-footer">
    <div class="container footer-grid">
        <div>
            <a class="brand footer-brand" href="<?= e(page_path($currentLocale, 'home')) ?>">
                <span class="brand-mark" aria-hidden="true">AI</span>
                <span>
                    <strong><?= e(app_config('brand')) ?></strong>
                    <small><?= e(t('site.footer.line')) ?></small>
                </span>
            </a>
            <p><?= e(t('site.footer.description')) ?></p>
        </div>
        <nav aria-label="Footer">
            <?php foreach (['platform', 'agents', 'pilot'] as $page): ?>
                <a href="<?= e(page_path($currentLocale, $page)) ?>"><?= e($nav[$page] ?? $page) ?></a>
            <?php endforeach; ?>
        </nav>
    </div>
</footer>

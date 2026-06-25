<?php

declare(strict_types=1);

$locales = app_config('locales');
$current = $locales[$currentLocale] ?? null;
?>
<details class="lang">
    <summary class="lang-trigger" aria-label="<?= e(t('site.language_label')) ?>">
        <span class="lang-current"><?= e($current['label'] ?? strtoupper($currentLocale)) ?></span>
        <svg class="lang-caret" viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none">
            <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
    </summary>
    <div class="lang-menu" role="menu">
        <?php foreach ($locales as $locale => $details): ?>
            <a class="lang-option <?= $locale === $currentLocale ? 'is-active' : '' ?>" href="<?= e(page_path($locale, $currentPage)) ?>" hreflang="<?= e($locale) ?>" role="menuitem"<?= $locale === $currentLocale ? ' aria-current="true"' : '' ?>>
                <span class="lang-code"><?= e($details['label']) ?></span>
                <span class="lang-name"><?= e($details['name']) ?></span>
            </a>
        <?php endforeach; ?>
    </div>
</details>

<?php

declare(strict_types=1);

?>
<nav class="language-switcher" aria-label="<?= e(t('site.language_label')) ?>">
    <?php foreach (app_config('locales') as $locale => $details): ?>
        <a class="<?= $locale === $currentLocale ? 'is-active' : '' ?>" href="<?= e(page_path($locale, $currentPage)) ?>" hreflang="<?= e($locale) ?>">
            <?= e($details['label']) ?>
        </a>
    <?php endforeach; ?>
</nav>

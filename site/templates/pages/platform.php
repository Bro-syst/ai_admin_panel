<?php

declare(strict_types=1);

$page = t('pages.platform', []);
$features = t('pages.home.platform.features', []);
?>
<section class="page-hero">
    <div class="shell shell--narrow">
        <p class="eyebrow"><?= e($page['hero']['label']) ?></p>
        <h1 class="display"><?= e($page['hero']['title']) ?></h1>
        <p class="lead"><?= e($page['hero']['body']) ?></p>
    </div>
</section>

<section class="section band-dark">
    <div class="shell">
        <div class="matrix cols-2">
            <?php foreach ($features as $index => $feature): ?>
                <article class="matrix-card">
                    <span class="index"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <h3><?= e($feature['title']) ?></h3>
                    <p><?= e($feature['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell">
        <div class="matrix">
            <?php foreach ($page['sections'] as $index => $section): ?>
                <article class="matrix-card">
                    <span class="index"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <h3><?= e($section['title']) ?></h3>
                    <p><?= e($section['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark band-deep final-cta">
    <div class="shell">
        <p class="eyebrow"><?= e(t('site.nav.platform')) ?></p>
        <h2 class="heading"><?= e(t('pages.home.final_cta.title')) ?></h2>
        <div class="button-row center">
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
        </div>
        <p class="cta-meta"><?= e(app_config('brand')) ?> · platform · syn0rix.com</p>
    </div>
</section>

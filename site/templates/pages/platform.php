<?php

declare(strict_types=1);

$page = t('pages.platform', []);
$features = t('pages.home.platform.features', []);
?>
<section class="page-hero">
    <div class="container narrow">
        <p class="section-label"><?= e($page['hero']['label']) ?></p>
        <h1><?= e($page['hero']['title']) ?></h1>
        <p><?= e($page['hero']['body']) ?></p>
    </div>
</section>
<section class="section">
    <div class="container feature-grid">
        <?php foreach ($features as $feature): ?>
            <article class="feature-card">
                <h2><?= e($feature['title']) ?></h2>
                <p><?= e($feature['text']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>
<section class="section surface">
    <div class="container stacked">
        <?php foreach ($page['sections'] as $section): ?>
            <article class="wide-panel">
                <h2><?= e($section['title']) ?></h2>
                <p><?= e($section['text']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>
<section class="final-cta compact">
    <div class="container">
        <h2><?= e(t('pages.home.final_cta.title')) ?></h2>
        <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
    </div>
</section>

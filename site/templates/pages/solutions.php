<?php

declare(strict_types=1);

$page = t('pages.solutions', []);
?>
<section class="page-hero">
    <div class="shell shell--narrow">
        <p class="eyebrow"><?= e($page['hero']['label']) ?></p>
        <h1 class="display"><?= e($page['hero']['title']) ?></h1>
        <p class="lead"><?= e($page['hero']['body']) ?></p>
    </div>
</section>

<section class="section">
    <div class="shell">
        <div class="section-head">
            <p class="eyebrow"><?= e($page['overview']['label']) ?></p>
            <h2 class="heading"><?= e($page['overview']['title']) ?></h2>
            <p class="support"><?= e($page['overview']['body']) ?></p>
        </div>
        <div class="matrix">
            <?php foreach ($page['cards'] as $card): ?>
                <article class="matrix-card">
                    <div class="card-meta">
                        <span class="index"><?= e($card['code']) ?></span>
                        <span class="card-tag"><?= e($card['tag']) ?></span>
                    </div>
                    <h3><?= e($card['title']) ?></h3>
                    <p><?= e($card['text']) ?></p>
                    <ul class="check-list">
                        <?php foreach ($card['points'] as $point): ?>
                            <li><?= e($point) ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <a class="text-link" href="<?= e(page_path($currentLocale, $card['page'])) ?>"><?= e($card['link']) ?></a>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e($page['proof']['label']) ?></p>
            <h2 class="heading"><?= e($page['proof']['title']) ?></h2>
            <p class="support"><?= e($page['proof']['body']) ?></p>
        </div>
        <ul class="check-list">
            <?php foreach ($page['proof']['checks'] as $check): ?>
                <li><?= e($check) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

<section class="section final-cta">
    <div class="shell">
        <p class="eyebrow"><?= e($page['hero']['label']) ?></p>
        <h2 class="heading"><?= e($page['cta']['title']) ?></h2>
        <p class="prose"><?= e($page['cta']['body']) ?></p>
        <div class="button-row center">
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
            <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'platform')) ?>"><?= e(t('site.cta.explore_platform')) ?></a>
        </div>
    </div>
</section>

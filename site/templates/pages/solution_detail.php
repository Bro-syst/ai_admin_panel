<?php

declare(strict_types=1);

$solution = t('pages.solution_details.' . $solutionKey, []);
?>
<section class="page-hero">
    <div class="shell shell--narrow">
        <p class="eyebrow"><?= e($solution['label']) ?></p>
        <h1 class="display"><?= e($solution['title']) ?></h1>
        <p class="lead"><?= e($solution['body']) ?></p>
        <div class="button-row">
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
            <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'solutions')) ?>"><?= e(t('site.cta.view_solutions')) ?></a>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e($solution['summary']['label']) ?></p>
            <h2 class="heading"><?= e($solution['summary']['title']) ?></h2>
            <p class="prose"><?= e($solution['summary']['body']) ?></p>
        </div>
        <div class="spec">
            <?php foreach ($solution['summary']['facts'] as $fact): ?>
                <div>
                    <span class="index"><?= e($fact['metric']) ?></span>
                    <h3><?= e($fact['title']) ?></h3>
                    <p><?= e($fact['text']) ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark">
    <div class="shell">
        <div class="section-head">
            <p class="eyebrow"><?= e($solution['capabilities']['label']) ?></p>
            <h2 class="heading"><?= e($solution['capabilities']['title']) ?></h2>
            <p class="support"><?= e($solution['capabilities']['body']) ?></p>
        </div>
        <div class="matrix">
            <?php foreach ($solution['capabilities']['blocks'] as $index => $block): ?>
                <article class="matrix-card">
                    <span class="index"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <h3><?= e($block['title']) ?></h3>
                    <p><?= e($block['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e($solution['agents']['label']) ?></p>
            <h2 class="heading"><?= e($solution['agents']['title']) ?></h2>
            <p class="support"><?= e($solution['agents']['body']) ?></p>
        </div>
        <ul class="check-list">
            <?php foreach ($solution['agents']['checks'] as $check): ?>
                <li><?= e($check) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

<section class="section band-dark band-deep final-cta">
    <div class="shell">
        <p class="eyebrow"><?= e($solution['label']) ?></p>
        <h2 class="heading"><?= e($solution['cta']['title']) ?></h2>
        <p class="prose"><?= e($solution['cta']['body']) ?></p>
        <div class="button-row center">
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
            <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'solutions')) ?>"><?= e(t('site.cta.view_solutions')) ?></a>
        </div>
    </div>
</section>

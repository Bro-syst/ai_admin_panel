<?php

declare(strict_types=1);

$page = t('pages.agents', []);
$agents = t('pages.home.agents.cards', []);
$checks = t('pages.home.first_service.checks', []);
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
        <div class="matrix">
            <?php foreach ($agents as $index => $agent): ?>
                <article class="matrix-card">
                    <span class="index"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <h3><?= e($agent['title']) ?></h3>
                    <p><?= e($agent['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e(t('pages.home.first_service.label')) ?></p>
            <h2 class="heading"><?= e($page['spotlight']['title']) ?></h2>
            <p class="support"><?= e($page['spotlight']['text']) ?></p>
            <div class="button-row">
                <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
            </div>
        </div>
        <ul class="check-list">
            <?php foreach ($checks as $check): ?>
                <li><?= e($check) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>
</section>

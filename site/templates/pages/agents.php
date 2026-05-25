<?php

declare(strict_types=1);

$page = t('pages.agents', []);
$agents = t('pages.home.agents.cards', []);
$checks = t('pages.home.first_service.checks', []);
?>
<section class="page-hero agents-hero">
    <div class="container narrow">
        <p class="section-label"><?= e($page['hero']['label']) ?></p>
        <h1><?= e($page['hero']['title']) ?></h1>
        <p><?= e($page['hero']['body']) ?></p>
    </div>
</section>
<section class="section agents-list-section">
    <div class="container agent-grid agents-grid">
        <?php foreach ($agents as $index => $agent): ?>
            <article class="agent-card">
                <span class="agent-card-index" aria-hidden="true"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                <h2><?= e($agent['title']) ?></h2>
                <p><?= e($agent['text']) ?></p>
            </article>
        <?php endforeach; ?>
    </div>
</section>
<section class="section proof-section agents-proof-section">
    <div class="container proof-grid">
        <div>
            <p class="section-label"><?= e(t('pages.home.first_service.label')) ?></p>
            <h2><?= e($page['spotlight']['title']) ?></h2>
            <p><?= e($page['spotlight']['text']) ?></p>
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

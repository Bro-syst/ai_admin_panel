<?php

declare(strict_types=1);

$home = t('pages.home', []);
?>
<section class="hero-section">
    <div class="container hero-grid">
        <div class="hero-copy">
            <?php if (($home['hero']['eyebrow'] ?? '') !== ''): ?>
                <p class="eyebrow"><?= e($home['hero']['eyebrow']) ?></p>
            <?php endif; ?>
            <h1 class="hero-statement"><?= e($home['hero']['statement']) ?></h1>
            <p class="hero-body"><?= e($home['hero']['body']) ?></p>
            <div class="button-row">
                <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
                <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'pilot')) ?>"><?= e(t('site.cta.secondary')) ?></a>
            </div>
            <p class="supporting-line"><?= e($home['hero']['supporting']) ?></p>
        </div>
        <div class="platform-visual" aria-label="<?= e($home['hero']['visual_title']) ?>">
            <div class="visual-shell">
                <div class="visual-header">
                    <span><?= e($home['hero']['visual_title']) ?></span>
                    <strong><?= e($home['hero']['visual_badge']) ?></strong>
                </div>
                <div class="visual-stage">
                    <div class="visual-orbital" aria-hidden="true">
                        <span class="visual-ring visual-ring-outer"></span>
                        <span class="visual-ring visual-ring-inner"></span>
                        <span class="visual-axis visual-axis-horizontal"></span>
                        <span class="visual-axis visual-axis-vertical"></span>
                        <div class="agent-node">
                            <small><?= e($home['hero']['visual_core_label']) ?></small>
                            <strong><?= e($home['hero']['visual_title']) ?></strong>
                        </div>
                        <?php foreach ($home['hero']['visual_signal'] as $index => $item): ?>
                            <span class="visual-node visual-node-<?= e((string) ($index + 1)) ?>"><?= e($item) ?></span>
                        <?php endforeach; ?>
                    </div>
                    <div class="visual-caption">
                        <span><?= e($home['hero']['visual_sources'][0]) ?></span>
                        <span><?= e($home['hero']['visual_outputs'][0]) ?></span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="container trust-strip">
        <?php foreach ($home['trust_strip'] as $item): ?>
            <span><?= e($item) ?></span>
        <?php endforeach; ?>
    </div>
</section>

<section class="section scenario-section">
    <div class="container">
        <p class="section-label"><?= e($home['scenario_showcase']['label']) ?></p>
        <div class="section-heading">
            <h2><?= e($home['scenario_showcase']['title']) ?></h2>
            <p><?= e($home['scenario_showcase']['body']) ?></p>
        </div>
        <div class="scenario-grid">
            <?php foreach ($home['scenario_showcase']['cards'] as $scenario): ?>
                <article class="scenario-card">
                    <div class="scenario-top">
                        <span class="scenario-icon" aria-hidden="true"><?= e($scenario['code']) ?></span>
                        <span class="scenario-tag"><?= e($scenario['tag']) ?></span>
                    </div>
                    <h3><?= e($scenario['title']) ?></h3>
                    <p><?= e($scenario['text']) ?></p>
                    <div class="scenario-flow" aria-label="<?= e($scenario['flow_label']) ?>">
                        <?php foreach ($scenario['steps'] as $step): ?>
                            <span><?= e($step) ?></span>
                        <?php endforeach; ?>
                    </div>
                    <p class="scenario-result"><?= e($scenario['result']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
        <div class="section-link-row">
            <a class="text-link" href="<?= e(page_path($currentLocale, 'agents')) ?>"><?= e($home['scenario_showcase']['link']) ?></a>
        </div>
    </div>
</section>

<section class="section compact-section">
    <div class="container">
        <p class="section-label"><?= e($home['business_effect']['label']) ?></p>
        <div class="section-heading">
            <h2><?= e($home['business_effect']['title']) ?></h2>
            <p><?= e($home['business_effect']['body']) ?></p>
        </div>
        <div class="value-grid">
            <?php foreach ($home['business_effect']['cards'] as $card): ?>
                <article class="value-card">
                    <span><?= e($card['metric']) ?></span>
                    <h3><?= e($card['title']) ?></h3>
                    <p><?= e($card['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section proof-section launch-section">
    <div class="container launch-grid">
        <div>
            <p class="section-label"><?= e($home['launch_path']['label']) ?></p>
            <h2><?= e($home['launch_path']['title']) ?></h2>
            <p><?= e($home['launch_path']['body']) ?></p>
        </div>
        <div class="launch-steps">
            <?php foreach ($home['launch_path']['steps'] as $index => $step): ?>
                <article>
                    <span><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <h3><?= e($step['title']) ?></h3>
                    <p><?= e($step['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section surface compact-section">
    <div class="container confidence-grid">
        <div>
            <p class="section-label"><?= e($home['confidence']['label']) ?></p>
            <h2><?= e($home['confidence']['title']) ?></h2>
            <p><?= e($home['confidence']['body']) ?></p>
            <div class="button-row">
                <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'platform')) ?>"><?= e($home['confidence']['platform_link']) ?></a>
                <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'pilot')) ?>"><?= e($home['confidence']['pilot_link']) ?></a>
            </div>
        </div>
        <div class="confidence-stack">
            <?php foreach ($home['confidence']['points'] as $point): ?>
                <article>
                    <h3><?= e($point['title']) ?></h3>
                    <p><?= e($point['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="final-cta">
    <div class="container">
        <h2><?= e($home['final_cta']['title']) ?></h2>
        <p><?= e($home['final_cta']['body']) ?></p>
        <div class="button-row center">
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
            <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'agents')) ?>"><?= e(t('site.cta.view_agents')) ?></a>
        </div>
    </div>
</section>

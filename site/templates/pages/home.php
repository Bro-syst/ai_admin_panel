<?php

declare(strict_types=1);

$home = t('pages.home', []);
$hero = $home['hero'] ?? [];
?>
<section class="hero">
    <div class="shell hero-grid">
        <div class="hero-copy">
            <?php if (($hero['eyebrow'] ?? '') !== ''): ?>
                <p class="eyebrow"><?= e($hero['eyebrow']) ?></p>
            <?php endif; ?>
            <h1 class="display"><?= e($hero['statement']) ?></h1>
            <p class="lead"><?= e($hero['body']) ?></p>
            <div class="button-row">
                <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
                <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'pilot')) ?>"><?= e(t('site.cta.secondary')) ?></a>
            </div>
            <p class="supporting-line"><?= e($hero['supporting']) ?></p>
        </div>
        <div class="console" role="img" aria-label="<?= e($hero['visual_title']) ?>">
            <div class="console-bar">
                <span class="console-id">core.runtime</span>
                <span class="console-title"><?= e($hero['visual_title']) ?></span>
                <span class="status-pill"><?= e($hero['visual_badge']) ?></span>
            </div>
            <dl class="signal-grid">
                <div>
                    <dt><?= e($hero['visual_columns']['input'] ?? 'Input') ?></dt>
                    <dd><?= e(implode(' · ', $hero['visual_sources'] ?? [])) ?></dd>
                </div>
                <div>
                    <dt><?= e($hero['visual_columns']['output'] ?? 'Output') ?></dt>
                    <dd><?= e(implode(' · ', $hero['visual_outputs'] ?? [])) ?></dd>
                </div>
                <div>
                    <dt>Mode</dt>
                    <dd><?= e($hero['visual_badge']) ?></dd>
                </div>
                <div>
                    <dt>Core</dt>
                    <dd><?= e($hero['visual_core_label']) ?></dd>
                </div>
            </dl>
            <div class="console-trace" aria-hidden="true">
                <?php foreach ($hero['visual_signal'] ?? [] as $signal): ?>
                    <span><?= e($signal) ?></span>
                <?php endforeach; ?>
            </div>
        </div>
    </div>
    <div class="shell trust-strip">
        <?php foreach ($home['trust_strip'] as $item): ?>
            <span><?= e($item) ?></span>
        <?php endforeach; ?>
    </div>
</section>

<section class="section">
    <div class="shell">
        <div class="section-head">
            <p class="eyebrow"><?= e($home['scenario_showcase']['label']) ?></p>
            <h2 class="heading"><?= e($home['scenario_showcase']['title']) ?></h2>
            <p class="support"><?= e($home['scenario_showcase']['body']) ?></p>
        </div>
        <div class="matrix cols-2">
            <?php foreach ($home['scenario_showcase']['cards'] as $scenario): ?>
                <article class="matrix-card">
                    <div class="card-meta">
                        <span class="index"><?= e($scenario['code']) ?></span>
                        <span class="card-tag"><?= e($scenario['tag']) ?></span>
                    </div>
                    <h3><?= e($scenario['title']) ?></h3>
                    <p><?= e($scenario['text']) ?></p>
                    <div class="flow" aria-label="<?= e($scenario['flow_label']) ?>">
                        <?php foreach ($scenario['steps'] as $step): ?>
                            <span><?= e($step) ?></span>
                        <?php endforeach; ?>
                    </div>
                    <p class="result-line"><?= e($scenario['result']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
        <p style="margin-top:32px">
            <a class="text-link" href="<?= e(page_path($currentLocale, 'agents')) ?>"><?= e($home['scenario_showcase']['link']) ?></a>
        </p>
    </div>
</section>

<section class="section">
    <div class="shell">
        <div class="section-head">
            <p class="eyebrow"><?= e($home['business_effect']['label']) ?></p>
            <h2 class="heading"><?= e($home['business_effect']['title']) ?></h2>
            <p class="support"><?= e($home['business_effect']['body']) ?></p>
        </div>
        <div class="matrix">
            <?php foreach ($home['business_effect']['cards'] as $card): ?>
                <article class="matrix-card">
                    <span class="index"><?= e($card['metric']) ?></span>
                    <h3><?= e($card['title']) ?></h3>
                    <p><?= e($card['text']) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e($home['launch_path']['label']) ?></p>
            <h2 class="heading"><?= e($home['launch_path']['title']) ?></h2>
            <p class="support"><?= e($home['launch_path']['body']) ?></p>
        </div>
        <div class="spec">
            <?php foreach ($home['launch_path']['steps'] as $index => $step): ?>
                <div>
                    <span class="index"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <h3><?= e($step['title']) ?></h3>
                    <p><?= e($step['text']) ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e($home['confidence']['label']) ?></p>
            <h2 class="heading"><?= e($home['confidence']['title']) ?></h2>
            <p class="support"><?= e($home['confidence']['body']) ?></p>
            <div class="button-row">
                <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'platform')) ?>"><?= e($home['confidence']['platform_link']) ?></a>
                <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'pilot')) ?>"><?= e($home['confidence']['pilot_link']) ?></a>
            </div>
        </div>
        <div class="spec">
            <?php foreach ($home['confidence']['points'] as $point): ?>
                <div>
                    <h3><?= e($point['title']) ?></h3>
                    <p><?= e($point['text']) ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark band-deep final-cta">
    <div class="shell">
        <p class="eyebrow"><?= e(t('site.descriptor')) ?></p>
        <h2 class="heading"><?= e($home['final_cta']['title']) ?></h2>
        <p class="prose"><?= e($home['final_cta']['body']) ?></p>
        <div class="button-row center">
            <a class="button button-primary" href="<?= e(page_path($currentLocale, 'pilot')) ?>#contact"><?= e(t('site.cta.primary')) ?></a>
            <a class="button button-secondary" href="<?= e(page_path($currentLocale, 'agents')) ?>"><?= e(t('site.cta.view_agents')) ?></a>
        </div>
        <p class="cta-meta"><?= e(app_config('brand')) ?> · pilot · syn0rix.com</p>
    </div>
</section>

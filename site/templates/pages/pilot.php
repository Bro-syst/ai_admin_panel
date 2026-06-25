<?php

declare(strict_types=1);

$page = t('pages.pilot', []);
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
        <div class="matrix cols-2">
            <?php foreach ([['code' => '01', 'data' => $page['needs']], ['code' => '02', 'data' => $page['setup']]] as $role): ?>
                <article class="matrix-card">
                    <div class="card-meta">
                        <span class="index"><?= e($role['code']) ?></span>
                        <?php if (($role['data']['tag'] ?? '') !== ''): ?>
                            <span class="card-tag"><?= e($role['data']['tag']) ?></span>
                        <?php endif; ?>
                    </div>
                    <h3><?= e($role['data']['title']) ?></h3>
                    <?php if (($role['data']['summary'] ?? '') !== ''): ?>
                        <p><?= e($role['data']['summary']) ?></p>
                    <?php endif; ?>
                    <ul class="check-list">
                        <?php foreach ($role['data']['items'] as $item): ?>
                            <li><?= e($item) ?></li>
                        <?php endforeach; ?>
                    </ul>
                    <?php if (($role['data']['result'] ?? '') !== ''): ?>
                        <p class="result-line"><?= e($role['data']['result']) ?></p>
                    <?php endif; ?>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section band-dark">
    <div class="shell cols">
        <div class="section-head" style="margin-bottom:0">
            <p class="eyebrow"><?= e(t('pages.home.pilot.label')) ?></p>
            <h2 class="heading"><?= e(t('pages.home.pilot.title')) ?></h2>
            <p class="support"><?= e(t('pages.home.pilot.body')) ?></p>
        </div>
        <div class="spec">
            <?php foreach (t('pages.home.pilot.steps', []) as $index => $step): ?>
                <div>
                    <span class="index"><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <p><?= e($step) ?></p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<section class="section">
    <div class="shell split-section">
        <article>
            <p class="eyebrow"><?= e($page['hero']['label']) ?></p>
            <h2 class="heading"><?= e($page['success']['title']) ?></h2>
            <p><?= e($page['success']['text']) ?></p>
        </article>
        <form class="contact-form" id="contact" method="post" action="/handlers/contact.php">
            <h2 class="heading" style="font-size:1.4rem"><?= e($page['form']['title']) ?></h2>
            <p><?= e($page['form']['text']) ?></p>
            <?php if (($_GET['contact'] ?? '') === 'sent'): ?>
                <p class="form-status success"><?= e($page['form']['sent']) ?></p>
            <?php elseif (($_GET['contact'] ?? '') === 'error'): ?>
                <p class="form-status error"><?= e($page['form']['error']) ?></p>
            <?php endif; ?>
            <input type="hidden" name="csrf_token" value="<?= e(csrf_token()) ?>">
            <input type="hidden" name="redirect" value="<?= e(page_path($currentLocale, 'pilot')) ?>">
            <label>
                <span><?= e($page['form']['fields']['name']) ?></span>
                <input type="text" name="name" autocomplete="name" required>
            </label>
            <label>
                <span><?= e($page['form']['fields']['company']) ?></span>
                <input type="text" name="company" autocomplete="organization">
            </label>
            <label>
                <span><?= e($page['form']['fields']['email']) ?></span>
                <input type="email" name="email" autocomplete="email" required>
            </label>
            <label>
                <span><?= e($page['form']['fields']['use_case']) ?></span>
                <input type="text" name="use_case">
            </label>
            <label>
                <span><?= e($page['form']['fields']['message']) ?></span>
                <textarea name="message" rows="5" required></textarea>
            </label>
            <button class="button button-primary" type="submit"><?= e($page['form']['submit']) ?></button>
        </form>
    </div>
</section>

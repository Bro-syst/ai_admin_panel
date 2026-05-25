<?php

declare(strict_types=1);

$page = t('pages.pilot', []);
?>
<section class="page-hero">
    <div class="container narrow">
        <p class="section-label"><?= e($page['hero']['label']) ?></p>
        <h1><?= e($page['hero']['title']) ?></h1>
        <p><?= e($page['hero']['body']) ?></p>
    </div>
</section>
<section class="section pilot-prep-section">
    <div class="container pilot-role-grid">
        <?php foreach ([['code' => '01', 'data' => $page['needs']], ['code' => '02', 'data' => $page['setup']]] as $role): ?>
            <article class="pilot-role-card">
                <div class="scenario-top">
                    <span class="scenario-icon" aria-hidden="true"><?= e($role['code']) ?></span>
                    <?php if (($role['data']['tag'] ?? '') !== ''): ?>
                        <span class="scenario-tag"><?= e($role['data']['tag']) ?></span>
                    <?php endif; ?>
                </div>
                <h2><?= e($role['data']['title']) ?></h2>
                <?php if (($role['data']['summary'] ?? '') !== ''): ?>
                    <p class="pilot-role-summary"><?= e($role['data']['summary']) ?></p>
                <?php endif; ?>
                <div class="pilot-role-points">
                    <?php foreach ($role['data']['items'] as $index => $item): ?>
                        <div class="pilot-role-point">
                            <span><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                            <p><?= e($item) ?></p>
                        </div>
                    <?php endforeach; ?>
                </div>
                <?php if (($role['data']['result'] ?? '') !== ''): ?>
                    <p class="scenario-result"><?= e($role['data']['result']) ?></p>
                <?php endif; ?>
            </article>
        <?php endforeach; ?>
    </div>
</section>
<section class="section surface pilot-path-section">
    <div class="container pilot-path-grid">
        <div>
            <p class="section-label"><?= e(t('pages.home.pilot.label')) ?></p>
            <h2><?= e(t('pages.home.pilot.title')) ?></h2>
            <p><?= e(t('pages.home.pilot.body')) ?></p>
        </div>
        <div class="pilot-path-steps">
            <?php foreach (t('pages.home.pilot.steps', []) as $index => $step): ?>
                <article>
                    <span><?= e(str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT)) ?></span>
                    <p><?= e($step) ?></p>
                </article>
            <?php endforeach; ?>
        </div>
    </div>
</section>
<section class="section">
    <div class="container split-section">
        <article>
            <h2><?= e($page['success']['title']) ?></h2>
            <p><?= e($page['success']['text']) ?></p>
        </article>
        <form class="contact-form" id="contact" method="post" action="/handlers/contact.php">
            <h2><?= e($page['form']['title']) ?></h2>
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

<?php

declare(strict_types=1);

?>
<!doctype html>
<html lang="<?= e($currentLocale) ?>">
<?php require __DIR__ . '/partials/head.php'; ?>
<body>
    <a class="skip-link" href="#main"><?= e(t('site.skip_link')) ?></a>
    <?php require __DIR__ . '/partials/header.php'; ?>
    <main id="main">
        <?php require __DIR__ . '/pages/' . $currentPage . '.php'; ?>
    </main>
    <?php require __DIR__ . '/partials/footer.php'; ?>
    <script src="/static/script.js" defer></script>
</body>
</html>

<?php

declare(strict_types=1);

$app = require dirname(__DIR__) . '/config/app.php';

require dirname(__DIR__) . '/includes/helpers.php';
require dirname(__DIR__) . '/includes/i18n.php';
require dirname(__DIR__) . '/includes/routing.php';
require dirname(__DIR__) . '/includes/seo.php';

$route = resolve_route();
$currentLocale = $route['locale'];
$currentPage = $route['page'];
$statusCode = $route['status'];

$fallbackTranslations = load_locale((string) $app['default_locale']);
$translations = load_locale($currentLocale);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

if ($statusCode === 404) {
    http_response_code(404);
}

header('Content-Type: text/html; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Referrer-Policy: strict-origin-when-cross-origin');
header('Permissions-Policy: camera=(), microphone=(), geolocation=()');

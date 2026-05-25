<?php

declare(strict_types=1);

$app = require dirname(__DIR__) . '/config/app.php';

require dirname(__DIR__) . '/includes/helpers.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function redirect_with_status(string $redirect, string $status): never
{
    $path = str_starts_with($redirect, '/') ? $redirect : '/pilot/';
    $separator = str_contains($path, '?') ? '&' : '?';

    header('Location: ' . $path . $separator . 'contact=' . rawurlencode($status) . '#contact', true, 303);
    exit;
}

$redirect = (string) ($_POST['redirect'] ?? '/pilot/');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    redirect_with_status($redirect, 'error');
}

$token = isset($_POST['csrf_token']) ? (string) $_POST['csrf_token'] : null;

if (!csrf_is_valid($token)) {
    redirect_with_status($redirect, 'error');
}

$fields = [
    'name' => trim((string) ($_POST['name'] ?? '')),
    'company' => trim((string) ($_POST['company'] ?? '')),
    'email' => trim((string) ($_POST['email'] ?? '')),
    'use_case' => trim((string) ($_POST['use_case'] ?? '')),
    'message' => trim((string) ($_POST['message'] ?? '')),
];

if ($fields['name'] === '' || $fields['message'] === '' || !filter_var($fields['email'], FILTER_VALIDATE_EMAIL)) {
    redirect_with_status($redirect, 'error');
}

foreach ($fields as $key => $value) {
    $fields[$key] = mb_substr($value, 0, $key === 'message' ? 3000 : 240);
}

$logDir = dirname(__DIR__) . '/storage/logs';

if (!is_dir($logDir)) {
    mkdir($logDir, 0775, true);
}

$entry = [
    'created_at' => gmdate('c'),
    'source' => 'site-contact-form',
    'fields' => $fields,
    'ip_hash' => hash('sha256', (string) ($_SERVER['REMOTE_ADDR'] ?? '')),
];

file_put_contents(
    $logDir . '/contact-' . gmdate('Y-m') . '.jsonl',
    json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

redirect_with_status($redirect, 'sent');

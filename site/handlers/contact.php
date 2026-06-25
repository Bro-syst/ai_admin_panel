<?php

declare(strict_types=1);

$app = require dirname(__DIR__) . '/config/app.php';

require dirname(__DIR__) . '/includes/helpers.php';

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function redirect_with_status(string $redirect, string $status): never
{
    $path = str_starts_with($redirect, '/')
        && !str_starts_with($redirect, '//')
        && !str_contains($redirect, "\r")
        && !str_contains($redirect, "\n")
        ? $redirect
        : '/pilot/';
    $separator = str_contains($path, '?') ? '&' : '?';

    header('Location: ' . $path . $separator . 'contact=' . rawurlencode($status) . '#contact', true, 303);
    exit;
}

function sanitize_mail_header_value(string $value): string
{
    return trim((string) preg_replace('/[\r\n]+/', ' ', $value));
}

function encode_mail_header(string $value): string
{
    return mb_encode_mimeheader(sanitize_mail_header_value($value), 'UTF-8', 'B', "\r\n");
}

function mailbox_header(string $email, string $name = ''): string
{
    $safeEmail = filter_var($email, FILTER_VALIDATE_EMAIL);

    if (!is_string($safeEmail)) {
        return '';
    }

    $safeName = sanitize_mail_header_value($name);

    return $safeName === '' ? $safeEmail : encode_mail_header($safeName) . ' <' . $safeEmail . '>';
}

function normalize_email_body(string $body): string
{
    return str_replace("\n", "\r\n", str_replace(["\r\n", "\r"], "\n", $body));
}

function smtp_read_response(mixed $socket): array
{
    $response = '';
    $code = 0;

    while (($line = fgets($socket, 515)) !== false) {
        $response .= $line;
        $code = (int) substr($line, 0, 3);

        if (!isset($line[3]) || $line[3] !== '-') {
            break;
        }
    }

    return [$code, $response];
}

function smtp_expect(mixed $socket, array $expectedCodes): bool
{
    [$code] = smtp_read_response($socket);

    return in_array($code, $expectedCodes, true);
}

function smtp_command(mixed $socket, string $command, array $expectedCodes): bool
{
    if (fwrite($socket, $command . "\r\n") === false) {
        return false;
    }

    return smtp_expect($socket, $expectedCodes);
}

function smtp_data_payload(string $message): string
{
    $lines = explode("\r\n", normalize_email_body($message));

    foreach ($lines as $index => $line) {
        if (str_starts_with($line, '.')) {
            $lines[$index] = '.' . $line;
        }
    }

    return implode("\r\n", $lines) . "\r\n.";
}

/**
 * @param array{host?:string,port?:int,username?:string,password?:string,encryption?:string,timeout?:int} $smtp
 */
function send_contact_email_via_smtp(array $smtp, string $from, string $to, string $message): bool
{
    $host = trim((string) ($smtp['host'] ?? ''));
    $port = (int) ($smtp['port'] ?? 587);
    $username = trim((string) ($smtp['username'] ?? ''));
    $password = (string) ($smtp['password'] ?? '');
    $timeout = max(3, (int) ($smtp['timeout'] ?? 12));
    $encryption = strtolower(trim((string) ($smtp['encryption'] ?? 'starttls')));

    if ($host === '' || $port <= 0 || $username === '' || $password === '') {
        return false;
    }

    $transport = $encryption === 'ssl' ? 'ssl' : 'tcp';
    $socket = @stream_socket_client($transport . '://' . $host . ':' . $port, $errno, $error, $timeout);

    if (!is_resource($socket)) {
        return false;
    }

    stream_set_timeout($socket, $timeout);
    $serverName = sanitize_mail_header_value((string) ($_SERVER['SERVER_NAME'] ?? 'syn0rix.com'));

    if (!smtp_expect($socket, [220])) {
        fclose($socket);
        return false;
    }

    if (!smtp_command($socket, 'EHLO ' . ($serverName !== '' ? $serverName : 'syn0rix.com'), [250])) {
        fclose($socket);
        return false;
    }

    if ($encryption === 'starttls') {
        if (!smtp_command($socket, 'STARTTLS', [220])) {
            fclose($socket);
            return false;
        }

        if (@stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) !== true) {
            fclose($socket);
            return false;
        }

        if (!smtp_command($socket, 'EHLO ' . ($serverName !== '' ? $serverName : 'syn0rix.com'), [250])) {
            fclose($socket);
            return false;
        }
    }

    if (
        !smtp_command($socket, 'AUTH LOGIN', [334])
        || !smtp_command($socket, base64_encode($username), [334])
        || !smtp_command($socket, base64_encode($password), [235])
        || !smtp_command($socket, 'MAIL FROM:<' . $from . '>', [250])
        || !smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251])
        || !smtp_command($socket, 'DATA', [354])
    ) {
        fclose($socket);
        return false;
    }

    if (fwrite($socket, smtp_data_payload($message) . "\r\n") === false || !smtp_expect($socket, [250])) {
        fclose($socket);
        return false;
    }

    smtp_command($socket, 'QUIT', [221]);
    fclose($socket);

    return true;
}

/**
 * @param array{name:string,company:string,email:string,use_case:string,message:string} $fields
 * @param array<string,mixed> $entry
 * @param array<string,mixed> $app
 * @return array{sent:bool,method:string}
 */
function send_contact_email(array $app, array $fields, array $entry, string $redirect): array
{
    $to = filter_var((string) ($app['contact_email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $from = filter_var((string) ($app['contact_from_email'] ?? ''), FILTER_VALIDATE_EMAIL);

    if (!is_string($to) || !is_string($from)) {
        return ['sent' => false, 'method' => 'invalid-config'];
    }

    $brand = sanitize_mail_header_value((string) ($app['brand'] ?? 'syn0rix'));
    $subject = 'Новая заявка с сайта syn0rix.com';
    $body = implode("\n", [
        'Новая заявка с сайта syn0rix.com',
        '',
        'Имя: ' . $fields['name'],
        'Компания: ' . ($fields['company'] !== '' ? $fields['company'] : '-'),
        'Email: ' . $fields['email'],
        'Задача: ' . ($fields['use_case'] !== '' ? $fields['use_case'] : '-'),
        '',
        'Сообщение:',
        $fields['message'],
        '',
        'Источник: ' . $redirect,
        'Время UTC: ' . (string) ($entry['created_at'] ?? ''),
        'IP hash: ' . (string) ($entry['ip_hash'] ?? ''),
    ]);

    $encodedBody = chunk_split(base64_encode(normalize_email_body($body)));
    $headers = [
        'Date: ' . date(DATE_RFC2822),
        'To: ' . mailbox_header($to),
        'From: ' . mailbox_header($from, $brand),
        'Reply-To: ' . mailbox_header($fields['email'], $fields['name']),
        'Subject: ' . encode_mail_header($subject),
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'X-Mailer: syn0rix-site-contact',
    ];
    $message = implode("\r\n", $headers) . "\r\n\r\n" . $encodedBody;

    if (is_array($app['contact_smtp'] ?? null) && (string) (($app['contact_smtp']['password'] ?? '')) !== '') {
        return [
            'sent' => send_contact_email_via_smtp($app['contact_smtp'], $from, $to, $message),
            'method' => 'smtp',
        ];
    }

    $mailHeaders = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        'Content-Transfer-Encoding: base64',
        'From: ' . mailbox_header($from, $brand),
        'Reply-To: ' . mailbox_header($fields['email'], $fields['name']),
        'X-Mailer: PHP/' . PHP_VERSION,
    ];

    return [
        'sent' => @mail($to, encode_mail_header($subject), $encodedBody, implode("\r\n", $mailHeaders)),
        'method' => 'mail',
    ];
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

$mailResult = send_contact_email($app, $fields, $entry, $redirect);
$entry['mail'] = [
    'sent' => $mailResult['sent'],
    'method' => $mailResult['method'],
    'to' => (string) ($app['contact_email'] ?? ''),
];

file_put_contents(
    $logDir . '/contact-' . gmdate('Y-m') . '.jsonl',
    json_encode($entry, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

redirect_with_status($redirect, $mailResult['sent'] ? 'sent' : 'error');

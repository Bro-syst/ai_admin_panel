# DevOps: развертывание сайта на сервере

Статус: `production-runbook`

## 1. Назначение

Этот документ описывает правильный порядок разворачивания сайта `syn0rix.com`
на production-сервере. Сайт является обычным PHP-проектом без Node.js, Composer,
базы данных и frontend-сборки.

Текущий production-контур:

- Hetzner Webhosting, hosting server `www720.your-server.de`;
- document root в konsoleH/WebFTP: `/public_html/`;
- DNS в Cloudflare;
- публичные web-записи Cloudflare включены как `Proxied`;
- Cloudflare SSL/TLS mode: `Full (strict)`;
- HTTPS redirect включен в Hetzner и `Always Use HTTPS` включен в Cloudflare.

Основные требования:

- PHP `8.3+`, предпочтительно `8.4`;
- web-сервер Apache или Nginx;
- HTTPS для публичного домена;
- закрытый внешний доступ к служебным директориям;
- writable-директория `storage/logs`;
- SMTP-переменные окружения для отправки заявок.

## 2. Структура production-директории

Для текущего Hetzner Webhosting корень сайта:

```text
/public_html/
```

Внутри должны лежать runtime-файлы проекта:

```text
index.php
robots.txt
sitemap.xml
.htaccess
config/
includes/
locales/
templates/
handlers/
assets/
static/
storage/
```

`router.php` нужен только для локальной разработки и не является production
entrypoint. Production-запросы идут в `index.php`.

## 3. Что выкладывать

В production нужно выкладывать:

- PHP-файлы сайта;
- `config/`, `includes/`, `locales/`, `templates/`, `handlers/`;
- публичные ассеты `assets/`, `static/`;
- `robots.txt`, `sitemap.xml`, `.htaccess`;
- документацию можно выкладывать только если доступ к `docs/` закрыт сервером.

Не нужно выкладывать:

- `.git/`;
- временные файлы IDE;
- архивы из `deploy/`;
- рабочие документы `docs/`, `content/`, `TZ/`;
- локальные логи;
- `.env` с секретами;
- любые файлы с SMTP-паролями.

## 4. Переменные окружения

Секреты не хранятся в репозитории. Для формы заявки SMTP должен задаваться
через переменные окружения на сервере:

```bash
CONTACT_EMAIL=sales@syn0rix.com
CONTACT_FROM_EMAIL=sales@syn0rix.com
CONTACT_SMTP_HOST=mail.your-server.de
CONTACT_SMTP_PORT=587
CONTACT_SMTP_USERNAME=sales@syn0rix.com
CONTACT_SMTP_PASSWORD=********
```

Важно:

- пароль нельзя записывать в `config/app.php`;
- пароль нельзя добавлять в `.htaccess`;
- пароль нельзя класть в `docs/`, `deploy/`, `content/` или архив релиза;
- после передачи пароля в чат или задачу его лучше заменить в почтовой панели.

Для PHP-FPM переменные обычно задаются в pool-конфиге, systemd unit, панели
хостинга или отдельном server-side secrets/env-механизме. После изменения env
нужно перезапустить PHP-FPM или соответствующий service.

На shared-хостинге Hetzner нужно сначала проверить доступный server-side
механизм для env/secrets в панели. Если такой механизм недоступен, SMTP-пароль
нельзя добавлять в release-архив. Для текущего Hetzner Webhosting используется
server-only файл:

```text
/public_html/storage/secrets.php
```

Он не входит в репозиторий и не попадает в release-архив. Директория
`storage/` закрыта `.htaccess`, поэтому файл не должен отдаваться по HTTP.

Содержимое файла:

```php
<?php

return [
    'CONTACT_EMAIL' => 'sales@syn0rix.com',
    'CONTACT_FROM_EMAIL' => 'sales@syn0rix.com',
    'CONTACT_SMTP_HOST' => 'mail.your-server.de',
    'CONTACT_SMTP_PORT' => 587,
    'CONTACT_SMTP_USERNAME' => 'sales@syn0rix.com',
    'CONTACT_SMTP_PASSWORD' => '********',
];
```

Без `CONTACT_SMTP_PASSWORD` форма перейдет на fallback через PHP `mail()`, но
production-доставка должна проверяться именно через SMTP.

## 5. Права на файлы

Пример базовых прав:

```bash
chown -R www-data:www-data /var/www/syn0rix.com/site
find /var/www/syn0rix.com/site -type d -exec chmod 755 {} \;
find /var/www/syn0rix.com/site -type f -exec chmod 644 {} \;
mkdir -p /var/www/syn0rix.com/site/storage/logs
chmod -R 775 /var/www/syn0rix.com/site/storage
```

Пользователь web-сервера должен иметь право писать в:

```text
storage/logs/
```

Остальные директории не должны быть writable для web-процесса без необходимости.

## 6. Apache

Для Apache должен быть включен `mod_rewrite`. Корень сайта можно направить
прямо в директорию проекта, если `.htaccess` включен и работает.

Минимальный VirtualHost:

```apache
<VirtualHost *:443>
    ServerName syn0rix.com
    ServerAlias www.syn0rix.com
    DocumentRoot /var/www/syn0rix.com/site

    <Directory /var/www/syn0rix.com/site>
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog ${APACHE_LOG_DIR}/syn0rix-error.log
    CustomLog ${APACHE_LOG_DIR}/syn0rix-access.log combined
</VirtualHost>
```

Файл `.htaccess` должен:

- направлять чистые URL в `index.php`;
- запрещать листинг директорий;
- закрывать доступ к `config`, `includes`, `storage`, `content`, `docs`, `TZ`,
  `templates`, `locales`, `deploy`.

## 7. Nginx

Для Nginx правила из `.htaccess` не работают, поэтому запреты нужно прописать в
server block.

Пример:

```nginx
server {
    listen 443 ssl http2;
    server_name syn0rix.com www.syn0rix.com;
    root /var/www/syn0rix.com/site;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ ^/(config|includes|storage|content|docs|TZ|templates|locales|deploy)(/|$) {
        deny all;
        return 403;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    }

    location ~* \.(css|js|svg|png|jpg|jpeg|webp|ico|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

Версию сокета `php8.4-fpm.sock` нужно заменить на фактическую версию PHP-FPM на
сервере.

## 8. Деплой через rsync

Для VPS предпочтителен `rsync`.

Пример выкладки с локальной машины:

```bash
rsync -av --delete \
  --exclude ".git/" \
  --exclude "storage/logs/" \
  --exclude "deploy/" \
  --exclude ".env" \
  /local/path/site/ \
  user@server:/var/www/syn0rix.com/site/
```

После rsync нужно проверить права на `storage/logs` и перезапустить PHP-FPM,
если менялись env-переменные.

Для текущего Hetzner Webhosting используется FTP/SFTP-деплой в `/public_html/`.
Выкладываются только runtime-директории и файлы:

```text
.htaccess
index.php
robots.txt
sitemap.xml
assets/
config/
handlers/
includes/
locales/
static/
templates/
```

Не перезатирать и не удалять `storage/logs/`, потому что там production-логи
заявок.

## 9. Деплой архивом

Если используется zip-архив:

1. собрать архив без `.git`, `.env`, `storage/logs`, `deploy`, `docs`,
   `content`, `TZ`;
2. загрузить архив на сервер во временную директорию;
3. распаковать содержимое прямо в `/public_html/`;
4. проверить `.htaccess` или Nginx-запреты;
5. проверить сайт;
6. удалить архив с сервера.

Пароли и SMTP-секреты не должны попадать в архив.

## 10. Проверка после деплоя

Проверить HTTP-статусы:

```bash
curl -I https://syn0rix.com/
curl -I https://syn0rix.com/en/
curl -I https://syn0rix.com/ru/
curl -I https://syn0rix.com/ru/solutions/
curl -I https://syn0rix.com/ru/solutions/dc/
curl -I https://syn0rix.com/ru/pilot/
curl -I https://syn0rix.com/static/styles.css
```

Проверить, что служебные директории закрыты:

```bash
curl -I https://syn0rix.com/config/app.php
curl -I https://syn0rix.com/includes/bootstrap.php
curl -I https://syn0rix.com/storage/logs/
curl -I https://syn0rix.com/locales/ru.php
curl -I https://syn0rix.com/deploy/
```

Ожидаемый результат для служебных путей: `403 Forbidden` или другой запретный
ответ, но не `200 OK`.

Проверить sitemap и robots:

```bash
curl -I https://syn0rix.com/sitemap.xml
curl -I https://syn0rix.com/robots.txt
```

Проверить форму заявки:

1. открыть `https://syn0rix.com/ru/pilot/#contact`;
2. отправить тестовую заявку;
3. убедиться, что письмо пришло на `CONTACT_EMAIL`;
4. проверить, что в `storage/logs/contact-YYYY-MM.jsonl` появилась запись;
5. убедиться, что в записи `mail.sent` равно `true`, а `mail.method` равно
   `smtp`.

## 11. Типовые проблемы

Если форма показывает ошибку после отправки:

- не задан `CONTACT_SMTP_PASSWORD`;
- PHP-FPM не перезапущен после изменения env;
- сервер не может подключиться к `mail.your-server.de:587`;
- SMTP-логин или пароль неверные;
- STARTTLS блокируется firewall;
- почтовый сервер отклоняет `From`, если он не совпадает с SMTP-аккаунтом.

Если страницы открываются, но чистые URL не работают:

- Apache: не включен `mod_rewrite` или `AllowOverride All`;
- Nginx: нет `try_files $uri $uri/ /index.php?$query_string`;
- сайт развернут не в том document root.

Если не пишутся логи:

- нет директории `storage/logs`;
- у web-пользователя нет права записи;
- `storage/` смонтирован read-only.

## 12. Минимальный release checklist

Перед публикацией проверить:

- `php -l` для измененных PHP-файлов;
- `sitemap.xml` валиден;
- `robots.txt` не закрывает нужные страницы;
- `base_url` в `config/app.php` указывает на `https://syn0rix.com`;
- SMTP env заданы вне репозитория;
- форма отправляет письмо;
- служебные директории не доступны из web;
- `storage/logs` writable;
- HTTPS включен;
- Cloudflare DNS для `syn0rix.com` и `www` в режиме `Proxied`;
- Cloudflare SSL/TLS mode равен `Full (strict)`;
- canonical и hreflang отдают production-домен;
- нет PHP warnings в error log.

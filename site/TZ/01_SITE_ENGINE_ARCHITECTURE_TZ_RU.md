# ТЗ: движок многоязычного сайта

Статус: `draft`

## 1. Задача

Создать основу сайта на PHP для простого развертывания у хостера.
На этом этапе не требуется писать финальный контент страниц. Нужно подготовить
архитектуру, директории, локализацию, SEO-базу и правила расширения.

## 2. Языки v1

- `ru` - базовый язык;
- `en` - English;
- `es` - Spanish.

## 3. Технологическое решение

Использовать:

- PHP 8.4 как предпочтительную версию;
- PHP 8.3 как минимальную production-версию;
- серверный рендеринг HTML;
- файловые словари локализации;
- CSS и vanilla JS;
- без базы данных для v1;
- без frontend-фреймворков для v1.

## 4. Обязательные директории

```text
config/
includes/
locales/
templates/
handlers/
assets/
static/
storage/logs/
content/
docs/
TZ/
```

## 5. Обязательные возможности движка

- определение текущего языка по URL;
- загрузка словаря выбранного языка;
- fallback на `ru`;
- helper для безопасного вывода текста;
- helper для получения перевода по ключу;
- генерация ссылок на языковые версии;
- генерация canonical/hreflang;
- подключение SEO-метаданных из локали;
- генерация Open Graph и Twitter Card;
- генерация JSON-LD для базовых сущностей;
- единый layout для страниц;
- поддержка будущих страниц `platform`, `agents`, `pilot`;
- подготовка к форме заявки через отдельный handler.

## 6. URL-модель

```text
/        ru home
/en/     en home
/es/     es home
```

Будущие страницы:

```text
/platform/
/agents/
/pilot/
/en/platform/
/en/agents/
/en/pilot/
/es/platform/
/es/agents/
/es/pilot/
```

## 7. SEO-требования

Для каждой страницы и локали:

- `title`;
- `meta description`;
- canonical;
- hreflang с self-reference и абсолютными URL;
- `x-default`;
- Open Graph;
- Twitter Card;
- JSON-LD;
- sitemap entry;
- localized alt-тексты.

## 8. Производительность и браузеры

- Цель Core Web Vitals: `LCP <= 2.5s`, `INP <= 200ms`, `CLS <= 0.1`.
- Основной HTML-контент должен быть доступен без JavaScript.
- Нельзя lazy-load LCP-изображение первого экрана.
- Изображения должны иметь размеры или `aspect-ratio`.
- Крупные изображения должны поддерживать responsive variants.
- Должны быть gzip/brotli, кеширование ассетов и корректные content types.
- Сайт должен проверяться в Chrome, Safari, Firefox, Edge, iOS Safari и Android Chrome.

## 9. Требования безопасности

- Все выводимые строки экранировать в правильном контексте.
- Формы валидировать на сервере.
- Для форм использовать CSRF и rate limit.
- Не хранить секреты в репозитории.
- Закрыть внешний доступ к `config`, `includes`, `storage`, `content`, `docs`, `TZ`.
- Настроить security headers: `Content-Security-Policy`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security` после HTTPS.

## 10. Ограничения

- Нельзя делать отдельную независимую копию сайта для каждого языка.
- Нельзя хранить видимый текст напрямую в шаблонах.
- Нельзя строить локализацию через JavaScript после загрузки страницы.
- Нельзя добавлять сборщик или Node.js-зависимость без отдельного решения.
- Нельзя хранить секреты в репозитории.
- Нельзя считать `meta keywords` обязательным SEO-фактором.

## 11. Ориентир

Архитектурный ориентир:

```text
/Volumes/Work/DV/ web_kassa/site
```

Из него можно брать подходы:

- `config/app.php`;
- `locales/*.php`;
- `includes/bootstrap.php`;
- helper-функции переводов и SEO;
- языковые entry points;
- sitemap/robots;
- документационные правила.

Но новый сайт должен быть компактнее, потому что v1 поддерживает только
`ru/en/es` и еще не требует полного legal-пакета.

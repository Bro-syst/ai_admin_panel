# Site Runtime Content Catalog

Статус: `structured-for-runtime-v1`

Этот каталог добавлен поверх исходных редакционных документов из `content/`.
Исходные markdown-файлы остаются source of truth для смысла и позиционирования,
а этот каталог фиксирует, как контент переложен в структуру текущего сайта.

## Runtime mapping

- `content/01_SITE_FOCUS_AND_POSITIONING_RU.md` -> общая логика
  позиционирования, meta, tone of voice и ограничения.
- `content/02_SITE_STRUCTURE_AND_SITEMAP_RU.md` -> набор страниц:
  `home`, `platform`, `agents`, `pilot`.
- `content/03_HOMEPAGE_COPY_RU.md` -> основная русская локаль
  `locales/ru.php`, блок `pages.home`.
- `content/04_CTA_AND_SHORT_COPY_RU.md` -> `site.cta`, `site.nav`,
  form copy, footer copy и короткие подписи.

## Runtime files

- `locales/ru.php` - основная production-copy на русском.
- `locales/en.php` - рабочая английская версия с той же структурой ключей.
- `locales/es.php` - рабочая испанская версия с той же структурой ключей.
- `templates/pages/home.php` - homepage narrative.
- `templates/pages/platform.php` - supporting page про платформу.
- `templates/pages/agents.php` - supporting page про agent categories.
- `templates/pages/pilot.php` - pilot/contact page.

## Snapshots

- `2026-05-16_RU_SITE_COPY_BEFORE_HITECH_REDESIGN.md` - русская версия
  продающего контента перед визуальным hi-tech редизайном.
- `snapshots/2026-05-16/` - раздельный снимок контента всех русских страниц:
  `home`, `platform`, `agents`, `pilot/contact`.

## Content preservation rule

Не редактировать старые markdown-документы ради runtime-верстки. Если нужно
менять публичный текст, сначала обновить соответствующий ключ в `locales/`,
а затем при необходимости синхронизировать редакционный source document.

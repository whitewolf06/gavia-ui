# Публичная документация Gavia UI

## Что публикуется

В GitHub Pages публикуется playground: главная, Docs с руководствами
по 53 компонентам, 113 SVG-иконок, пять тем, дизайн-система,
рабочие примеры с кодом и шесть сценариев. Автор, лицензия MIT
и ссылки для участников указаны на главной. Страница Changelog
читает историю из корневого CHANGELOG.md.
Отдельный генератор документации, роутер и новые runtime-зависимости не используются.

Витрина опубликована в GitHub Pages: [Gavia UI](https://whitewolf06.github.io/gavia-ui/).
В каноническом репозитории включён **Source: GitHub Actions**; публичный адрес
и production-ресурсы проверены после деплоя на desktop и mobile.
Библиотека доступна в [публичном npm](https://www.npmjs.com/package/gavia-ui).
Первый выпуск 0.7.0 опубликован 2026-10-05 (Москва); текущий подтверждённый
выпуск — 0.11.0. Установка: `pnpm add gavia-ui@0.11.0`.
[История публикаций и проверок](releases.md).

## Настройка публикации

В репозитории `whitewolf06/gavia-ui` открыть **Settings → Pages → Build and deployment**
и выбрать **Source: GitHub Actions**. В каноническом репозитории эта настройка
уже выполнена. Действие выполняет владелец репозитория или агент после разрешения
на публикацию сайта. Домен и DNS настраивать не требуется.

Job `pages` в `.github/workflows/publish.yml` запускается только при push в main
канонического репозитория. Он зависит от `verify`, `browser` и `visual`: проверки
должны пройти на том же коммите. Затем job собирает библиотеку и playground с
`base=/gavia-ui/`, проверяет production-сайт в Chromium desktop/mobile и загружает
только `apps/playground/dist` через официальные Pages actions.

Перед deploy SHA сверяется с текущим main; повторный запуск старой сборки не
должен заменять свежую документацию. Concurrency относится только к Pages.
PR, fork и release tag не публикуют сайт. Настройка npm и его публикация остаются
отдельным процессом, описанным в [releases.md](releases.md).

## Локальная проверка production

```sh
pnpm build
pnpm build:pages
pnpm test:pages
```

Тест запускает собственный Vite preview на порту 4175. Для ручного просмотра:

```sh
pnpm --filter gavia-ui-playground exec vite preview --base=/gavia-ui/ --host 127.0.0.1 --port 4175 --strictPort
```

Открыть `http://127.0.0.1:4175/gavia-ui/`. Уже запущенный preview можно передать
через `GAVIA_PAGES_BASE_URL`. Если Windows не запускает Playwright headless shell,
`GAVIA_E2E_CHROMIUM_CHANNEL=chromium` выбирает полную закреплённую версию Chromium.
Обычный `pnpm dev` сохраняет адрес в корне и не требует подпути.

## Навигация и история

- Главная: `/gavia-ui/`.
- Docs: `/gavia-ui/?view=docs`.
- Основы: `/gavia-ui/?view=docs&section=typography`, `section=layout`, `section=content`.
- Первая полная страница компонента: `/gavia-ui/?view=docs&component=WlButton`.
- Каталог компонентов: `/gavia-ui/?view=docs`; прежний `?view=components` открывает Docs.
- Дизайн-система: `/gavia-ui/?view=system`.
- Changelog: `/gavia-ui/?view=changelog`.
- История сразу: `/gavia-ui/?view=changelog#project-changelog`.
- Прежний `/gavia-ui/?view=project` сохраняется как совместимый адрес истории.

Переходы через query сохраняют подпуть. Обновление страницы и Back/Forward
работают с одним index.html; серверный fallback не нужен. Подпункты выбранного раздела Docs ведут
к его h2-якорям и сохраняют query-маршрут. Логотип, CSS и lazy-примеры проходят через
Vite, без абсолютных файловых путей. Ссылки из changelog на Markdown-документацию
преобразуются в абсолютные GitHub URL.

После деплоя откройте публичный URL и проверьте ресурсы, переходы и пример.
Успешная сборка сама по себе не подтверждает, что сайт доступен.

## Обновление

Сначала записать пользовательские изменения в «Не выпущено» корневого changelog
и синхронизировать пакетную копию с абсолютными ссылками. Версии на странице
читаются из метаданных пакета; дату выпуска не выводить из даты сборки.
После согласованного commit/push в main сайт обновится только при успешном CI.

## Если понадобится другой хостинг

Та же статическая сборка подходит для Cloudflare Pages или Netlify. Для корня
домена собирать `pnpm build:playground` и публиковать `apps/playground/dist`.
Смена хостинга не требует изменений компонентов. Текущая витрина размещается в GitHub Pages.

Официальные инструкции: [Vite / GitHub Pages](https://vite.dev/guide/static-deploy.html#github-pages),
[GitHub / custom Pages workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

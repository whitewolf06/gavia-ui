# 08. Сборка, CI/CD и релизный процесс

[← к оглавлению](README.md)

## Оценка: 8.5/10

### Что сделано очень хорошо

- **Гейт обратной совместимости.** `verify:compatibility` сравнивает собранные `.d.ts` с неизменяемыми снапшотами (0.9.1, 0.11.1). Миграционный контракт 0.11 ограничен по версии, есть тест, что проверка ловит поломки. Такое редко встречается даже в крупных проектах.
- **Проверка собранного архива как у пользователя:**
  - pnpm, npm, Bun;
  - Vue 3.4.0 + TS 5.4.5 и Vue 3.5;
  - strict-шаблоны, `skipLibCheck: false`;
  - позитивные и негативные type-фикстуры;
  - браузерная гидрация.
- **Публикация только по тегу**, через OIDC trusted publishing с `--provenance`. Перед публикацией проверяется тот самый архив, который уходит в npm (хэш фиксируется).
- **Pages деплоится только после всех гейтов**, плюс проверка, что коммит всё ещё HEAD `main` (защита от гонки).
- Отчёт о качестве (`quality-report.generated.json`) создаётся CI и попадает на сайт.
- Changesets подключён для ввода заметок.

### CI-1. Монолитный workflow на 433 строки · P1 · M

`.github/workflows/publish.yml` делает всё: verify (Node 18/24), browser (4 проекта), visual (Windows), consumer (npm/Bun), pages, publish, release-preview. Шаг setup (`checkout` → `pnpm/action-setup` → `setup-node` → `install --frozen-lockfile` → `pnpm build`) повторён 7 раз. Имя `publish` вводит в заблуждение: на каждом PR в бейдже и интерфейсе висит «publish».

**Решение:**

```
.github/
  actions/setup/action.yml        # composite: pnpm + node + cache + install (+ опционально build)
  workflows/
    ci.yml                        # PR и main: lint, typecheck, unit, compatibility, package, browser, visual, consumer
    pages.yml                     # workflow_run после ci на main → build:pages, test:pages, deploy
    release.yml                   # tags v*: проверка архива, publish, GitHub Release, preview
```

Плюсы:
- понятные бейджи (`CI`, `Release`);
- можно перезапускать Pages независимо;
- `release.yml` проще проверять глазами — это самый чувствительный файл;
- `concurrency` для PR: `group: ci-${{ github.ref }}`, `cancel-in-progress: true` (сейчас отменяется только Pages).

### CI-2. Node 18 в матрице и `engines` · **P0** · S

Поддержка Node 18 закончилась в апреле 2025. В CI матрица `[18, 24]`, `engines: ">=18"`. Это блокирует обновление тулчейна: Vite 7+ требует Node 20.19+.

**Решение:** матрица `[20, 22, 24]` (или `[20, 24]`), `engines.node: ">=20.19"`. Убрать обходы для Node 18 (комментарий в `css-contract.test.ts` про `URL` на Node 18). `engines` относится к разработке репозитория. Пользователей библиотеки это не касается, их ограничивает бандлер.

### CI-3. Нет lint-, size- и attw-проверок · P1 · S

Добавить в `ci.yml` (job verify, в начале, это быстрые шаги):
- `pnpm lint` ([LINT-1](02-code-style-and-lint.md));
- `pnpm size` ([PERF-8](07-performance-and-bundle.md#perf-8-бюджет-размера-в-ci--p1--s));
- `pnpm dlx @arethetypeswrong/cli --pack packages/ui-kit` ([PKG-2](07-performance-and-bundle.md));
- `pnpm dlx publint packages/ui-kit` (сейчас проходит, пусть так и остаётся).

### CI-4. Обновление зависимостей · P1 · S (настроить) / M (обновить)

`pnpm -r outdated` на момент ревью:

| Пакет | Сейчас | Последняя |
|---|---|---|
| vite | 6.4.3 | **8.3.4** |
| @vitejs/plugin-vue | 5.2.4 | 6.0.10 |
| vitest / @vitest/coverage-v8 | 3.2.x | **5.0.5** |
| typescript | 5.8.3 | **7.0.2** |
| vue-tsc | 2.2.x | 3.x |
| vite-plugin-dts | 4.5.4 | 5.1.2 |
| jsdom | 26.1.0 | 30.1.3 |
| @playwright/test | 1.58.2 | 1.64.1 |
| @changesets/cli | 2.31.1 | 3.0.3 |
| vue-i18n (playground) | 11.3.0 | 11.4.14 |

`vue@3.4.38` в devDependencies — это **намеренно** минимальная версия для тестов, её не трогать (или поднять вместе с решением PERF-1).

**Решение:**
- `renovate.json` (или `.github/dependabot.yml`): группировка (vite + plugin-vue + vitest; typescript + vue-tsc; playwright + axe), расписание раз в неделю, automerge для patch dev-зависимостей при зелёном CI;
- обновлять по одной группе за PR. TypeScript 7 (нативный компилятор) и vue-tsc 3 обновлять последними и только с прогоном consumer-фикстур ([ARCH-2](01-architecture.md)).

### CI-5. Визуальные эталоны только на Windows · P2 · M

Эталоны снимаются и сравниваются на `windows-2022` (Chromium). Контрибьютор на macOS или Linux не может обновить PNG локально так, чтобы они совпали.

**Варианты:**
- Перейти на Linux-эталоны в официальном Docker-образе Playwright (`mcr.microsoft.com/playwright:v1.xx-jammy`). Локально — `docker run ... pnpm test:visual --update-snapshots`, в CI — тот же образ. Шрифт Gavia Sans свой, так что системные шрифты влияют только на Classic и Newspaper.
- Скрипт `pnpm test:visual:docker` в README / CONTRIBUTING.

### CI-6. Мелочи в workflow · P2 · S

- Actions закреплены тегами (`@v6`). Для `release.yml` с `id-token: write` лучше закрепить по SHA (`actions/checkout@<sha> # v6`). Renovate умеет их обновлять.
- `permissions: contents: read` по умолчанию — хорошо, нужно сохранить при разбиении.
- В `consumer`-job нет `needs`, и он идёт параллельно с `verify`. Это нормально, но при падении сборки тратит минуты.
- Кэш Playwright-браузеров (`~/.cache/ms-playwright`) по версии Playwright ускорит browser-jobs на ~1 минуту.
- `timeout-minutes` есть у всех jobs. Хорошо.

---

## Релизный процесс

### REL-1. Ручная синхронизация копий · P1 · M

Сейчас вручную поддерживаются и проверяются тестами:
- **два CHANGELOG** — корневой и `packages/ui-kit/CHANGELOG.md` (отличаются только абсолютными ссылками);
- **две LICENSE**;
- **захардкоженные версии** в README корня (`gavia-ui@0.12.0` в Quick start), в README пакета («Source and package archive version: **0.12.0**»), в `docs/releases.md`, в баннере Playground.

Сейчас в репозитории `package.json` = 0.12.1, а оба README говорят 0.12.0. Отчасти это намеренно (0.12.1 ещё не опубликован), но читатель видит рассинхрон: в шапке сайта `v0.12.1`, в команде установки — `0.12.0`.

**Решение:**
- `prepack`-скрипт в `packages/ui-kit` копирует LICENSE и генерирует CHANGELOG пакета из корневого (замена относительных ссылок на абсолютные). Обе копии исчезают из git (`.gitignore`), тест синхронизации больше не нужен.
- В README команды установки без версии: `pnpm add gavia-ui vue`. Версию показывает бейдж npm.
- В Playground показывать «последняя опубликованная» (из `quality-report` / npm) и «версия исходников» с понятной подписью, или только опубликованную.

### REL-2. Формат CHANGELOG с дублированием · P2 · S

Каждая версия в `CHANGELOG.md` содержит маркированный список изменений **и** раздел `### Changesets` с тем же текстом другими словами. Читатель видит одно и то же дважды.

**Решение:** один формат по [Keep a Changelog](https://keepachangelog.com): Added / Changed / Fixed / Deprecated / Removed / Breaking, со ссылкой на миграцию. Changesets остаётся источником, а `release:version` формирует секцию из `.changeset/*.md` в этом формате.

### REL-3. `docs/releases.md` — журнал на 500 строк · P2 · S

Файл содержит отчёты о каждом релизе: хэши тегов, ссылки на CI-прогоны, числа тестов. Это ценная информация, но её место — **GitHub Releases** (workflow их уже создаёт). В `docs/releases.md` оставить только процедуру релиза (≤ 80 строк) и ссылку на страницу Releases.

### REL-4. Версия 1.0 · P1 · L (вся подготовка)

Предлагаемый путь:
1. 0.13 — исправления P0 (a11y, PERF-1 с поднятием peer до Vue 3.5, линтер), dev-предупреждения о будущих переименованиях.
2. 0.14 — `tone`, интеграция с роутером, `rowKey`, слоты в Select, Toast API, `gavia-ui/utils`; алиасы для старых значений.
3. 1.0.0-rc — удаление алиасов, английский fallback, нормализованные pt-секции; RFC-период 2–4 недели.
4. 1.0.0 — публикация, анонс.

После 1.0 действует SemVer без исключений: breaking только в major (это уже описано в `quality.md`).

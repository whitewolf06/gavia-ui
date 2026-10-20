# 11. Markdown-документация (README, docs/, CHANGELOG, ROADMAP)

[← к оглавлению](README.md)

## Оценка: 6/10

### Инвентаризация

| Файл | Строк | Комментарий |
|---|---|---|
| `README.md` (корень) | 207 | полный, но первый экран не продаёт проект |
| `packages/ui-kit/README.md` | 447 | README для npm; дублирует корневой, версия 0.12.0 захардкожена |
| `CONTRIBUTING.md` | 22 | слишком короткий для open source |
| `ROADMAP.md` | 142 | это **история**, а не план |
| `CHANGELOG.md` ×2 | 289 + 289 | дублирование секций (REL-2) |
| `docs/architecture.md` | 259 | хорошее ядро + журналы проверок |
| `docs/design-system.md` | 433 | полезно, плотно |
| `docs/quality.md` | 165 | наполовину пользовательское, наполовину процесс мейнтейнера |
| `docs/releases.md` | 501 | журнал релизов (REL-3) |
| `docs/migration-*.md` | **13 файлов** | 0.5, 0.6, 0.7, 0.8, 0.9, 0.10, 0.11.0, 0.11.1, 0.12.0, 0.12.1, gavia, themes, baseline-0.3 |
| остальные `docs/*.md` | ~800 | icons, font, localization, primitives, responsiveness, hosting, playground, theme-builder, date-picker, theme-gavia |
| `docs/brand/` | ~13 МБ | PNG + WebP + **текстовые промпты генерации** |

---

## DOC-1. README не продаёт проект · **P0** · S

Сейчас порядок такой:
1. логотип, заголовок, бейдж покрытия;
2. две строки описания;
3. ссылки;
4. **абзац о том, как устроен бейдж покрытия**: «The 0–100% scales show the unit test pass rate and coverage. The badge stores a line coverage measurement. Its date, version and source are in the JSON report. The published playground shows the CI report for that build, which may differ…»;
5. иллюстрация;
6. «53 компонента…»;
7. Public TypeScript contracts (про миграцию 0.11);
8. Темы, Quick start…

Читатель с GitHub тратит на решение 10–20 секунд. За это время он должен увидеть **что это, как выглядит, почему стоит попробовать и как начать**.

**Предлагаемый первый экран:**

```markdown
<logo>
# Gavia UI
Accessible, type-safe Vue 3 components with zero runtime dependencies.

[npm] [CI] [coverage] [bundle size] [license]

<скриншот или GIF: 4–6 компонентов в Gavia и Gavia Dark — кликабельный, ведёт на сайт>

**Docs** · **Playground** · **Theme builder** · **Русская версия**

## Why Gavia UI
- 🧩 53 components, 113 icons, 5 themes — on one token system (447 tokens)
- 🔒 Type-safe models: `WlSelect` infers its v-model from `options`/`optionValue`; table columns are checked against row keys
- ♿ WCAG 2.2 AA checks (axe) in every theme, keyboard support, focus management
- 🪶 Vue is the only peer. No runtime deps. Tree-shakable ESM, SSR-safe
- 🎨 Override tokens, not components: themes are plain CSS files
- ✅ Every release is verified as an installed package in clean pnpm/npm/Bun apps

## Quick start
pnpm add gavia-ui vue
<main.ts — 6 строк>
<App.vue — 5 строк>
```

Дальше: темы (таблица), документация, contributing, автор, лицензия. Текст про то, как устроен бейдж и снимок покрытия, — в `docs/quality.md`.

Раздел «About the author» хороший и личный. Его можно оставить, но ближе к концу.

## DOC-2. Пользовательская документация смешана с журналом проверок · P1 · M

Примеры:
- `architecture.md` → «Data type contracts»: «Type changes were released in 0.11.0. Release preparation locally checked source, playground and installed archives with Vue 3.4.0 / TypeScript 5.4.5 and Vue 3.5.40 / TypeScript 5.8.3. Unit tests, SSR and a browser consumer also passed…»;
- `quality.md`: «During local 0.11.0 preparation on October 8, 2026, package/playground typecheck…»;
- в README: подробное описание того, чем снимок покрытия отличается от отчёта CI.

Пользователю нужно знать **что гарантируется**, а не **когда и как это проверялось в прошлый раз**.

**Решение — разделить на две аудитории:**

```
docs/
  guide/                 для пользователей: getting-started, theming, tokens, localization, ssr, accessibility, typescript
  reference/             design-system, primitives, icons, responsiveness
  migration.md           один файл (DOC-3)
  maintainers/           architecture, quality (процедуры), releases (процедура), hosting, playground, fonts, visual-baselines
```

Журналы конкретных прогонов — в GitHub Releases ([REL-3](08-build-ci-release.md)).

## DOC-3. 13 файлов миграций для версии 0.x · P1 · S

Нужно объединить в `docs/migration.md` с разделами по версиям в обратном порядке (якоря `#0120`, `#0110`…). Старые файлы оставить как короткие перенаправления на один релиз или удалить, обновив ссылки (тест на ссылки в документации у вас, похоже, есть). Миграции до 0.7 (первая публикация в npm) можно свернуть в один абзац «История до первой публикации».

## DOC-4. Устаревшие и расходящиеся сведения · P1 · S

- README корня и README пакета: `0.12.0` при `package.json` = `0.12.1` ([REL-1](08-build-ci-release.md)).
- README и `agents.md` утверждают, что у всех компонентов есть `variant`, `size`, `density`, `pt`. Это не так ([CMP-3](03-components.md)).
- `agents.md` §5: список `exports` устарел (нет `primitives.css`, `fonts`, `manifest.json`, `design-tokens.json`).
- `ROADMAP.md` упоминает ветку `codex/remove-primevue`, «Stage 5b» и «46 icons». Это история, а текущих планов нет.
- Русские якоря `<a id="контракты-типов-данных">` и `<a id="проверка-новых-публичных-контрактов">` в английских документах. Остались ради старых ссылок, но выглядят как мусор. Достаточно GitHub-якорей от заголовков.

**Решение:** тест (или скрипт в CI), который сверяет версии в README с `package.json` / опубликованной версией, плюс один проход по тексту.

## DOC-5. ROADMAP — история вместо плана · P1 · S

Для open source `ROADMAP.md` — это «куда идём»:
- **Now** — что в работе;
- **Next** — 0.13 / 0.14 / 1.0;
- **Later**;
- **Non-goals**.

Историю (Stage 0–5b) перенести в `docs/maintainers/history.md` или в раздел «History» в конце. Как вариант — вести план в GitHub Projects и оставить в `ROADMAP.md` ссылку и non-goals.

План из этого ревью ([PLAN.md](PLAN.md)) можно взять за основу.

## DOC-6. CONTRIBUTING слишком короткий · P1 · S

22 строки и ссылка на `agents.md` (на русском). Внешнему участнику нужно:
1. Подготовка окружения: Node 20+, `corepack enable`, `pnpm install`, `pnpm build` (playground использует `dist`).
2. Карта репозитория: где компоненты, стили, токены, иконки, примеры, документация, тесты.
3. **Как добавить компонент**: шаги или `pnpm new:component` ([ARCH-1](01-architecture.md)).
4. Какие проверки запускать локально (быстрые) и что сделает CI (тяжёлые). Визуальные тесты — через Docker ([CI-5](08-build-ci-release.md)).
5. Conventional Commits (фактически используются) и changesets.
6. Как обновлять визуальные эталоны.
7. Code of Conduct, как сообщать об уязвимостях.

## DOC-7. Смешение языков · P1 · S–M

| Где | Язык |
|---|---|
| README, `docs/`, CHANGELOG | английский |
| `agents.md` | русский |
| Issue-шаблоны (`.github/ISSUE_TEMPLATE`) | русский |
| Строки в unit-тестах | русский |
| Fallback-локаль библиотеки | русский |
| Комментарии в коде | английский |

Для международного open source всё публичное должно быть на английском. Русский остаётся полноценным языком сайта (это уже есть) и может быть дополнительным языком README (`README.ru.md`).

## DOC-8. JSDoc в исходниках · P2 · M

Пример хорошего комментария есть в `WlColorPicker`: `/** v-model — hex color, always emitted normalized as lowercase #rrggbb. */`. Но у большинства props JSDoc нет, описание живёт только в i18n-словаре Playground.

Пользователь в IDE видит `optionValue?: TResolver` без пояснений. Если добавить JSDoc к каждому публичному prop, событию и слоту:
- подсказки в IDE (Volar показывает JSDoc);
- источник для автогенерации API на сайте ([PG-2](10-playground-docs.md));
- `@default`, `@since 0.8.0`, `@deprecated` с подсказкой замены — механизм для алиасов перед 1.0.

## DOC-9. `docs/brand`: тяжёлые исходники и промпты · P2 · S

~13 МБ в git:
- PNG-версии (1.5–2.1 МБ каждая), рядом с которыми уже есть WebP;
- `*-prompt.txt` — промпты генерации изображений;
- предварительные варианты логотипа (v1, v2, eye, preview).

Это раздувает клон репозитория (сейчас `.git` весит 36 МБ).

**Решение:**
- в репозитории оставить финальные WebP и SVG;
- исходники и промпты вынести в отдельный репозиторий или архив (если хочется сохранить историю создания бренда, это может быть интересный пост в портфолио);
- историю git можно не переписывать: новые клоны всё равно получат старые объекты, но новые не прибавятся.

## DOC-10. Двойной README (корень и пакет) · P3 · S

`packages/ui-kit/README.md` (показывается на npm) во многом повторяет корневой. Его стоит сделать коротким: описание, установка, минимальный пример, ссылки на сайт и GitHub, лицензии. Ещё лучше — генерировать в `prepack` из шаблона, чтобы не синхронизировать вручную.

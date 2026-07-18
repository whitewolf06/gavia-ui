# @whitelife/playground

Изолированное приложение для разработки и проверки `@whitelife/ui-kit`.

Playground потребляет библиотеку **только через package exports**
(`@whitelife/ui-kit`, `.../styles/*.css`, `.../themes/*.css`) — без алиасов на
исходники. Поэтому он проверяет реальную публикуемую поверхность пакета.

## Важно: сначала соберите библиотеку

Subpath export `.` указывает на `dist/`, поэтому перед запуском playground
библиотека должна быть собрана:

```bash
# из корня репозитория
pnpm build              # сборка @whitelife/ui-kit (dist + .d.ts)
pnpm dev                # dev-сервер playground
pnpm build:playground   # production-сборка playground
```

После изменений в `packages/ui-kit/src` пересоберите библиотеку (`pnpm build`),
чтобы playground увидел новый код. Стили и темы (`styles/`, `themes/`)
подключаются как исходные CSS-файлы и пересборки не требуют.

## Что внутри

- `src/main.ts` — эталонная интеграция: `app.use(PrimeVue, { unstyled: true, pt: createWlPt() })`
  и явный импорт `reset.css`, `base.css`, `themes/white.css`, `themes/graphite.css`.
- `src/App.vue` — витрина всех компонентов с вариантами, размерами и состояниями,
  переключатель темы (white/graphite), пример точечного переопределения токенов
  и пример per-component `:pt`.

# Gavia UI playground

Изолированная витрина Gavia UI: компоненты, размеры, состояния, три темы,
дизайн-токены, живые SFC-примеры и шесть UI-сценариев.

```bash
pnpm install
pnpm build
pnpm dev
pnpm build:playground
```

Сначала собирайте библиотеку: публичные типы находятся в dist.
Витрина загружает демонстрации из исходников для разработки; копируемый код
преобразуется к публичным импортам `gavia-ui`.
`verify:package` устанавливает архив отдельно и проверяет этот код без доступа
к исходникам workspace.

В `src/bootstrap.ts` устанавливаются `WlConfig`, `WlToastService` и
`WlConfirmationService`. CSS явно подключается в `src/main.ts`.
Есть темы White / Graphite / Newspaper, клавиатурный поиск, `?view=system`
и версия пакета рядом с новым логотипом.

Проверки: `pnpm test:e2e`, `pnpm test:visual`. Визуальные эталоны —
Windows/Chromium; обновляйте их после просмотра diff по
[правилам дизайн-системы](../../docs/design-system.md).

## Полный Chromium для локальной проверки

Playwright по умолчанию использует headless shell. Если его процесс на рабочем месте
завершается при открытии страницы, можно выбрать полную версию того же закреплённого
Chromium; сценарии, assertions и визуальные эталоны остаются прежними:

```powershell
$env:GAVIA_E2E_CHROMIUM_CHANNEL = "chromium"
pnpm test:e2e
pnpm test:visual
Remove-Item Env:GAVIA_E2E_CHROMIUM_CHANNEL
```

Оба варианта устанавливаются `pnpm exec playwright install chromium`.
В CI переменная не задана: там используется стандартный headless shell.

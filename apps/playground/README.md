# Gavia UI playground

Playground показывает компоненты Gavia UI, их размеры и состояния,
пять тем, дизайн-токены, рабочие SFC-примеры и шесть сценариев интерфейса.

```bash
pnpm install
pnpm build
pnpm dev
pnpm build:playground
```

В чистом checkout сначала соберите библиотеку: публичные типы находятся в dist.
При разработке playground загружает примеры из исходников. Код для копирования
использует публичные импорты `gavia-ui`.
`verify:package` устанавливает архив отдельно и проверяет этот код без доступа
к исходникам workspace.

В `src/bootstrap.ts` устанавливаются `WlConfig`, `WlToastService` и
`WlConfirmationService`. CSS явно подключается в `src/main.ts`.
Есть пять тем: Gavia, Gavia Dark, Classic, Classic Dark и Newspaper.
Поиск работает с клавиатуры, дизайн-система доступна через `?view=system`,
версия пакета показана рядом с логотипом.

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

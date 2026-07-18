# agents.md — ключевые правила репозитория

Этот файл — обязательный контракт для любого агента (и человека), меняющего код
в этом репозитории. Цель репозитория: современная техническая основа, на которой
строятся новые UI для WhiteLife и других проектов.

## 1. Стек — неизменяем

- Vue 3 + TypeScript (strict). Никакого React и других фреймворков.
- Vite в library mode для пакета; обычный Vite для playground.
- pnpm — единственный package manager. Не использовать npm/yarn/bun для install.
- PrimeVue 4 только в `unstyled`-режиме — базовая headless-зависимость.
- CSS Custom Properties + обычный CSS. Tailwind и CSS-in-JS запрещены.
- Vitest + Vue Test Utils для тестов.

## 2. Зависимости

- `vue` и `primevue` — всегда `peerDependencies` библиотеки, никогда не runtime deps.
- `primeicons` — только optional peer.
- В runtime-зависимости библиотеки запрещено добавлять: Pinia, Vue Router,
  API-клиенты, Markdown/Mermaid, бизнес-логику, зависимости от WhiteLife.
- Любая новая devDependency — с обоснованием в коммите.

## 3. Токены и темы

- Все кастомные свойства — только в namespace `--wl-*`.
- Слои токенов не смешивать: foundation → semantic → component.
  Semantic ссылается на foundation, component — на semantic.
- Тема = отдельный CSS-файл с переопределением токенов, переключается через
  `data-wl-theme` или явный импорт. Новые темы создаются заменой токенов,
  а не форком компонентов или правкой исходников библиотеки.
- Reset и стили никогда не импортируются автоматически из JS/TS —
  потребитель подключает их явно.
- CSS Layers (`wl.reset`, `wl.tokens`, `wl.components`) сохранять; стили kit
  должны оставаться предсказуемо переопределяемыми проектом.

## 4. Контракт компонентов

- Единый контракт для всех компонентов: `variant`, `size`, `density`, states
  (`disabled`/`loading`/`invalid`), `class`, `style`, slots, data-attributes
  (`data-wl`, `data-variant`, `data-size`).
- CSS-классы: стабильные, namespaced (`wl-*`), низкая специфичность (один класс,
  без вложенных цепочек и `!important`).
- Компонент не обращается к DOM/window при импорте модуля — только в хуках.
- UI-kit не вызывает `app.use(PrimeVue)` и не настраивает приложение потребителя.
- PrimeVue `pt` остаётся открытым: дефолты через `createWlPt()`, точечная
  настройка через `pt` prop; оба мёржатся, а не перезаписываются.

## 5. Код и структура

- Внутри `packages/ui-kit` запрещены alias вида `@/` — только относительные импорты.
- Пакет собирается в ESM с TypeScript declarations; `exports` в package.json
  обязан покрывать: `.`, `styles/base.css`, `styles/reset.css`, `themes/*.css`.
- Структура workspace фиксирована: `packages/ui-kit` — пакет,
  `apps/playground` — приложение для проверки. Бизнес-код сюда не добавлять.

## 6. Проверки перед завершением изменений

Прогнать и показать результат:

```bash
pnpm build
pnpm test
pnpm build:playground
pnpm run pack
```

Архив `pnpm run pack` не должен содержать Vue/PrimeVue внутри bundle
(проверять содержимое tar). Внимание: голый `pnpm pack` — это builtin-команда
pnpm, она упакует корневой проект; для архива библиотеки нужен именно
`pnpm run pack`.

## 7. Запреты

- Не публиковать пакет (`npm publish` / `pnpm publish`) без отдельной
  явной команды пользователя.
- Не менять публичные имена классов/токенов/exports без миграционной заметки.
- Не коммитить `node_modules`, `dist`, `*.tgz`, `.tools/`, `.pnpm-store/`.

## 8. Окружение этого рабочего места

- pnpm установлен портативно и не лежит в PATH; вызов из корня репозитория:
  `node .tools/node_modules/pnpm/bin/pnpm.cjs <args>` (директория `.tools/`
  в .gitignore).
- Store pnpm локальный: `.pnpm-store/` (настроено в `.npmrc`).

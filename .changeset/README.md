# Changesets Gavia UI

`pnpm changeset` описывает заметное изменение пакета и выбирает patch/minor.
`pnpm changeset:status` показывает план; `pnpm release:version` применяет его,
синхронизирует версии корня/пакета и обе копии changelog. Команда ничего не публикует.
Миграции и несовместимые изменения описываются человеком до выпуска.

DevDependencies: @changesets/cli 2.x сохраняет совместимость инструментов с Node 18;
@axe-core/playwright проверяет реальный DOM в браузере; @vitest/coverage-v8 той же
версии, что Vitest, измеряет ветки/строки. В runtime библиотеки они не входят.


Dev-версия Vue закреплена на 3.4.38 для declarations, совместимых с нижней
границей peer ^3.4.0. Vue Test Utils 2.4.6 закреплён для исполнения тестов на
этой версии: более новый 2.4.11 использует API app.onUnmount из Vue 3.5.
Playground отдельно использует Vue 3.5; npm-потребитель проверяет минимум 3.4.0.

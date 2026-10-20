# Задача для агента-исполнителя (Codex / Claude Code)

> Execution authority: [approved decisions and live task ledger](IMPLEMENTATION.md) override the original recommendations and template permissions below. Vue 3.4 support and Windows primary baselines are retained. No commits or heavy checks are authorised implicitly.


Скопируйте блок ниже в задачу агента. Отредактируйте параметры в квадратных скобках: какие фазы выполнять, разрешены ли быстрые проверки и коммиты.

---

```text
You are working in the Gavia UI repository (Vue 3 + TypeScript component library, pnpm workspace:
packages/ui-kit = published package "gavia-ui", apps/playground = documentation site and test bench).

A full code review was done and a work plan was written. Read these files first, in this order:
1. review/PLAN.md          — the executable plan: rules, phases, tasks T0.1 … T9.8 with steps and acceptance criteria
2. review/WEAK-POINTS.md   — every weak point with evidence (file:line, measurements)
3. review/00-backlog.md    — all findings with IDs (A11Y-1, PERF-1, CMP-6, …)
4. The topic file referenced by a task (review/01-… to review/13-…) before starting that task
5. agents.md (or AGENTS.md after task T0.1) — repository rules; they stay in force

Scope for this run: [Phase 0 and Phase 1 — tasks T0.1 … T1.7]   ← edit

Permissions granted by the user for this run:
- Fast checks ARE allowed after each task: `pnpm exec vitest run <files>` (in packages/ui-kit),
  `pnpm --filter gavia-ui typecheck`, `pnpm lint` (after T0.3), `pnpm tokens:check`, `pnpm icons:check`,
  and `pnpm build` when a task requires it (T0.3 step 4, T1.4).       ← edit if needed
- Heavy checks are NOT allowed unless I ask: build:playground, build:pages, run pack, verify:*,
  test:e2e, test:visual, test:pages, test:coverage. List them as "pending" in your report.
- Commits: [one commit per task on branch review/<task-id>-<slug>; do not push]   ← or: "do not commit, leave changes staged"
- Never publish to npm. Never update visual baseline PNGs without showing me the diff first.
- Never edit *.generated.* files by hand, never modify tests/fixtures/compatibility-* snapshots.

How to work:
- Do tasks in the plan order unless a dependency in "Сводка зависимостей" (PLAN.md) says otherwise.
- For each task: re-verify the problem still exists in the current code (line numbers in the review are for commit
  e60cf78 and may have shifted). If the code differs from the plan, stop that task and describe the difference.
- For defects: write the failing test first, then fix.
- Keep public contracts (props, events, slots, wl-* classes, data-wl* attributes, --wl-* tokens, pt sections, exports)
  unless the task explicitly changes them; when it does, add a migration note and a changeset as the task says.
- User-visible changes: entry under "## Unreleased" in CHANGELOG.md (and in packages/ui-kit/CHANGELOG.md until T2.5).
- The ESLint config draft is in review/drafts/eslint.config.mjs; it was verified on a copy of the repo
  (after `eslint --fix`: build, typecheck and 701 unit tests pass). Keep the three autofixes it disables disabled.

After each task, report:
1. Task ID and what changed (files).
2. Which acceptance criteria are met; which are not and why.
3. Fast checks run and their results.
4. Heavy checks pending.
5. Public contract changes and where the migration note is.
Then update the status of the related IDs in review/00-backlog.md (✅ + commit hash, 🚧, or ⏭ with reason).
```

---

## Как разбивать на запуски

Рекомендуемая нарезка (одна строка — один запуск агента):

| Запуск | Задачи | Результат |
|---|---|---|
| 1 | T0.1, T0.2 | Правила агента, Node 20+ |
| 2 | T0.3 | Линтер и форматирующий коммит (после него — `pnpm test:e2e` по вашей команде) |
| 3 | T1.1, T1.2, T1.3 | a11y списков и вкладок, контракт уникальности ID |
| 4 | T1.4, T1.5 | Vue ^3.5, бюджет размера → **релиз 0.13.0** после полного чек-листа |
| 5 | T1.6, T1.7, T0.4 | Логотип, остатки PrimeVue, доводка линтера |
| 6 | T2.1 … T2.7 | Витрина и гигиена |
| 7 | T7.1 | Перенос тестов по компонентам (до массовых новых тестов) |
| 8 | T3.1 … T3.9 | Доступность и сервисы |
| 9+ | Фаза 4 по одной задаче за запуск | Компоненты → **0.14.0** |
| … | Фазы 5–9 | По плану |

Перед каждым релизом дайте агенту отдельную команду на тяжёлые проверки (полный список — в `AGENTS.md`, раздел «Release checklist»), а визуальные изменения просмотрите сами.

# Gavia UI roadmap

The plan and development history of `gavia-ui`, from an HTML prototype to a design system.
Status: ✅ implemented · 🚧 in progress · ⬜ planned · ⛔ belongs in the application.

The results below describe each stage when it was completed.
Run the checks from `agents.md` section 6 before a new release.

---

## Stage 0. Design system prototype — ✅

- ✅ The original HTML catalog (tokens, 12 sections, vanilla JS) was moved into
  the library and live Vue examples. Completed HTML prototypes were removed
  from the working tree; Git retains the original layout history.
- ✅ More variants: soft/link/lg/xs buttons, button group, password input,
  stepper, counter, removable tags, presence avatars, alerts with actions,
  toast types, popover, accordion, slider, steps and 46 icons.

Current examples are [live SFCs](apps/playground/src/design-system/examples)
and [complete flows](apps/playground/src/design-system/recipes).
Icons are maintained in the [SVG catalog](packages/ui-kit/icons).
The “Prototype” column below preserves the mapping to early layouts.

## Stage 1. Technical foundation — ✅

- ✅ pnpm workspace: `packages/ui-kit` + `apps/playground`.
- ✅ Vite library mode: ESM + TypeScript declarations, strict TS.
- ✅ Vue 3 is the only peer; components and services are implemented in the kit.
- ✅ `--wl-*` tokens: foundation → semantic → component; CSS Layers
  (`wl.reset`, `wl.tokens`, `wl.components`).
- ✅ `white` + `graphite` themes through `data-wl-theme` / explicit imports.
- ✅ Subpath exports: `.`, `styles/base.css`, `styles/reset.css`, `themes/*.css`.
- ✅ `createWlPt()` — extensible pt map; `WlConfig` — application configuration.
- ✅ README (integration, theming, contracts) and agents.md (repository rules).

## Stage 2. Basic components — ✅ (21 + a directive)

| Component | Status | Prototype |
| --- | --- | --- |
| `WlButton` (8 variants, xs–lg, loading, block) | ✅ | `.btn` |
| `WlIcon` (built-in SVG set) | ✅ | `.ic` |
| `WlInput` (sizes, invalid, prefix/suffix) | ✅ | `.input` |
| `WlTextarea` | ✅ | `.textarea` |
| `WlSelect` | ✅ | `.select` |
| `WlCheckbox` (+ indeterminate) | ✅ | `.checkline` |
| `WlRadio` | ✅ | `.box.rnd` |
| `WlSwitch` (sm/md) | ✅ | `.switch` |
| `WlTag` (5 colors, removable) | ✅ | `.tag` |
| `WlChip` (filter, counter) | ✅ | `.chip` |
| `WlBadge` (+ dot) | ✅ | `.nav-badge`, `.bell-dot` |
| `WlAvatar` (24–48, presence) | ✅ | `.avatar` |
| `WlCard` (title/content/footer, hoverable) | ✅ | `.card` |
| `WlTabs` (items, counters, panels) | ✅ | `.tabs` |
| `WlAlert` (4 types, action, closable) | ✅ | `.alert` |
| `WlProgress` (+ thin, ok) | ✅ | `.progress` |
| `WlSkeleton` | ✅ | `.skel` |
| `WlSpinner` (+ light) | ✅ | `.spinner` |
| `WlDialog` | ✅ | `.modal` |
| `WlDrawer` | ✅ | `.drawer` |
| `WlDivider` | ✅ | `.divider` |
| `WlTooltip` (directive) | ✅ | `[data-tip]` |

Stage validation: build ✓ · typecheck ✓ · 30/30 tests ✓ · playground ✓ ·
pack ✓ (Vue outside the bundle).

## Stage 3. Navigation and overlays — ✅ (11 components + a composable)

| Component | Status | Prototype |
| --- | --- | --- |
| `WlIconButton` (sm/md, counter/dot) | ✅ | `.icb` |
| `WlButtonGroup` | ✅ | `.btn-group` |
| `WlSegmented` | ✅ | `.seg` |
| `WlNavItem` (navigation row with a badge, width: 100%) | ✅ | `.nav-item` |
| `WlBreadcrumbs` (last item has `aria-current`) | ✅ | `.crumbs` |
| `WlPagination` (1-based `v-model:page` + compact) | ✅ | `.pager` |
| `WlMenu` (static + popup, headings, danger) | ✅ | `.menu` |
| `WlPopover` | ✅ | `.popover` |
| `WlToast` + `useWlToast()` + `WlToastService` (4 types) | ✅ | `.toast` |
| `WlEmpty` | ✅ | `.empty` |
| `WlPill` (status with a dot, 5 variants) | ✅ | `.pill` |

Stage validation: build ✓ · typecheck ✓ · 59/59 tests ✓ · playground ✓ ·
pack ✓ (only dist/styles/themes/README/package.json in the archive).

## Stage 4. Forms and data — ✅ (8 components)

Implementation policy: forms and the table are implemented in the kit.

| Component | Status | Prototype |
| --- | --- | --- |
| `WlNumberInput` (stepper, keyboard, clamp) | ✅ | `.stepper` |
| `WlPasswordInput` (visibility toggle, aria-pressed) | ✅ | `.input-wrap` + `#pw-toggle` |
| `WlSlider` (fill through `--wl-slider-pct`) | ✅ | `.slider` |
| `WlAccordion` (details/summary, single, controlled) | ✅ | `.acc` |
| `WlSteps` (done/current/pending) | ✅ | `.steps` |
| `WlField` (label + hint + error, useId relationships) | ✅ | `.field` |
| `WlTable` (columns, cell slots, numeric, empty) | ✅ | `.table` |
| `WlStatCard` (label + value + focus bar) | ✅ | `.stat-card` |

Part 4a added forms; 4b added the table and stat card.
`WlInput`/`WlPasswordInput`/`WlNumberInput` also forward `id`/aria to their
internal inputs. Validation: build ✓ · typecheck ✓ · 93/93 tests ✓ ·
playground ✓ · pack ✓ (40 components in the kit).

## Stage 5. Foundation showcase and additional components — ✅

| Task | Status | Notes |
| --- | --- | --- |
| Playground: Colors section (token swatches, copy hex) | ✅ | getComputedStyle — correct in both themes |
| Playground: Typography section (scale, mono, links) | ✅ | playground styles use the `pg-` prefix, outside the library |
| `WlColorPicker` (swatches + hex input) | ✅ | custom, normalizes to `#rrggbb` |
| `WlCalendar` (monthly grid: today/selected/events) | ✅ | custom, `v-model` = ISO `YYYY-MM-DD` |
| `WlDatePicker` (ISO v-model, ru locale, kit-style panel) | ✅ | custom calendar |
| `WlFileUpload` (dropzone + file list + reject events) | ✅ | custom; returns files to the consumer, does not upload them |

Stage validation: build ✓ · typecheck ✓ · 115/115 tests ✓ · playground ✓ ·
pack ✓ (44 components in the kit).

## Stage 5b. Independence from PrimeVue — ✅ in `codex/remove-primevue`

- ✅ Custom implementations of all 51 components; Vue 3 remains a peer.
- ✅ `WlConfig` and services with state per Vue application.
- ✅ SVG catalog and batch `icons:sync` / `icons:check`.
- ✅ Contract, browser and package checks; migration 0.5.

## Stage 6. Application layer — ⛔ outside the kit

Applications compose these elements from library components.
Their business logic stays in the application (agents.md section 2):

- ⛔ task row (`.task`), note row (`.note-row`)
- ⛔ timeline (`.tl-items`), agenda (`.ag-row`), settings rows (`.set-row`)
- ⛔ application-specific palette commands (`.palette`)
- ⛔ calendar cells (`.cal-day`), weekly mini chart (`.week-bars`)
- ⛔ content mini cards (`.note-mini`, `.tile`)

## Non-goals (agreed)

- Pinia, Vue Router, API clients, Markdown/Mermaid — never in runtime deps.
- Package publication requires a separate explicit instruction.
- Tailwind / CSS-in-JS are not used.

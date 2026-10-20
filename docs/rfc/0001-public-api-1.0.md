# RFC 0001: public API migration to 1.0

Status: direction accepted on 2026-10-17; compatibility implementation in progress.
This is a migration contract, not authorization to bump versions or publish.

## Preserved contracts

Vue `^3.4.0`, TypeScript consumer minimum 5.4, Wl component names, `wl-*` classes,
`--wl-*` tokens, explicit CSS imports and app-scoped configuration/services remain.
Vue Router is an optional application adapter and never a library dependency.
Development uses Node 22.13+ on22.x and Node 24; Windows/Chromium is the canonical
visual baseline, with separate supplemental Linux/Docker snapshots.

## Compatibility in 0.x

Introduce semantic `tone` (`neutral/accent/info/success/warning/danger`) while
keeping existing color/status variants. Development warnings identify explicit
legacy status values; defaults stay silent. Appearance and semantic tone are
independent axes. Keep `dismissable` as an alias; `dismissible` wins when both
spellings are supplied.

Add normalized pt aliases before removing any released key. New `iconButton`
configuration isolates icon buttons; legacy `button` remains its fallback.
Preserve default → app → instance ordering and class/style merging. Planned
section changes include `pcCloseButton`→`closeButton`, `pcChip`→`chip`,
`pcToggleButton`→`item`; component keys become table/input/switch/segmented/
pagination/progress/radio/breadcrumbs/tabs. The complete mapping and warnings
must ship and be tested in 0.x before 1.0 removes aliases.

The existing `WlTooltip` export is a directive. In 0.x keep it, add the explicit
`WlTooltipDirective` alias, and introduce `WlTooltipComponent`. The 1.0 migration
renames the component to `WlTooltip` and retains `WlTooltipDirective` for directive
registration. This prevents changing the meaning of an existing import silently.

The Russian locale remains the0.x fallback. New plural-form values coexist with
released string templates. Legacy file unit/decimal overrides remain until the
documented Intl migration. `createWlLocaleFromIntl` supplies calendar metadata and
uses English UI phrases unless overridden.

## Changes reserved for 1.0

Switch the fallback to English; applications relying on implicit Russian text
must install `WlConfig` with `wlLocaleRu`. Remove Russian defaults from component
prop declarations after the locale and explicit-override migration is tested.
Remove old status variants and pt aliases only after a released deprecation
period. Make icon-only action names mandatory in TypeScript after0.x warnings.

## Acceptance and release

Every additive public feature requires source types, manifest/API metadata,
canonical copyable SFC examples, EN/RU documentation and migration notes.
Release verification includes installed-archive consumers, Vue 3.4/3.5,
Node 16/NodeNext declarations, repeated/concurrent SSR and hydration, five themes,
desktop/mobile, transitions/listener cleanup and reviewed screenshot diffs.
NVDA/Firefox and VoiceOver/Safari require a separate dated manual protocol.

RC creation, full release checks, commits, push, npm publication, Pages deployment
and announcements remain separate owner commands. The execution ledger records
code, scoped validation, release readiness and actual publication independently.

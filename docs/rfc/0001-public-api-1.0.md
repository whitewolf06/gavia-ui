# RFC 0001: public API migration to 1.0

Status: direction accepted on 2026-10-17; RC transition accepted by the owner on
2026-10-22. Source version **1.0.0-rc.1** is prepared with English fallback,
canonical PT/tone/dismissible names, Tooltip exports and icon-action name types.
Exact-candidate verification and publication remain pending. The RC transition
below supersedes the previously required intervening 0.x deprecation release.

## Preserved contracts

Vue `^3.4.0`, TypeScript consumer minimum 5.4, Wl component names, `wl-*` classes,
`--wl-*` tokens, explicit CSS imports and app-scoped configuration/services remain.
Vue Router is an optional application adapter and never a library dependency.
Development uses Node 22.13+ on22.x and Node 24; Windows/Chromium is the canonical
visual baseline, with separate supplemental Linux/Docker snapshots.

## Original 0.x transition proposal — superseded on 2026-10-22

This section preserves the original compatibility proposal, not a claim that
it shipped. npm history checked on 2026-10-22 lists `latest: 0.12.1`, published
on 2026-10-12, and no later 0.x version. The aliases/warnings were implemented
in local commit `5bfc00f`, after the `v0.12.1` tag at `fc7792d`. No published
0.x warning period is claimed. The owner-approved RC decision below replaces
the requirement to deliver this intermediate compatibility release.

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
pagination/progress/radio/breadcrumbs/tabs. Shipping these aliases and warnings
in a separate 0.x was the original plan; it is no longer a release prerequisite.

The existing `WlTooltip` export is a directive. In 0.x keep it, add the explicit
`WlTooltipDirective` alias, and introduce `WlTooltipComponent`. The 1.0 migration
renames the component to `WlTooltip` and retains `WlTooltipDirective` for directive
registration. This prevents changing the meaning of an existing import silently.

The Russian locale remains the released 0.x fallback. New plural-form values coexist with
released string templates. Legacy file unit/decimal overrides remain until the
documented Intl migration. `createWlLocaleFromIntl` supplies calendar metadata and
uses English UI phrases unless overridden.

## Changes reserved for 1.0

T9.2 is implemented in the current source: English fallback, Russian defaults
removed from text props and internal `useWlLocaleText` removed. Applications
relying on implicit Russian text must install `WlConfig` with `wlLocaleRu`.
Partial locale fields fall back to English; spread the complete preset before
custom overrides. Omitted/`undefined` text props follow the current locale;
explicit strings, including empty strings, keep priority. Reactive app/SSR
isolation is preserved by the existing configuration API. The root and library
source versions are now `1.0.0-rc.1`; this does not establish candidate verification
or publication. See the
[locale migration](../migration.md#migration-1-0-localization).

The current major source removes old status variants/PT aliases and the
`dismissable` spelling, isolates `iconButton` PT, exports the component as
`WlTooltip` and the directive as `WlTooltipDirective`, and requires a typed name
for icon-prop actions. See the [complete API migration](../migration.md#migration-1-0-public-api).
Runtime name warnings remain for JavaScript and DOM/slot content. Independent
Toast severity/helper and confirmation adapter contracts remain available.

## Accepted RC transition — 2026-10-22

The owner explicitly chose an opt-in RC transition instead of a separate 0.x
compatibility release. Canonical API removals and the English fallback are
delivered in `1.0.0-rc.1` through npm **`next`** after separate verification and
publication authorization. Stable **`latest`** stays on 0.12.1 until an authorized
stable release; do not deliver these changes as a 0.12.x patch.

Keep a **two-to-four-week feedback period after confirmed RC publication**.
Its dates are pending; preparing source, committing or creating a tag does not
start it. Record migration feedback, fixes and explicit stable-release acceptance.
Further candidates stay on `next`; each needs evidence for its exact archive.
This changes the transition policy only. Required automated and manual release
acceptance, Vue/TypeScript minimums and immutable compatibility fixtures remain.

See [the candidate migration](../migration.md#migration-1-0-rc-1) and
[preparation record](../maintainers/release-candidate.md). Public version history:
[npm registry](https://registry.npmjs.org/gavia-ui). Candidate acceptance is
tracked through [the release gates](../maintainers/release-candidate.md).

## Acceptance and release

Every additive public feature requires source types, manifest/API metadata,
canonical copyable SFC examples, EN/RU documentation and migration notes.
Release verification includes installed-archive consumers, Vue 3.4/3.5,
Node 16/NodeNext declarations, repeated/concurrent SSR and hydration, five themes,
desktop/mobile, transitions/listener cleanup and reviewed screenshot diffs.
NVDA/Firefox and VoiceOver/Safari require a separate dated manual protocol.

RC source preparation was authorized on 2026-10-22 without new runs. Full release
checks, commits, push, npm publication, Pages deployment and announcements remain
separate owner commands. Candidate gates record code readiness, automated
checks, manual acceptance and publication independently.

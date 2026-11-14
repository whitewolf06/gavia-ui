# Upgrading to Gavia UI 1.1.0

Version 1.1 adds compatible options to the 1.0 public API. Existing component,
token, class, export and PT names remain available. Styles are still imported
explicitly; Vue remains the only required peer.

## Card padding

Explicit `padding="none|sm|md|lg"` now applies 0/8/12/16 px to the Card's own
caption, content and footer once. Remove CSS/PT workarounds that compensated for
the former extra body padding. Nested cards keep their own settings. The body
class remains available with zero padding; cards without the prop retain their
default section insets. See the [detailed correction](migration.md#unreleased-corrections).

## Calendar activation and unavailable dates

`disabledDates` accepts a readonly ISO-date list or an ISO-date predicate, using
the existing `WlDisabledDates` type. Unavailable dates remain visible and are
skipped by keyboard navigation. Changing availability does not clear a selected
value; the day slot and PT expose the disabled state.

Use `@date-select="openDay"` for every enabled pointer/Enter/Space activation,
including the already selected date. This component event supplies an ISO
string. Native `@select` handlers keep their DOM Event payload. External model
updates and month navigation do not emit `dateSelect`. In multiple mode an
activation may remove a date; the existing single/multiple model types remain.

## Optional width and typography controls

Existing defaults are preserved. Component max-width tokens can override the
limits of Field, input controls, Accordion and Slider. Import
`gavia-ui/styles/primitives.css` and add `wl-fluid` to the intended layout to
inherit full-width controls; NumberInput retains its intrinsic width.

The same optional primitives stylesheet provides `wl-type-scale`. It maps Card,
Accordion, Alert and Segmented typography to semantic roles. Without this class,
the 1.0 appearance remains the default. Existing local small-text overrides for
Segmented remain effective, and explicit component tokens take precedence.

Slider thumbs, range tracks and endpoint marks now share the correct geometry.
Wrapped marks reserve layout height. Existing keyboard and pointer interaction
contracts remain available.

## Verification and limitations

Compatibility is checked directly against the integrity-verified published
[1.0.0 snapshot](../packages/ui-kit/tests/fixtures/compatibility-1.0.0/README.md),
without inheriting the historical 0.x-to-1.0 migration exception.
Manual screen-reader results remain unverified; automated browser, Axe and
visual checks do not establish those results. See the
[manual protocol](maintainers/manual-accessibility.md).

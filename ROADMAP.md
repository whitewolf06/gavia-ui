# Gavia UI roadmap

Gavia UI **1.0.0** was published to npm `latest` on **2026-10-25**.
The [release record](docs/archive/release-history.md#release-100) preserves its
source, exact-archive checks and registry evidence. The owner accepted production
use on 2026-10-27; manual NVDA/VoiceOver checks remain an accepted limitation.

<a id="before-10"></a>
<a id="before-1-0"></a>

## Delivered in 1.0

The release completes the pre-1.0 library work: typed models and list slots,
keyboard/ARIA and overlay improvements, app-scoped services, package and SSR
consumer checks, five themes, variable Gavia Sans and the documentation site.
English fallback, semantic `tone`, canonical PT names, `dismissible` and explicit
Tooltip imports are covered by the [1.0 migration](docs/migration.md#migration-1-0).

The RC was published to `next` on 2026-10-24. The owner approved stable delivery
the following day, ending the originally planned two-to-four-week feedback
period early. That period and a separate 0.x warning release are historical
proposals, not remaining prerequisites for the already published 1.0.0.

## Release follow-up

- Record an immutable 1.0.0 API/consumer compatibility snapshot from the verified
  published archive. The existing 0.11.1 baseline and reviewed 1.0 migration
  policy remain in place; historical fixtures must not be overwritten.
- Complete the [manual accessibility protocol](docs/maintainers/manual-accessibility.md)
  when the required devices and screen readers are available. The accepted gap
  remains visible until there is dated evidence.
- Record post-publication starter acceptance from the registry, or an explicit
  owner disposition. Exact-archive CI and matching published integrity are
  already recorded; a separate registry-install record for all three starters
  has not been retained.
- External announcements remain optional, unsent
  [drafts](docs/maintainers/release-announcements.md). Publication of the package
  does not authorize community posts or repository metadata changes.

### Historical pre-1.0 checklist

The former checklist is retained in the
[RC preparation record](docs/archive/release-candidate-1.0.0-rc.1.md) and
[quality snapshot](docs/archive/quality-through-1.0.md).
Source preparation, automated checks, manual acceptance and publication are
separate records; archived pending cells describe their preparation date.

## After 1.0

- DataTable, VirtualList, Tree, Descriptions and List.
- WlKbd, WlCopyButton, WlInputOtp/WlPinInput and WlStepper.
- WlAvatarGroup, WlSplitter, WlSkipLink and WlVisuallyHidden.
- WlRelativeTime/WlTime, WlBanner, WlRating, WlDateTimePicker and WlThemeSwitcher.
- Each addition needs its own public contract, working example and EN/RU guide;
  WlTreeSelect follows the shared Tree contract as a separate dependent feature.
- Selective icon imports and CSS by component.
- A CSS-only distribution for projects without Vue: shared tokens, primitives,
  themes and component styles with HTML examples. This is a proposal, not a
  published package; interactive behavior and any optional JavaScript need a
  separate contract before implementation.
- Stylelint, Vitest Browser Mode, role-based test improvements, mutation testing
  and a reusable ESLint configuration.
- Continue separate supplemental Linux visual coverage; Windows/Chromium remains
  the primary screenshot environment.

## Boundaries

Business logic, requests, router/store ownership and API clients remain in the
application. Vue `^3.4.0` is the library's only required peer; the minimum
TypeScript consumer remains 5.4. Public namespaces and CSS paths stay stable.
Themes use shared component code, plain CSS and explicit imports.
Public changes require migration review;
fixtures and screenshot baselines are never replaced just to pass a gate.

The [documentation index](docs/README.md) separates user guides and maintainer
procedures. The [documentation archive](docs/archive/README.md) preserves earlier
milestones, preparation reports and dated measurements.
The complete original findings and post-1.0 acceptance criteria remain in the
[archived review](https://github.com/whitewolf06/gavia-ui/tree/archive/review-2026-10/review).

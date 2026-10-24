# Gavia UI roadmap

Gavia UI 1.0.0-rc.1 is being prepared. Track candidate readiness through
[the release gates](docs/maintainers/release-candidate.md); source preparation,
automated verification, owner acceptance and publication are separate states.

## Before 1.0

- Finish candidate documentation, package cleanup and font-loading optimization.
- Verify one exact candidate archive across Vue 3.4/3.5, minimum TypeScript,
  Node 22.13/24, SSR/hydration, five themes and desktop/mobile browsers.
- Measure page transfer, font loading and layout stability; obtain the manual
  accessibility results or explicitly record accepted RC limitations.
- Publish an approved candidate to `next`, gather two to four weeks of feedback
  and resolve release blockers before separately approved stable delivery.

The major migration uses English fallback, semantic `tone`, canonical PT names,
`dismissible` and explicit Tooltip imports. The accepted RC transition replaces
the original separate 0.x warning-release proposal. Vue `^3.4.0`, public
namespaces, CSS paths and historical compatibility fixtures remain preserved.

## After 1.0

- DataTable, VirtualList, Tree, Descriptions and List.
- WlKbd, WlCopyButton, WlInputOtp/WlPinInput and WlStepper.
- WlAvatarGroup, WlSplitter, WlSkipLink and WlVisuallyHidden.
- WlRelativeTime/WlTime, WlBanner, WlRating, WlDateTimePicker and WlThemeSwitcher.
- Each addition needs its own public contract, working example and EN/RU guide;
  WlTreeSelect follows the shared Tree contract as a separate dependent feature.
- Selective icon imports and CSS by component.
- Stylelint, Vitest Browser Mode, role-based test improvements, mutation testing
  and a reusable ESLint configuration.
- Continue separate supplemental Linux visual coverage; Windows/Chromium remains
  the primary screenshot environment.

## Boundaries

Business logic, requests, router/store ownership and API clients remain in the
application. Vue is the only required peer. Themes use shared component code,
plain CSS and explicit imports. Public changes require migration review;
fixtures and screenshot baselines are never replaced just to pass a gate.

The [documentation index](docs/README.md) separates user guides and maintainer
procedures. [Project history](docs/maintainers/history.md) and
[release history](docs/maintainers/release-history.md) preserve earlier milestones.
The complete original findings and post-1.0 acceptance criteria remain in the
[archived review](https://github.com/whitewolf06/gavia-ui/tree/archive/review-2026-10/review).

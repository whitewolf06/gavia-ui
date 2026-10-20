# Compatibility and public contracts

Vue `^3.4.0` is the library peer contract. Source/declaration fixtures retain the
minimum supported Vue line, while installed consumers cover Vue 3.4 and 3.5.
TypeScript consumers need TypeScript 5.4 or later. Node requirements for the
repository toolchain do not add a runtime dependency to browser applications.

The public contract includes props and their requiredness, events and payloads,
slots, models, exposed refs/methods, exports, `wl-*` classes, `data-wl` attributes,
`--wl-*` tokens and pass-through sections. Props and supported axes vary by
component family; read the component's public guide and inferred types.

Patch releases preserve that contract. Minor releases add capability; in 0.x,
an incompatible change needs a minor release, a Breaking changes notice and a
migration guide. After 1.0 an incompatible change requires a major release.
See [the migration guide](../migration.md) before upgrading across a documented
contract transition.

Immutable compatibility fixtures are not updated merely to make checks pass.
The package is verified as an installed archive separately from source checks.
Browser interaction, screenshots, screen readers, publication and owner
acceptance are distinct evidence. Procedures and historical results live in
[maintainer quality documentation](../maintainers/quality.md).

---
"gavia-ui": major
---

Prepare canonical public API names for 1.0. Remove legacy PT keys and the
iconButton-to-button PT fallback, old status variants and dismissable. Use tone
for semantic status and color for Tag's palette axis. Export WlTooltip as the
component and WlTooltipDirective as the directive; require an accessible-name
source for icon-prop actions in the WlIconButton TypeScript contract.

Follow docs/migration.md#migration-1-0-public-api. Stable CSS/token names, Vue
^3.4.0 and app-scoped configuration remain. Toast/confirmation adapters remain.
This breaking migration is prepared for 1.0.0-rc.1. On 2026-10-22 the owner
replaced the planned intervening 0.x deprecation release with an opt-in RC
transition: npm next, then two to four weeks of feedback after confirmed RC
publication before stable 1.0. Candidate verification and publication remain
separate; no 0.x warning release is claimed.

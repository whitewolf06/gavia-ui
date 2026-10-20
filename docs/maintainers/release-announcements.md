# Release communication drafts

Status: **drafts only; nothing sent or changed remotely**. Fill the version,
links, measured results and remaining limitations after
[candidate acceptance](release-candidate.md). Remove every placeholder before
requesting approval to send a specific draft to its named destination.

## Repository metadata proposal

Description: `A Vue 3 and TypeScript component library with five token-based themes, typed models and explicit CSS imports.`

Website: `https://whitewolf06.github.io/gavia-ui/`

Proposed topics: `vue`, `vue3`, `component-library`, `design-system`,
`typescript`, `accessibility`, `design-tokens`, `ui-kit`.

Prepared social preview:
[1280 x 640 PNG](../../apps/playground/public/gavia-social.png), from the
[self-contained SVG](../brand/gavia-social.svg). Local image inspection covered
the existing mark, outlined Gavia lettering and safe margins; browser/social
provider checks remain deferred. The original square mark is preserved in the
[source archive](../../archives/brand/README.md), along with provenance and
license links. Uploading in GitHub settings remains a separate owner action.
These local materials do not establish
that GitHub topics, website, description or social preview are configured.

## GitHub RC release body

```text
Gavia UI [CANDIDATE_VERSION] is available for feedback.

The candidate focuses on typed component models, five CSS-token themes,
keyboard interactions and an explicit Vue 3.4/3.5 compatibility contract.
Vue remains the required peer; routing and application data stay in your app.

Upgrade guide: [IMMUTABLE_CANDIDATE_MIGRATION_URL]
Documentation: [VERIFIED_SITE_URL]
Verification and known limitations: [CANDIDATE_EVIDENCE_URL]

Please report reproducible issues with the exact Gavia/Vue/browser versions,
theme and a small example by [FEEDBACK_END_DATE]. We especially welcome
keyboard, screen-reader and SSR integration feedback.

Install the candidate: pnpm add gavia-ui@[CANDIDATE_VERSION] vue

This is a prerelease. Stable 1.0 timing depends on feedback and acceptance.
```

## dev.to article draft

Working title: **Checking a Vue component library as an installed package**.

Opening draft: “Gavia UI is a Vue 3 and TypeScript component library. For the
1.0 release, I wanted checks that describe what consumers receive: an installed
archive, inferred model types, explicit CSS and a reproducible upgrade path.
This article walks through the contracts and the tests behind that decision.”

Article outline: the public model/slot contract; source versus archive checks;
Vue 3.4/3.5 and SSR IDs; token themes and authored fonts; accessibility checks
and their manual limits; one failure caught in a real consumer; measured
tradeoffs; links to release evidence and migration. Include only verified
results, with their dates and environments. Do not claim full WCAG conformance
or describe intended budgets as measured outcomes.

## Reddit r/vuejs and Vue Land drafts

RC feedback draft: “I've prepared the first Gavia UI 1.0 release candidate:
[CANDIDATE_URL]. It is a Vue 3/TypeScript library with five token-based themes
and typed selection models. I'm looking for feedback on the upgrade guide,
keyboard interactions and SSR integration. Verified environments and remaining
limitations are listed here: [EVIDENCE_URL]. A small example is here:
[VERIFIED_STARTER_URL].”

Stable draft: “Gavia UI 1.0 is available: [VERIFIED_RELEASE_URL]. The release
includes [THREE_VERIFIED_CHANGES]. Documentation and examples:
[VERIFIED_SITE_URL]. The release record covers the installed archive,
Vue 3.4/3.5 consumers and accessibility checks, with manual limitations stated:
[VERIFIED_EVIDENCE_URL]. Feedback and contributions are welcome.”

Check each community's current posting rules when publication is authorized.
No account messages, posts or external requests are part of this preparation.

## Habr adaptation and awesome-vue submission

Habr article outline: the installed-package verification workflow, a concrete
generic-model example, SSR IDs across supported Vue versions, and how automated
and manual accessibility evidence differ. A Russian adaptation is a separate
authoring step using the project's author-style instructions after the English
facts and final results are accepted.

Proposed awesome-vue entry, after stable release and maintainer criteria review:

```text
[Gavia UI](https://github.com/whitewolf06/gavia-ui) — Vue 3 and TypeScript UI
components with token-based themes, typed models and explicit CSS imports.
```

The eventual submission requires separate authorization, the destination's
current contribution rules and a link to the confirmed stable release.

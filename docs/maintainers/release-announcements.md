# Release communication drafts

Status: **drafts only; not sent by this document**. Gavia UI 1.0.0 was published
on 2026-10-25. These materials describe that stable release; external posts,
issues and repository settings still need their own authorization. The
[superseded RC drafts](../archive/release-announcements-rc1.md) preserve the old
placeholders and feedback-window proposal.

## Repository metadata proposal

Description: `A Vue 3 and TypeScript component library with five token-based themes, typed models and explicit CSS imports.`

Website: `https://whitewolf06.github.io/gavia-ui/`

Proposed topics: `vue`, `vue3`, `component-library`, `design-system`,
`typescript`, `accessibility`, `design-tokens`, `ui-kit`.

The [brand source guide](../brand/README.md#social-preview) owns social-card
sources, dimensions, licensing and inspection notes. A prepared asset or this
proposal does not establish that GitHub metadata/social preview is configured.

<a id="github-rc-release-body-and-feedback-discussion"></a>

## Stable release and feedback draft

Suggested title: **Gavia UI 1.0: Vue 3 components with typed models and token themes**.
The GitHub Release is already published; use the shared short draft below for a
separately approved feedback post rather than opening another RC announcement.

```text
Gavia UI 1.0.0 is available for Vue 3 and TypeScript.

It includes typed component models and list slots, five CSS-token themes,
keyboard interactions, grouped selection controls, Tooltip, ContextMenu,
Toolbar and TagsInput. Gavia Sans has continuous 100–700 upright and italic
weights. Styles are explicit imports; routing and application data stay in
consumer apps. Vue ^3.4.0 is the only required peer.

Install this release: pnpm add gavia-ui@1.0.0 vue
Release: https://github.com/whitewolf06/gavia-ui/releases/tag/v1.0.0
Guides and examples: https://whitewolf06.github.io/gavia-ui/docs/
Upgrade: https://github.com/whitewolf06/gavia-ui/blob/v1.0.0/docs/migration.md#migration-1-0
Release checks: https://github.com/whitewolf06/gavia-ui/actions/runs/40144779800

When upgrading from 0.x, check English fallback and wlLocaleRu, semantic tone,
canonical PT sections, dismissible, WlTooltipDirective and icon-action names.

Known limitation: manual NVDA/Firefox, macOS VoiceOver/Safari and iOS VoiceOver
acceptance remains unperformed. Automated browser and Axe checks do not replace
that work; no full accessibility-conformance claim is made.

Please report issues with a small reproduction, exact Gavia/Vue/browser
versions, theme and expected result. Keyboard, screen-reader and SSR feedback
is welcome.
```

The source, archive integrity, provenance and owner decision are retained in the
[1.0 release record](../archive/release-history.md#release-100). Avoid changing
those dated results into claims about an unverified later revision.

<a id="release-tracker-issue-draft"></a>

## Release follow-up

The owner ended the proposed two-to-four-week RC period early on 2026-10-25;
there is no future RC end date to fill in for 1.0.0. Track remaining work through
the [roadmap](../../ROADMAP.md#release-follow-up), not a duplicate RC tracker.
The [manual protocol](manual-accessibility.md) retains its unexecuted cells.

## dev.to article draft

Working title: **Checking a Vue component library as an installed package**.

Opening: “Gavia UI is a Vue 3 and TypeScript component library. For the 1.0
release, I wanted checks that describe what consumers receive: an installed
archive, inferred model types, explicit CSS and a reproducible upgrade path.”

Develop the public model/slot contract, source versus archive checks, Vue 3.4/3.5
and SSR IDs, token themes, authored fonts and manual accessibility limits. Use
only a retained consumer failure and dated measurements as examples; link the
release record and migration. The outline is not a completed or published article.

## Reddit r/vuejs and Vue Land drafts

Use the shared stable draft above, shortened to the destination's format while
retaining the migration link and manual-accessibility limitation. Read the
community's current posting rules when sending is authorized. Do not keep a
separate RC template or an invented feedback deadline here.

## Habr draft

Working topic: the 1.0 release, consumer type contracts, explicit CSS and checks
of the installed package. Use the same verified facts, links and limitation as
the stable draft. The former Russian RC copy is preserved in the
[historical draft](../archive/release-announcements-rc1.md#habr-draft);
a future Russian article needs a fresh stable version before approval to post.

## awesome-vue submission draft

```text
[Gavia UI](https://github.com/whitewolf06/gavia-ui) — Vue 3 and TypeScript UI
components with token-based themes, typed models and explicit CSS imports.
```

Submission remains optional. Review the destination's current contribution
criteria and obtain authorization for that exact external change.

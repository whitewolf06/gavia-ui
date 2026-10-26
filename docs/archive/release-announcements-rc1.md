<a id="archived-section-1"></a>

# Release communication drafts

Archived on 2026-10-27. This record preserves earlier implementation, preparation or release evidence; its dated statuses and commands are historical. Use the [documentation index](../README.md) for current guides and the [archive index](README.md) for context.


Status: **drafts only; no announcement, discussion or release issue posted**. Fill the version,
links, measured results and remaining limitations after
[candidate acceptance](release-candidate-1.0.0-rc.1.md). Remove every placeholder before
requesting approval to send a specific draft to its named destination.

<a id="archived-section-2"></a>

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

<a id="archived-section-3"></a>

## GitHub RC release body and feedback discussion


Discussion title: **Gavia UI 1.0.0-rc.1 — feedback welcome**.
Use the changelog's candidate entry as the release body. The text below is the
shorter feedback discussion, to post only after registry and site verification.

```text
Gavia UI 1.0.0-rc.1 is available for feedback.

The candidate includes typed component models and list slots, five CSS-token
themes, keyboard interactions and a Vue 3.4/3.5 compatibility contract.
It adds grouped selection controls, Tooltip, ContextMenu, Toolbar and TagsInput.
Gavia Sans supports a continuous 100–700 axis, upright and italic.
Vue remains the required peer; routing and application data stay in your app.

Upgrade guide: https://github.com/whitewolf06/gavia-ui/blob/v1.0.0-rc.1/docs/migration.md#migration-1-0-rc-1
Documentation: [VERIFIED_SITE_URL]
Verification and known limitations: [CANDIDATE_EVIDENCE_URL]

Upgrade notes cover English fallback and wlLocaleRu, semantic tone, canonical
PT sections, dismissible, WlTooltipDirective and accessible icon-action names.

Please report reproducible issues with the exact Gavia/Vue/browser versions,
theme and a small example by [FEEDBACK_END_DATE]. We especially welcome
keyboard, screen-reader and SSR integration feedback.

Install the candidate: pnpm add gavia-ui@next vue

This is a prerelease. Stable 1.0 timing depends on feedback and acceptance.
```

Manual NVDA/VoiceOver results remain pending. The owner accepted this gap as an
RC limitation on 2026-10-24; retain this limitation in the actual release body:
“Manual NVDA/Firefox, macOS VoiceOver/Safari and iOS VoiceOver acceptance is
pending. Automated browser and Axe checks do not replace those checks.”
Do not present the prepared protocol as a pass or omit a known manual gap.

<a id="archived-section-4"></a>

## Release tracker issue draft


Title: **Gavia UI 1.0 — RC feedback and stable acceptance**.
Create and pin only after the RC is confirmed in npm. Record its publication
date and choose an end date two to four weeks later; preparation dates do not
start that period.

- Record the verified RC version, archive integrity and source revision.
- Link migration, documentation and the accepted automated/manual evidence.
- Triage reproducible issues weekly; retain environment and minimal examples.
- Keep `release-blocker` defects open until fixed and retested.
- Summarize changes after rc.1 under Unreleased; substantial changes need rc.2.
- Obtain manual acceptance or an explicit owner disposition of its limitations.
- Review Renovate changes, recording deliberate deferrals.
- Repeat the full exact-archive gates before separately approving stable 1.0.

<a id="archived-section-5"></a>

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

<a id="archived-section-6"></a>

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

<a id="archived-section-7"></a>

## Habr draft


Working title: **Gavia UI 1.0 RC: компоненты Vue 3 и проверка установленного пакета**.

```text
У Gavia UI появился кандидат 1.0.0-rc.1. Это библиотека компонентов для Vue 3
и TypeScript: пять тем на CSS-токенах, типизированные модели и слоты списков,
клавиатурная навигация. Стили подключаются явно, роутер и запросы остаются
в приложении. У шрифта Gavia Sans — плавный вес от 100 до 700 и курсив.

В 1.0 меняются несколько контрактов: встроенный текст по умолчанию английский,
для русского нужен wlLocaleRu; статусы задаются через tone, у pt и dismissible
закреплены единые имена. Для обновления подготовлено руководство с примерами.

Поставить RC: pnpm add gavia-ui@next vue
Миграция: https://github.com/whitewolf06/gavia-ui/blob/v1.0.0-rc.1/docs/migration.md
Документация: [VERIFIED_SITE_URL]
Результаты проверок и ограничения: [CANDIDATE_EVIDENCE_URL]

Перед стабильной версией собираем обратную связь в течение двух–четырёх недель.
Если найдёте ошибку, приложите небольшой пример, версии Gavia и Vue, браузер
и тему. Особенно полезны случаи с клавиатурой, скринридерами и SSR.
```

This is a post-publication draft. Include the accepted manual limitations,
actual feedback dates and verified links before requesting permission to post.

<a id="archived-section-8"></a>

## awesome-vue submission draft


Proposed awesome-vue entry, after stable release and maintainer criteria review:

```text
[Gavia UI](https://github.com/whitewolf06/gavia-ui) — Vue 3 and TypeScript UI
components with token-based themes, typed models and explicit CSS imports.
```

The eventual submission requires separate authorization, the destination's
current contribution rules and a link to the confirmed stable release.

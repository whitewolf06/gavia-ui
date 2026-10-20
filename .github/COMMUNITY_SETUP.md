# Community setup for maintainers

Repository files are ready for review. GitHub settings, labels and issues are
external state and have not been changed by adding these files.

## Repository settings checklist

- [ ] Review Community Standards after these files reach the default branch.
- [ ] Enable private vulnerability reporting, then test the link in `SECURITY.md`.
      The maintainer email remains the fallback while the GitHub form is unavailable.
- [ ] Enable Discussions with Q&A, Ideas and RFC categories, then verify the link
      in the issue chooser. Until then, keep issue forms available.
- [ ] Review and apply the proposed labels in `labels.yml` using GitHub's UI/API.
      This repository does not install a label-sync workflow automatically.
- [ ] Reconcile the starter issue drafts below against current code and backlog,
      search for duplicates, and publish only after explicit authorization.

## Starter issue drafts

These five drafts come from the review backlog. They are not open GitHub issues.
If a task has already been implemented, replace it with an equally scoped
unimplemented task before publication.

| Draft title | Review task | Acceptance criteria | Suggested labels |
| --- | --- | --- | --- |
| Add WlKbd for keyboard shortcut hints | NEW-12, phase 10 | Semantic `kbd`, token-based style, public types/manifest, working SFC, EN/RU guide and meaningful contract check | good first issue, enhancement |
| Document keyboard interactions for WlSelect | T8 / PG keyboard tables | Guide matches current Arrow/Home/End/Enter/Escape behavior, distinguishes disabled options, has matching EN/RU text and no invented API | good first issue, docs, a11y, component:select |
| Translate test setup comments into English | TEST-11 | Change comments only, preserve mocks/timers/setup behavior, avoid mass reformatting and explain skipped runtime checks | good first issue, tooling |
| Add an Avatar initials utility and examples | UTIL-4 | Defined empty/whitespace behavior, Unicode-safe initials, source utility with focused tests and an example showing name fallback | good first issue, enhancement |
| Document WlSteps status and list semantics | A11Y-8 / T3.7 | Guide reflects current ordered-list markup and current-step status, explains accessible names and has matching EN/RU text | good first issue, docs, a11y |

When publishing a draft, link the precise backlog entry and source location,
include a concrete reproduction or usage example, list deferred heavy checks and
confirm that no other active work owns the same task. Keep the task small enough
for a first contribution rather than attaching the entire review phase.

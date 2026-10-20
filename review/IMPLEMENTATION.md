# Approved implementation programme

Approved on 2026-10-17. Accounting updated on 2026-10-20.
The dated [verification record](VERIFICATION-2026-10-18.md) retains confirmed
historical checks; release, manual acceptance and publication remain separate.

## Current verification — 2026-10-20

The user authorized the existing linter, strict typechecks, affected-code tests
and production builds, including fixes, followed by one commit and sequential
native E2E, visual and Pages checks. Commit `5bfc00f` precedes the current browser
changes. No further commits, pushes or publication are authorized. No new
verification wrappers or dependency installs were added. The earlier source
checks below used Node 22.14.0 and portable pnpm 10.34.5; browser environments
are recorded separately in the follow-up.

| Gate | Earlier completed result | Scope / remaining work |
|---|---|---|
| Full ESLint | PASS: 715 files, zero errors, 39 warnings, all max-len | [Final raw report](../.tmp/lint-2026-10-20-final.json); 36 stylistic + 3 Vue length warnings meet the <=50 criterion. Initial 64 errors/40 warnings are preserved in `.tmp/lint-2026-10-20.json`; rules were not weakened |
| Strict types | Final PASS for library and Playground, no diagnostics | Existing package scripts rerun after repairs; Playground includes browser-spec/fixture types. Logs `.tmp/typecheck-2026-10-20-{library,playground}-final.log`; initial nested global-pnpm startup failure is recorded separately |
| Affected library units | PASS: 280 tests in 32 files; post-repair subset 83/83 in 6 files | Toast/Confirm/tone, config, file upload, pure utilities, overlays, selection, menus and groups. The repeat is overlapping evidence, not an additional full-suite total |
| Affected Playground units | PASS: 354 tests in 26 files; post-repair subset 172/172 in 7 files | Bootstrap/config, URL/history/viewport, docs/examples, catalogs/site and home assets, including all 12 archived-source derivative hashes. After API regeneration, documentation-components passed 60/60 again; repeat counts overlap |
| Affected Node tool tests | All initially failed/skipped cases passed in targeted retries | Initial 7-file group: 60 pass, 8 fail, 1 skip. Generator compiler passed alone in 47.805 seconds with its unchanged 60-second limit; release-tools passed 22/22 after permission for local junctions; exact ancestor-symlink case passed 1/1 without a skip. No assertions, fixtures or timeouts were weakened; initial group is not relabelled exit 0 |
| Library production build | Final PASS: 196 modules, declarations, 11.51 seconds | Existing `gavia-ui build`, repeated after lint/API repairs; no packing or publication |
| Playground production build | Final PASS: 916 modules, 7.06 seconds | Existing `gavia-ui-playground build`, repeated after API repair; no Pages/prerender/browser acceptance |
| Source API metadata | Final PASS after normal regeneration | Layout fixing added a trailing semicolon to the FileUpload row-slot type. Existing `node scripts/sync-api.mjs` refreshed that one signature; `--check` then passed. Only punctuation changed; no public member or runtime behavior changed |

The preceding source-repair iteration completed the named checks above; those
results do not certify the later browser/test edits. Fixes address layout,
type-only imports, import ordering, a literal test title, one callback's statement
layout and obsolete lint directives. Source API metadata was updated only through
its existing generator. No new verification machinery or dependencies were added.
Browser results and outstanding repairs are recorded below. Installed-archive,
knip and manual accessibility/owner acceptance remain separate. Root HEAD is
`5bfc00f`; the two pre-existing local commits are preserved.

## E2E reduction and browser follow-up

The default matrix was reduced from 878 to 291 registered cases: 174 Chromium
cases, including 60 Axe audits, plus 39 `@cross-browser` critical scenarios in
each of mobile Chromium, Firefox and WebKit. All five themes remain covered
by visual and Axe checks. Built-in `AxeBuilder.setLegacyMode(true)` collects
results in the audited page without a temporary result tab. Both audit entry
points require zero `iframe`/`frame` elements and exactly one `page.frames()`
entry; WCAG tags, include scopes, rules and zero-violation assertions are retained.

| Gate | Recorded result | Boundary / remaining work |
|---|---|---|
| Complete reduced production E2E | FAILED: 289 passed, two failed, zero skipped; 291 total, 1,127,270 ms (18.8 minutes) | [Raw JSON](../.tmp/e2e-reduced-final-2026-10-20.json). The foundations-documentation scenario and native Firefox case failed; this complete batch is not a passing gate |
| Post-failure repairs | PASS: 5/5 targeted cases, zero skipped/flaky, exit 0, 34.6 seconds | [Raw JSON](../.tmp/e2e-reduced-repairs-2026-10-20.json): foundations in Chromium plus native keyboard-link behavior in all four profiles. This scoped pass does not relabel the failed full batch |
| Final test-source checks | PASS: targeted ESLint for all 23 changed TypeScript files, then the three latest Home/Pages/unit files; strict Playground types passed again after the Home fix | All named checks exited 0 without diagnostics; no new full lint or unit suite |
| Windows visual | PASS: 24/24, 206,508 ms (3.4 minutes), 122 unchanged PNG comparisons | [Raw JSON](../.tmp/visual-reduced-2026-10-20.json); Node 24.15.0 and pinned Chromium 145 headless shell, primary Windows baselines. This predates the Home href-only correction; CSS and structural markup are unchanged, but no post-correction visual rerun is claimed. No references were updated |
| Playground consumer units | 132/132 in two existing files passed before the latest edits | These overlap earlier documentation/example results and do not establish the later repair outcome |
| Foundation consumer backfill | PASS: 20/20, 7.39 seconds | [Existing unit file](../apps/playground/tests/responsive-documentation.test.ts) now discovers every foundation-example SFC, compiles public consumer imports/template/styles, handles markup-only examples and retains SSR/sidebar checks |
| First Pages smoke batch | FAILED: 18 passed, four failed, zero skipped; 22 total, 63,446 ms (1.1 minutes) | [Raw JSON](../.tmp/pages-reduced-2026-10-20.json). This batch remains failed after the repairs below |
| Home link regression units | PASS: 5/5 in 25.14 seconds | Two new Home-navigation regressions and three existing home-assets cases; no new full-unit total |
| Latest Pages build and renewal | PASS after the Home fix: build 916 modules / 5.84 seconds, prerender 156/156, Pages 22/22 / 85,999 ms (1.4 minutes), zero skipped/flaky | [Final Pages JSON](../.tmp/pages-reduced-final-2026-10-20.json), [prerender report](../.tmp/pages-prerender-final-2026-10-20.json). Existing `/gavia-ui/` build without the E2E fixture; desktop/mobile, EN/RU, direct/legacy links, downloads and Theme Builder passed. No publication |

The Pages failures exposed three causes. HomePage's `themedHref` still generated
legacy-query links; it now uses the existing canonical/portable URL builder,
preserving theme, language and hash. The Theme builder test now awaits its
canonical URL with the default five-second assertion budget. Its action-status
assertion is scoped to the example article, avoiding an ambiguous Alert status.
The Unreleased entry and a Playground-only changeset with no package release
entry describe this follow-up without a package API or version bump. The failed
Pages batch and any subsequent repair result remain separate evidence.
The renewed full Pages batch passed on the rebuilt site. Heavy checks ran
sequentially; browser suites used one worker. Test ports 4173, 4175 and 4177 have no remaining
listeners. No additional commit, push, publication or verification harness was
introduced. The complete 291-case E2E matrix was not rerun after its scoped repairs.

The preceding native 878-case attempt recorded 723 starts without a final JSON
or completion totals. It remains incomplete diagnostic evidence, not 723 passes.
The completed reduced batch above and its successful targeted repair retry are
separate results. The targeted pass does not relabel the failed full batch.

## Current follow-up — code prepared, verification deferred

The following section records the preceding no-runs implementation iteration;
the dated verification section above supersedes its pending-check statements.

The 2026-10-19 instructions authorize missing code, lint debt, brand assets and
review status updates. No tests, typechecks, lint, builds, packing,
browser/visual/Pages checks, knip, API/token/icon/artwork regeneration, dependency
installation or Docker probes were run. Creating and viewing the requested
social SVG/PNG is asset authoring, not a browser/visual gate. No new verification
wrappers, commits, pushes or publication were added.

| Finding / task | Prepared implementation | Acceptance still required |
|---|---|---|
| T3.4 / T4.5, Toast tone | `show()`, all six tones, legacy severity projection, typed PT context and tone-based roles/icons; promise settlement resets even an unchanged tone while retaining explicit sticky results | New lifecycle and compile-only regressions are authored, not executed; existing service adapters and message literals are retained |
| T4.5, confirmation tone | All six tones, explicit override of confirmDanger, typed PT context, legacy danger fallback; cancellation compares raw identities on both sides | New runtime/type cases cover proxy entries, replacement, app isolation and legacy stores; execution remains pending |
| T3.9, Playground config | Locale changes use the installed public WlConfig instance, with app-scoped watcher disposal on unmount or mount failure | New bootstrap integration cases and updated existing mocks await execution |
| ARCH-2 / T9.1 | vue-tsc exactly pinned to the existing lock resolution 2.2.12 in both projects; compiler-dependent generic contract and upgrade procedure documented | No dependency resolution changed; strict/source/installed-consumer verification of the modified tree remains pending |
| UTIL-2 / T6.1 / T6.5 | Byte formatter gains labels, decimal/grouping/precision and unit-cap options; FileUpload consumes it with its released 0.x formatting, including fractional-byte limits | Exact boundary/locale and compile-only cases are authored, not executed |
| UTIL-4 (color) / T6.2, missing color utility | `getWlColorFromString` and a stable foundation-token palette in the pure utils entry; custom palette and Avatar examples documented | Determinism/NFC/empty-palette and type cases are authored, not executed; Avatar defaults are unchanged |
| T0.3 / T0.4, lint debt | Manual source/template/CSS wrapping, explicit E2E state cases and assertion paths; native/delegated accessibility exceptions stay node-specific. Vue error preset and inherited Playwright warnings are enforced as errors; fixture components, optional SFC props and literal payloads have documented policies | No renewed lint, type/unit/browser/API or knip run. The historical 1,032 warnings are the input inventory, not a current count; <=50 warnings and zero errors remain unproved |
| T8.8, brand assets | Twenty original PNG/prompt/history files moved to `archives/brand` with links and original hash provenance; existing derivative tooling reads archived PNGs. A self-contained 1280x640 SVG and 57,179-byte public PNG preserve the mark/font and existing URL; the old square source is archived | Social image inspected locally. Derivative recovery/hash-check execution and browser/social-provider metadata acceptance remain pending; no external upload or Git history reduction claimed |

Examples, EN/RU guides, migration notes, Unreleased changelog and a follow-up
changeset describe these additions. Public prop/slot signatures and generated
token/icon/API files were not regenerated. Source/diff reading and local social
image inspection are the only reviews performed; they do not establish executable or
release readiness. Earlier successful checks below do not validate this new code.

Remaining implementation is explicit: T2.8 major tooling groups, versioned T9.2/T9.3 breaking
1.0 migrations and T9.8 RC/release preparation. T5.3 variable font is blocked by
24 incompatible glyphs per style; accepted static faces stay in place. Runtime
performance targets in T5.2/T5.4/T5.5, full production E2E, Pages/portable,
NVDA/VoiceOver and owner acceptance remain unproved. All 25 post-1.0 tasks in
[10-post-1.0.md](10-post-1.0.md) remain Queued. Docker cleanup from the failed
earlier attempt remains unverified; no infrastructure inspection was started.

## Last verified baseline — historical evidence

The last selected Playground revision was `early-catalog-preload`, bound to the
1155-file `f5e6c272…` snapshot. Its clean full units (408 tests/34 files) and strict
types passed on Node 22.14.0 and 24.19.0; complete ESLint, production fixture build
and four generated-asset checks passed under the completed five-phase foundation
and released awake lease. Those Windows and Linux visuals each passed 24/24
cases and 122/122 PNG comparisons with unchanged references and inputs. Independent
Windows cleanup found all 21 exact process identities absent and port 4173 free;
Linux readonly/no-port proof, exact owned-CID absence and 23 unchanged foreign IDs
were verified. The full 878 attempt ended in an infrastructure failure when the
Docker Desktop Linux engine became unavailable. Only 221 starts were recorded;
there is no completed reporter JSON or exported result tree, so this is not 221
passes. Exact container and volume cleanup remains UNVERIFIED. The full E2E gate,
Pages and portable remain PENDING for this revision. Earlier `c1af679f…` browser passes are history and
are not carried forward. No future browser or release pass is inferred.

## Accepted decisions

- All recommendations are accepted in stages, including optional and post-1.0
  work. This ledger retains all **69 original task IDs + 15 follow-up/group IDs**
  and **50 mandatory component-table rows**. Overlapping rows are traceability,
  not independent completion percentages.
- Preserve Vue peer `^3.4.0`, the lower-bound Vue 3.4 development project and the
  Vue 3.4/3.5 consumer matrix. IDs use the application-root allocator and named APIs.
- Development uses Node 22.13+ on 22.x and Node 24. Windows/Chromium remains the
  primary visual baseline; Docker/Linux is supplemental with its own PNGs.
- Wl/wl/--wl namespaces, explicit CSS and app-isolated configuration/services
  remain. Router, requests and business state belong to the consuming app.
- Canonical tone/PT/dismissible names coexist with 0.x aliases and development
  warnings. English fallback and alias removal remain versioned 1.0 work.
- The user previously authorized all deferred local checks and fixes on
  2026-10-18, including builds, archives, full tests/coverage and browser/visual/Pages
  checks. That authorization was superseded on 2026-10-19 by the instruction to
  implement the current stage, then lint debt and brand assets, without new
  verification runs or harness work. On 2026-10-20, existing checks and fixes,
  one commit (`5bfc00f`) and sequential native E2E, visual and Pages checks were
  authorized. That commit precedes the current browser changes; no further
  commit, push, publication, external post or remote setting change is authorized.
- Preserve CallbackInference overload guards, template Teleport/Transition
  adapters, historical compatibility fixtures, accepted font drawings and the
  two existing local commits. Generated files follow their generators.

## Status and evidence boundaries

**Queued**: accepted, not started. **In progress**: actively being reconciled.
**Implemented**: code/material prepared; required verification can remain.
**Verified**: only the named checks passed. **Partial**: delivered work
and explicitly remaining scope coexist. **Blocked**: a concrete prerequisite
prevents the remaining implementation. Release-ready and Published are separate
states; neither is claimed anywhere in this ledger.

Focused counts overlap and must not be added into full-suite totals. The integrated
results below establish only their named environments and gates; they do not
establish manual screen-reader, owner or publication acceptance. All original
review size/performance figures remain historical; current size limits use fresh
production and installed-archive measurements.

## Historical integrated verification — 2026-10-18

The detailed [verification record](VERIFICATION-2026-10-18.md) retains initial
failures and corrections separately from successful runs. Machine-readable reports
and logs are local evidence in `.tmp/verification-2026-10-18/`. In the historical
tables and narrative below, "current" and "final" name the recorded snapshot or
archive, not the modified working tree after the 2026-10-19 follow-up.

| Gate | Confirmed result | Evidence / boundary |
|---|---|---|
| Library build and full units | Renewed production/declarations on Node 22.14.0 and 24.19.0; 122 files, 849/849 units on each runtime | [Unit summary](../.tmp/verification-2026-10-18/unit-summary.json), `build-ref-node22.log`, `build-ref-node24.log`; includes final panel/ref regressions |
| Library coverage | Lines/statements 98.57%, branches 91.12%, functions 92.24%; configured thresholds unchanged and passed | [Coverage report](../.tmp/verification-2026-10-18/unit-library-ref-node24-coverage-summary.json); official `coverage/tests.json` retains successful 849-test run; quality snapshot regenerated before rebuilding |
| Playground full units | Current early-catalog preload: 408/408 in 34 files on Node 22.14.0/24.19.0, strict exit 0 on both | [Node 22](../.tmp/verification-2026-10-18/playground-catalog-preload-clean-node22-run.json), [Node 24](../.tmp/verification-2026-10-18/playground-catalog-preload-clean-node24-run.json); full identical 742-file guards, unchanged `14bdc3f2…` helper and final regression `249d0c9b…`, zero exceptions |
| Types, lint and maintainer tools | Current preload strict types passed both runtimes; complete lint 712 files, zero errors/fatal, 1,032 warnings | [Current lint](../.tmp/verification-2026-10-18/lint-catalog-preload-final-clean-summary.json); both guards stable and environment restored; library/tooling evidence retained |
| Package and compatibility | Final archive passed strict publint, every attw entry point, immutable 0.11.1 compatibility, dependency checks and the unchanged token/icon/API/font gates | `publint-ref.log`, `attw-ref.log`, `compatibility-ref.log`, `dependencies-ref.log`, `font-archive.log`; no compatibility fixture or gate weakened |
| Additional CI and static-font checks | Two Pages provenance cases, generated API check, 12 image derivatives and full acceptance of all 12 static font faces passed | `pages-provenance-additional.log`, `api-additional.log`, `brand-images-additional.log`, [Font acceptance](../.tmp/verification-2026-10-18/static-font-full-readonly-run.json); unchanged verifier with only its QA output redirected, canonical font inputs/QA unchanged; variable interpolation remains blocked separately |
| Installed consumers | Final archive: 5/5 isolated lanes passed, 66 strict copied SFCs each; three pnpm lanes passed all nine desktop/mobile/SSR-hydration contexts | [Consumer summary](../.tmp/verification-2026-10-18/consumer-ref-final-summary.json); Vue 3.4.0 / TS 5.4.5, 3.4.38 and 3.5.40; npm/Bun Node lanes also passed, all on the same final SHA |
| Fresh size budgets | All eight Vue 3.4/3.5 production fixtures passed the established measured baseline +5% limits again; installed Button envelope remains 34,748 gzip bytes / 28,503 raw retained-kit bytes | [Production measurements](../.tmp/verification-2026-10-18/size-ref-evidence.json), [Production limits](../scripts/size-limits.json), [Consumer budget](../scripts/package-consumer-budget.json); final installed maximum 33,094 gzip / 27,145 raw kit bytes, no limit reset |
| Starter consumers | Final archive: Vite, custom-theme and Nuxt production builds, native/parallel SSR and Nuxt browser hydration passed on Node 24.19.0 | [Starter summary](../.tmp/verification-2026-10-18/starter-final-496220bb87e3/summary.json), [Hydration](../.tmp/verification-2026-10-18/starter-final-496220bb87e3/hydration/result.json); all 188 archive files match in each installation, original starters/root lock unchanged; owned processes/ports cleaned up |
| Windows visual, current early-catalog preload | PASS 24/24 and 122/122 PNG comparisons, zero failed/skipped/flaky/global errors, 229.894 seconds | `visual-windows-catalog-preload-final-summary.json`; 1155/`f5e6c272…` and all 122 reference hashes unchanged, helpers unchanged; independent 21 exact birth/full-start identities absent, 4173 free and awake cleanup zero |
| Windows visual, previous document-ready revision | PASS 24/24 cases and 122/122 PNGs at 1d54cd11…, 79.648 seconds, zero failed/skipped/flaky | [Actual summary](../.tmp/verification-2026-10-18/visual-windows-load-ready-final-summary.json); reference/helper/1154 inputs unchanged; authorized independent cleanup confirms 22 exact identities absent and 4173 free; first CIM-permission failure preserved, not selected |
| Windows visual, previous URL-startup correction | PASS 24/24 and 122/122 PNGs, zero failed/skipped/flaky/global errors, 90.011 seconds | [Actual summary](../.tmp/verification-2026-10-18/visual-windows-preferences-final-summary.json); reference/helper/1154 inputs unchanged at `c1af679f…`; independent 26 exact identities absent, 4173 free and power cleanup passed |
| Docker/Linux visual, current early-catalog preload | PASS 24/24 and 122/122 separate PNG comparisons, zero failed/skipped/flaky/global errors, 215.257 seconds | `linux-catalog-preload-final-verified-summary.json`; 1155/`f5e6c272…`, all references and helpers unchanged, independent in-flight readonly/no-port proof, exact owned CID absent, 23 foreign IDs unchanged and awake cleanup zero |
| Docker/Linux visual, previous document-ready revision | PASS 24/24 cases and 122/122 separate PNGs at 1d54cd11…, 115.101 seconds, zero failed/skipped/flaky/global errors | [Actual summary](../.tmp/verification-2026-10-18/linux-load-ready-final-verified-summary.json); actual mounted/read-only/no-port proof, baseline/helper/1154 inputs unchanged, exact CID absent and 23 foreign IDs preserved |
| Docker/Linux visual, previous URL-startup correction | PASS 24/24 and 122/122 separate PNGs, zero failed/skipped/flaky/global errors, 99.125 seconds | [Actual summary](../.tmp/verification-2026-10-18/linux-preferences-final-verified-summary.json); mounted/read-only/no-port proof for 1154/`c1af679f…`, exact CID absent, 23 foreign IDs unchanged, baselines/helpers stable |
| README UI capture | Real five-component EN capture in two themes reviewed, 848 × 454 and 31,762 bytes | [README capture](../docs/brand/readme-preview.webp); reproducible capture script retained |
| Final production E2E | INFRAFAIL/incomplete for current 1155/`f5e6c272…`; full gate PENDING, cleanup UNVERIFIED | `e2e-catalog-preload-native-dist-complete`, root 99053, original 878/one-worker/zero-retry/60s scope with staged dist and native output; Docker engine lost after 221 starts; no completed raw results/export or exact container/volume reconciliation |
| Pages build/prerender/smoke and portable preview | PENDING until corrections pass the final E2E gate | Prepared callers have not run; no final static-route, deployed-site or portable acceptance claimed |
| Current Playground production fixture | Actual build exit 0: 920 modules, 24.84 seconds; 756 source inputs unchanged | [Build](../.tmp/verification-2026-10-18/e2e-catalog-preload-final-build-run.json); source `a1d2f151…`, ready 1155/`f5e6c272…`, archive `496220bb…` unchanged |
| Renewed generated assets | Four current-preload Node 22/24 checks passed: 113 icons, 447 tokens, five themes, 115 contrast pairs | [Current checks](../.tmp/verification-2026-10-18/generated-assets-catalog-preload-final-run.json); all 1155/`f5e6c272…` unchanged; variable-font readiness remains blocked |
| Late-target regression and native-theme test | Corrected delayed-target controller: old-code three failed/two passed, final focused 37/37; native-theme test hold retains real behavior, renewed browser acceptance PENDING | [Anchor correction](../.tmp/verification-2026-10-18/late-anchor-implementation-summary.json), [Native test change](../.tmp/verification-2026-10-18/theme-switch-native-hold-change.json); actual API/promises/input and 121 existing assertion/deadline calls retained |
| Affected20, previous document-ready revision | PASS 20/20 across four projects, zero failed/skipped/flaky/global errors, 87.387 seconds | [Actual scoped run](../.tmp/verification-2026-10-18/e2e-load-ready-affected20-safe01-run.json); 1154 inputs stable at 1d54cd11…, exact two-CID/foreign preservation/power cleanup passed; no full 878 promotion |
| Affected24, previous URL-startup correction | PASS 24/24 across four projects, zero failed/skipped/flaky/global errors, 123.154 seconds | [Actual scoped run](../.tmp/verification-2026-10-18/e2e-preferences-affected24-safe01-run.json); 1154/`c1af679f…` unchanged, exact two-CID/23 foreign ID/power cleanup passed; diagnostic history only, not full E2E |
| Affected20, preceding boot revision | FAILED: 19/20 passed, WebKit release heading outside viewport after reload at `project.spec.ts:122` | [Actual run](../.tmp/verification-2026-10-18/e2e-boot-affected20-safe01-run.json); 1154 inputs stable, exact two-CID/foreign preservation/power cleanup passed; no visual/full acceptance promoted |
| Affected20, completed viewport revision | Actual exit 0, 20/20 across four projects, zero failed/skipped/flaky/global errors, one attempt each | [Affected gate](../.tmp/verification-2026-10-18/e2e-viewport-affected20-safe01-run.json); five exact titles, 125.565 seconds, 1142 inputs unchanged and exact two-CID cleanup; diagnostic scope does not promote full 878 |
| Native capture viewport ownership | Actual old-source 14-case regression: 11 passed/three failed; final source 14/14 passed; first WebKit browser case 1/1 passed but wrapper FAILED on empty-CID monitoring | [Viewport correction](../.tmp/verification-2026-10-18/theme-viewport-implementation-summary.json), `theme-viewport-final-green-results.json`, `e2e-viewport-native-check01-run.json`; source `2efeb9e4…`, test `36dda284…`; diagnostic result does not promote affected20/full/visual acceptance |

Last verified installed archive: `packages/ui-kit/gavia-ui-0.12.1.tgz`, SHA-256
`496220bb87e31c679f112b0f541751d5bd85f0c73011814a9e92843ee5c5dcb0`.
See [pack evidence](../.tmp/verification-2026-10-18/package-ref-summary.json).
Previous `29aee93e…` and `2765665b…` archives and their reports are retained as
history; their browser results are not final-archive evidence. The follow-up
source is not in this archive and has not been rebuilt or repacked.

## Earlier scoped checks

These preserve implementation traceability. The integrated results above supersede
their earlier pending package/full-suite/visual gates, while the narrower limits
below remain explicit.

| Slice | Recorded result | Limit |
|---|---|---|
| Unique IDs | Contract covers 60 public components, each mounted twice | Installed Vue 3.4/3.5 and SSR hydration now passed; real AT/owner acceptance remains separate |
| Overlays and services | 92 scoped checks passed | Fresh production E2E renewal pending; motion/geometry beyond captured scenarios and manual AT remain separate |
| Table | 23 scoped checks passed | Includes stateful keyed-cell reorder; large-data/browser acceptance pending |
| Menu / ContextMenu | 25 earlier scoped checks and renewed consumer/menu browser scenarios passed | Nine final-archive desktop/mobile/hydration contexts and all four affected production projects cover the named keyboard/nesting/focus scenarios; final full matrix/manual AT remain separate |
| Picker depth | 49 scoped checks passed | Date-only endpoints and wall-clock time; datetime composition remains queued |
| PT / documentation integration | 123 targeted checks passed:59 library +64 Playground | PT callbacks/priority, Field names, range IDs, EN/RU section coverage, six copyable SFCs and example interactions |
| Public utilities | 25 scoped checks passed | Installed archive/type entry-point gates now passed; individual utility/lifecycle behavior retains its focused evidence |
| Button family / core / component depth | 15 /17 /70 recorded scoped checks passed | Overlapping runs; not a whole-library count |
| New choice groups | 15 scoped checks passed | Strict inference fixtures and native group behavior; real AT pending |
| Lazy catalogs/source | 21 scoped checks passed | Fresh documentation chunks measured 389,779 bytes EN and 462,753 bytes RU; no blanket runtime performance claim |
| Site / routes | Site 4 and route/history25 scoped checks passed | Fresh production E2E renewal pending; Pages/prerender/portable acceptance remains unfinished |
| Prerender tooling | 3 Node unit checks passed | Production prerender/static-route smoke and deployment remain separate unfinished gates |
| API tooling | 4 scoped tool checks passed | Source-derived/imported/index/mapped signatures reconciled; built declaration and installed consumer gates now passed |
| Variable-font preflight | 8 tests passed;24 incompatible glyphs per style found | Necessary interpolation prerequisite fails; no font build/replacement |
| Typechecks / lint | Integrated strict checks and full lint passed with zero errors | Full lint retains 1,032 warnings; no warning-free or owner-accepted claim |

## Execution ledger

| Task | Work | Status | Evidence / remaining scope |
|---|---|---|---|
| T0.1 | `AGENTS.md`, `CLAUDE.md`, локальное окружение | Implemented | AGENTS/CLAUDE and local environment rules prepared; case-only rename staged; existing local commits retained, no new commit. |
| T0.2 | Node 22.13+/24 в CI и `engines` | Implemented | Node ^22.13.0 or ^24.0.0 in engines and authored CI matrix; actual workflow execution pending. |
| T0.3 | Собственный ESLint-конфиг, форматирующий коммит, CI | Implemented | Flat config/editor/CI setup exists; the manual lint follow-up applies source formatting and stricter rule severities with documented exceptions. No autofix or formatter was run. A formatting commit, its actual blame-ignore hash and remote CI remain intentionally pending; tool rationale is in [.changeset/README.md](../.changeset/README.md). |
| T0.4 | Ручная доводка линтера | Verified | 2026-10-20 full ESLint: 715 files, zero errors, 39 max-len warnings (<=50), no other warnings. Actual errors repaired without weakening rules; final strict types, affected tests and both builds pass. CallbackInference/adapters and immutable fixtures retained. This verifies the lint gate; the separate knip/dead-export audit was not requested or run. |
| T1.1 | `useWlListbox`: доступная навигация в списках | Verified | Shared listbox keyboard/disabled/scroll/ARIA and single-emit regressions passed; browser geometry and long-list acceptance pending. |
| T1.2 | Уникальные ID и связи в `WlTabs` | Verified | Per-instance tab/panel IDs, ARIA links, disabled/vertical/lazy/link scenarios have focused tests. |
| T1.3 | Контракт уникальности ID для всех компонентов | Verified | Unique-ID contract covers all 60 public components twice; Field/DatePicker endpoint collision fixed. Installed Vue 3.4.0/3.4.38/3.5.40 desktop/mobile and SSR hydration passed; final full production E2E awaits corrected-revision renewal. |
| T1.4 | Vue ^3.4.0 и root-scoped ID без namespace-импорта | Verified | Named Vue APIs and application-root ID allocator retain Vue 3.4. Repeated/parallel SSR regressions and three installed Vue 3.4/3.5 browser/hydration lanes passed. |
| T1.5 | Бюджет размера бандла в CI | Verified | Eight fresh Vue 3.4/3.5 production fixtures and three installed consumer probes establish limits with 5% headroom; ordinary size verification passed. Installed raw-kit accounting includes every retained shared chunk; historical index-only results are incomparable. Remote CI execution remains separate. |
| T1.6 | Логотип Playground: PNG 410 КБ → SVG | Implemented | Playground uses the smaller existing SVG mark; fresh production output and Windows/Linux visual acceptance passed. No separate logo transfer benchmark is claimed. |
| T1.7 | Мелкие остатки PrimeVue | Implemented | Dead Pagination handler and obsolete PrimeVue setup rationale removed; released names remain only through documented compatibility. |
| T2.1 | Первый экран README | Verified | Quick start, project summary, badges and install-version consistency prepared. Real two-theme, five-component EN UI capture reviewed: 848 × 454, 31,762 bytes; reproducible capture script retained. |
| T2.2 | Файлы сообщества | Implemented | Community/security/contact/issue/PR templates and repository metadata material prepared; remote topics/social preview/settings not changed. |
| T2.3 | CONTRIBUTING для внешнего участника | Implemented | CONTRIBUTING expanded with contribution workflow and allowed verification boundaries; local links/YAML reviewed. |
| T2.4 | Расхождения версий и устаревшие утверждения | Implemented | Installation pins/source-version mismatch and stale document structure corrected; preserved historical version statements remain history. Final release audit pending. |
| T2.5 | Генерировать копии CHANGELOG, LICENSE и README пакета | Verified | Canonical root docs generate package README/LICENSE/CHANGELOG during prepack. Integrated pack passed; the final archive and five installed lanes share the SHA recorded above. |
| T2.6 | Облегчить npm-пакет | Verified | WOFF2-only npm allowlist and archive inspection passed; source TTFs preserved. Separate desktop-font archive validation passed with 15 verified font/notice files; no publication. |
| T2.7 | Проверки пакета в CI и Renovate | Implemented | publint/attw, declaration normalizer, installed-package CI and Renovate groups authored. Actual integrated archive passed all declaration entry points, historical compatibility and five clean consumer lanes; remote CI execution remains pending. |
| T3.1 | `WlAlert`: правильная live-семантика | Verified | Alert status/alert/live-off semantics, icon/action slots and PT covered by focused accessibility tests. |
| T3.2 | Гарантированные доступные имена | Verified | Field labelId/native routing, IconButton action/count descriptions, icon titles and consumer labels covered by focused name regressions, including 17 Field cases. Real AT pending. |
| T3.3 | `inert` для фона модальных окон | Verified | Nested modal/nonmodal ownership, recursive background inert, inline backdrops and restoration covered by overlay suites; browser/manual AT pending. |
| T3.4 | Toast: настраиваемое API и доступность | Verified | Canonical tone/show/PT/roles/icons, same-tone promise lifetime, explicit sticky results and legacy adapters pass affected service/component tests and strict types on 2026-10-20, including the post-lint rerun. Real browser/AT acceptance remains separate. |
| T3.5 | `WlMenu`: roving tabindex | Verified | Menu roving focus and nested menus retain keyboard/modified-link contracts; Menu/ContextMenu focused slice 25 passed. Browser Tab order pending. |
| T3.6 | `WlField`: ошибка и подсказка | Verified | Hint and error coexist, optional/horizontal/label slot and labelId work; native and non-native control examples plus Field name matrix passed. |
| T3.7 | `WlSteps` как список | Verified | Steps retains ol/li semantics, descriptions/error text, controlled click and horizontal/vertical navigation; example runtime check passed. |
| T3.8 | Полный `FOCUSABLE_SELECTOR` | Verified | Expanded focusable selection, top-layer focus ownership and focus restoration covered by overlay/focus suites. |
| T3.9 | Реактивный `WlConfig` | Verified | Library config and Playground bootstrap tests pass on 2026-10-20: public locale updates, app isolation and watcher disposal after unmount or mount failure. Final source types and production builds pass; no installed/browser acceptance is inferred. |
| T4.1 | Select / MultiSelect / Autocomplete: слоты, `clearable`, disabled-опции, typeahead, объявления | Verified | Grouped leaf inference, typed slots, disabled/typeahead, loading/filter, Select expose, MultiSelect select-all and Auto debounce/announcements implemented; focused runtime and strict negatives passed. |
| T4.2 | Ключи по данным: `rowKey`, `optionKey` | Verified | Stable option/row keys and compatibility fallback; Table regressions preserve child state after reordering. |
| T4.3 | Table: минимальный набор до 1.0 | Verified | Controlled sort/selection, caption/names/sticky header, alignment/rowClass and typed header/cell/loading/empty slots; Table slice 23 passed. |
| T4.4 | Интеграция с роутером: `linkComponent` и `WlLink` | Verified | WlLink and app-owned linkComponent adapter cover Button/IconButton/Menu/NavItem/Sidebar/Tabs navigation; native, modified and cancelled links have focused checks. |
| T4.5 | Единый словарь статусов `tone` | Verified | Six-tone Toast/Confirm behavior, typed PT contexts, explicit-tone priority and legacy severity/danger compatibility pass affected units and strict source/consumer fixtures on 2026-10-20. Example compilation and builds pass. Alias removal stays deferred to 1.0; fresh installed/browser gates remain separate. |
| T4.6 | Контракт осей и единые API семейств | Implemented | Form/button/layout/PT families had unit/type/visual checks on the recorded baseline. Follow-up closes the Toast/Confirm tone gap; changed contracts and appearance await renewed verification. Final full production E2E and manual acceptance remain separate. |
| T4.7 | Мелкие улучшения компонентов | Implemented | Pre-1.0 depth is tracked in all 50 rows below. Follow-up changes to Toast/Confirm/FileUpload and Avatar examples are unverified; AvatarGroup and datetime composition remain explicitly queued post-1.0. |
| T5.1 | Оверлеи: слушатели только при открытии | Verified | Open-only listeners, rAF/ResizeObserver positioning, close/unmount cleanup and motion/focus cancellation covered by focused overlay suites. |
| T5.2 | Быстрый путь `useWlPt` и кэш locale | Implemented | Shared locale cache and immutable PT fast path have earlier functional regressions. A before/after 500-option runtime benchmark remains unproved; package-size results do not establish that performance target. |
| T5.3 | Переменный шрифт | Blocked | Unmodified accepted masters still have 24 incompatible glyphs per style. Ignored endpoint-data proofs now cover all eight affected numerals, some on hypothetical 2000 UPM data. Four has a bounded duplicate-K/seam-A candidate; boundary-role/optical review, continuous containment/topology and real whole-font UPM/hint/binary/shaping/raster acceptance remain unproved. No font built, saved or replaced. See [font audit](../docs/maintainers/font-variation-audit.md). |
| T5.4 | Playground: ленивые словари и предкомпиляция | Implemented | Lazy/precompiled catalogs and examples had app/dedup checks. Historical documentation chunks were 389,779 bytes EN and 462,753 bytes RU; this does not establish the <=80 KB gzip main-entry target. New bootstrap/catalog edits and that target await verification. |
| T5.5 | Playground: изображения и чанки | Implemented | Twelve responsive artwork variants and lazy loading are prepared. Recorded visuals passed; <=400 KB home transfer, final E2E/Pages requests and static-output acceptance remain unproved. |
| T5.6 | Один стек оверлеев | Verified | One global ownership stack preserves cross-app/nested portal behavior, scroll locks, focus and inert; reported overlay/service slice 92 passed. |
| T6.1 | Плюрализация и числа | Verified | 2026-10-20 affected units/types pass for plural/Intl compatibility, byte labels/rounding/unit cap and fractional FileUpload limits; post-lint upload tests also pass. Installed-package and browser acceptance are separate. |
| T6.2 | Контраст и hex в одном месте | Verified | Shared hex/contrast and getWlColorFromString determinism/NFC/palette tests pass in the pure Node utility suite; strict fixtures and Avatar example compilation pass on 2026-10-20. No automatic avatar recoloring was added. |
| T6.3 | `useWlAnnouncer` | Verified | Per-app announcer, debounce/cancel/unmount cleanup and result announcements have focused tests; real NVDA/VoiceOver output remains pending. |
| T6.4 | `useWlTheme` + `wlThemeInitScript` | Verified | Public theme helper and early-init script handle system/storage/SSR; preference/history regressions authored and scoped checks passed. Browser transition acceptance pending. |
| T6.5 | Даты, инициалы, числа, attrs | Implemented | Pure utility units, strict new byte/color fixtures and current declaration build pass on 2026-10-20. EN/RU guides/examples are checked in the affected Playground suite. Earlier installed archive lacks these additions; fresh packing/installed-entry checks remain pending. |
| T6.6 | `useWlRovingFocus`, публичный `useWlListbox` | Verified | Public listbox, roving focus with loop and extracted typeahead retain disabled/repeated-character behavior; focused helper/list regressions passed. |
| T6.7 | Прочие composables | Verified | Public disclosure/media/clipboard/hotkey/controllable/announcer/focus/dismissal/anchored/overlay helpers have lifecycle tests; full library units and installed declaration/entry-point gates passed. Manual/browser lifecycle acceptance beyond the named fixtures remains separate. |
| T7.1 | Тесты по компонентам | Verified | Eight monoliths split into 38 component files; original callback hash inventory preserved and 55 existing suites relocated by purpose. Renewed 122-file / 849-test library runs passed on Node 22 and 24 without scenario removal. |
| T7.2 | Генератор компонента | Verified | Generator 10 scoped tests cover registration, source/type fixtures, dry-run and path/junction safety; new controls use the generator. |
| T7.3 | Playground через `gavia-ui` | Implemented | Public gavia-ui imports/source aliases and five earlier installed-consumer lanes exist. New bootstrap config and public utility examples continue using public entries; their strict/unit/installed checks remain pending. |
| T7.4 | Разбить CI | Implemented | CI/Pages/Release split, common setup, SHA pins, browser cache and exact-SHA Pages provenance authored; no workflow run or deployment claimed. |
| T7.5 | Тесты Playground отдельно; дописать покрытие; ускорить | Implemented | Separate Playground tests and strict types pass. The browser matrix is reduced from 878 to 291; consumer units passed 132/132 plus the expanded 20-case foundation contract. Full E2E recorded 289 passes/two failures, then all five affected repair cases passed; see the browser follow-up above. Earlier unit counts overlap and are not a new full-suite total. |
| T7.6 | Визуальные эталоны в Docker | Implemented | Last Windows and supplemental Linux runs each passed 24 cases/122 PNG comparisons at 1155/f5e6c272 with unchanged baselines and exact cleanup. Follow-up component styles/examples/config are unverified; Windows remains primary. No baselines or visual tooling changed in the follow-up. |
| T8.1 | Пользовательская и мейнтейнерская документация | Implemented | English guide/reference/maintainer split and document index prepared; historical URLs retained as compatibility links. |
| T8.2 | Один `migration.md` | Implemented | Canonical migration.md with preserved historical anchors/stubs and review-programme migration prepared; local link audits passed. |
| T8.3 | ROADMAP как план | Implemented | Prospective Now/Next/Later/Non-goals roadmap and separate historical ledger prepared; remaining work stays explicit here. |
| T8.4 | Английский во всём публичном | Implemented | Public Markdown/contribution/tooling prose is English; Playground remains EN/RU. Released Russian component defaults are intentionally preserved until 1.0. |
| T8.5 | JSDoc у публичного API и API-таблицы на сайте | Implemented | Current API metadata is regenerated through its existing tool and --check passes; strict types, declarations, EN/RU/docs/example units and production builds pass on 2026-10-20. FileUpload row-slot formatting changed only a trailing semicolon. Fresh installed-archive acceptance remains pending; historical API-member counts are not recounted. |
| T8.6 | Раздел Accessibility и навигация сайта | Verified | Accessibility guide, keyboard tables, component/section navigation and concrete examples authored; full app units and desktop/mobile visual gates passed. Final production E2E, Pages and manual AT acceptance remain unfinished. |
| T8.7 | CHANGELOG и releases | Implemented | Canonical Unreleased changelog, generated package-copy procedure, changeset and release/history split prepared; retained EN/RU Playground changelog overlay. No release created. |
| T8.8 | Бренд-ассеты | Implemented | Repository-local source archive/index and source links prepared; twenty originals relocated unchanged and square social PNG preserved. New 1280x640 SVG/PNG inspected locally. On 2026-10-20 home-assets tests verify archived-source/output hashes and dimensions for all 12 responsive derivatives, and Playground production builds pass. Fresh regeneration, external social-provider/browser acceptance and upload remain separate. |
| T9.1 | RFC решений к 1.0 | Implemented | RFC0001 retains Vue 3.4, namespaces, Node 22.13+/24 and versioned migrations. ARCH-2 follow-up pins vue-tsc to the existing 2.2.12 lock resolution and documents __ctx risk/upgrade procedure; no install or check was run. External discussion/publication not performed. |
| T9.2 | Локализация: английский fallback, текст только из locale | Partial | 0.x locale services/Intl helpers and explicit EN/RU opt-in are implemented; English fallback, undefined text defaults and useWlLocaleText removal remain versioned 1.0 work. |
| T9.3 | Нормализация имён pt-секций и удаление алиасов | Partial | Canonical component/nested PT names, 0.x aliases/warnings and semantic tone/dismissible migration implemented; alias removals remain deferred to 1.0. |
| T9.4 | Новые компоненты базового набора | Verified | Six generated controls: CheckboxGroup, RadioGroup, TooltipComponent, ContextMenu, Toolbar, TagsInput. With WlLink, seven public additions; group slice 15 and other focused behavior/type checks passed. |
| T9.5 | Типы для `node16`/`nodenext` | Implemented | AST normalization, Node16/NodeNext fixtures, publint/attw and five consumer lanes passed on the earlier archive without ignored rules. Follow-up service/PT/utility declarations and compiler pins await renewed current-source/archive verification. |
| T9.6 | Поведенческие a11y-тесты и ручная проверка | Partial | Keyboard/ARIA units, 60 five-theme Axe cases and the critical behavior/accessibility-tree browser scenarios passed in the reduced matrix. Its two documentation failures and the five-case successful repair retry are recorded separately above. Dated NVDA/Firefox and VoiceOver/Safari/macOS/iOS protocol remains prepared but unexecuted. |
| T9.7 | Сайт: пути, пререндер, StackBlitz, examples | Implemented | Router/canonical EN-RU paths, query compatibility and prerender/SEO/search/StackBlitz are authored; three earlier starter builds/SSR/hydration passed. New bootstrap/examples are unverified; final Pages/prerender/portable smoke and actual StackBlitz/external listing remain pending. |
| T9.8 | Релиз 1.0 | Partial | RC checklist, manual protocol, changelog/migration and announcement material prepared. Named affected units, lint/strict checks, builds and primary Windows visual passed with the source boundaries above. Reduced E2E recorded 289 passes/two failures, followed by five passing repair cases; no full post-repair repeat. Fresh Pages build, 156-route prerender and all 22 Pages cases passed after the Home fix. Current release/package acceptance, portable preview, RC versioning, feedback window, manual/owner acceptance and publication remain pending. |
| T10.1 | NEW-8: WlVirtualList and opt-in list virtualization | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.2 | NEW-7: WlDataTable (controlled data, sort, selection and pagination; sticky/expandable columns) | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.3 | NEW-9: WlTree with APG keyboard navigation | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.4 | NEW-10/11: WlDescriptions, WlList and WlListItem | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.5 | NEW-12/13: WlKbd and WlCopyButton | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.6 | NEW-14/15: WlInputOtp and WlStepper | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.7 | NEW-16/17: WlAvatarGroup and WlSplitter | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.8 | NEW-18/19/20: WlSkipLink, WlVisuallyHidden and WlRelativeTime | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.9 | NEW-21/22: WlBanner and WlRating | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.10 | NEW-23/24: WlDateTimePicker and WlThemeSwitcher | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.11 | PERF-5/6: named internal icons and component CSS entry points | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.12 | LINT-2 and reusable ESLint workspace package | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T10.13 | TEST-6/7/10: Browser Mode, role queries and opt-in mutation tests | Queued | Accepted group; see the 25 individual tasks in [10-post-1.0.md](10-post-1.0.md). No implementation or validation claimed. |
| T8.9 | Theming recipe, Recipes navigation, full-text documentation search, llms-full.txt and How it is built | Implemented | Existing guides/search/llms resources had app/visual checks. New utility guides and service/catalog examples are authored in EN/RU but unrun; final static prerender/Pages acceptance and publication remain separate. |
| T2.8 | Upgrade compatible tooling groups, preserving Vue/TypeScript consumer minimums | Partial | Renovate groups exist; both vue-tsc ranges now exactly pin the already resolved 2.2.12 and lock specifiers match without reinstall. Major toolchain upgrades and their independent verification remain; no broad upgrade is claimed. |

## Component table: all 50 additional rows

Every nonempty recommendation from 03-components remains tracked. Per-row evidence
describes focused implementation checks; the integrated full-unit, package and
visual gates above supplement those results without replacing manual acceptance.
The two Partial rows explicitly delegate the separate AvatarGroup/DateTimePicker
components to the post-1.0 queue; their existing component depth is implemented.

| Task | Component | Implemented or remaining scope | Status | Evidence |
|---|---|---|---|---|
| T4.8.1 | WlButton | Element/link mode, icon at end, semantic tone. | Verified | Button-family 15 and navigation/type checks. |
| T4.8.2 | WlButtonGroup | Inherited size/variant/density and attached styling. | Verified | Button-family 15; inheritance/override regressions. |
| T4.8.3 | WlIconButton | Tone, loading, href/to and distinct action/count names. | Verified | Button-family 15 plus accessible-name regressions. |
| T4.8.4 | WlMenu | Nested menus, links, controlled checkbox/radio items, placement/align. | Verified | Menu/ContextMenu25; keyboard, modal nesting and modified links. |
| T4.8.5 | WlNavItem | Router to and icon/badge slots. | Verified | Router integration and component contract checks. |
| T4.8.6 | WlSegmented | Roving arrows, size/block and orientation. | Verified | Focused component/focus/type checks. |
| T4.8.7 | WlInput | Clear action, loading and character counter. | Verified | Forms depth and native-attribute/name checks. |
| T4.8.8 | WlTextarea | Size/density, maxRows and maxlength counter. | Verified | Forms depth and existing textarea checks. |
| T4.8.9 | WlPasswordInput | PT, supplied strength indicator and current-password default with native override. | Verified | Forms depth and readonly/native contracts. |
| T4.8.10 | WlNumberInput | Intl locale/precision/currency formatting, prefix/suffix and PT. | Verified | Forms depth/formatting and strict model checks. |
| T4.8.11 | WlSelect | Typed slots, clear, disabled/groups, loading/filter, expose and typeahead. | Verified | Selection depth, grouped inference and strict consumer fixtures. |
| T4.8.12 | WlMultiSelect | Typed slots, disabled/groups and enabled-visible select-all. | Verified | Selection depth preserves external/off-filter selections. |
| T4.8.13 | WlAutocomplete | Typed slots, configurable debounce, loading and debounced announcements. | Verified | Selection/announcement lifecycle and consumer checks. |
| T4.8.14 | WlCheckbox | Value-based array mode, CheckboxGroup, size/density. | Verified | New-control/group 15 and strict inference/negative fixtures. |
| T4.8.15 | WlRadio | RadioGroup, legend/orientation and size/density. | Verified | New-control/group 15 and keyboard/native radio behavior. |
| T4.8.16 | WlSwitch | Label position and loading state. | Verified | Component depth and native/control naming checks. |
| T4.8.17 | WlSlider | Two-thumb range, marks/labels, readable values, size and PT. | Verified | Forms/range/type/name regressions. |
| T4.8.18 | WlDatePicker | Intl date formats, unavailable dates, range presets and density. Datetime stays date-only and moves to T10.NEW-23. | Partial | Picker slice 49; Field endpoint ID regression. Datetime component queued. |
| T4.8.19 | WlTimePicker | Second steps, native/12/24h presentation and allowed intervals. | Verified | Picker slice 49; canonical wall-clock model retained. |
| T4.8.20 | WlCalendar | Typed day slot, multiple selection and PT. | Verified | Picker slice 49 plus strict generic/default negative fixtures. |
| T4.8.21 | WlColorPicker | Alpha/HSV, PT, native HEX attributes and readonly. | Verified | Picker slice 49; per-channel/round-trip and Field-name regressions. |
| T4.8.22 | WlFileUpload | Typed row/progress/preview/PT plus shared byte formatter retaining 0.x limits/locale text. | Verified | Current upload/utility/strict cases pass on 2026-10-20, including post-lint repeats and fractional limits. API metadata is synchronized; fresh browser acceptance remains separate. |
| T4.8.23 | WlTable | Stable row keys, controlled sort/selection, sticky header, caption/name, typed headers/cells, alignment/rowClass and empty/loading slots. | Verified | Table 23 includes stateful cell reorder and strict consumer checks. |
| T4.8.24 | WlPagination | Page-size choice and visible-range summary. | Verified | Core/existing pagination and locale regressions. |
| T4.8.25 | WlAvatar | Broken-image fallback, name initials and square shape. AvatarGroup remains T10.NEW-16. | Partial | Core/depth fallback tests passed; separate group component queued. |
| T4.8.26 | WlBadge | Slot, max counter and accessible dot label. | Verified | Tone/data/core and name checks. |
| T4.8.27 | WlChip | Controlled active state, removal, size and PT. | Verified | Component depth and no-double-action regressions. |
| T4.8.28 | WlTag | Icon/size, semantic tone and retained color/status aliases. | Verified | Depth/tone and explicit-alias warning checks. |
| T4.8.29 | WlPill | Semantic tone, dot and PT. | Verified | Tone/data/core scoped checks. |
| T4.8.30 | WlProgress | Indeterminate mode, max and accessible label/labelledby. | Verified | Tone/data/core and ARIA regressions. |
| T4.8.31 | WlSkeleton | Text/avatar presets and configurable lines. | Verified | Core component/preset checks. |
| T4.8.32 | WlStatCard | Delta/trend and formatted numeric value. | Verified | Tone/data/depth and formatter checks. |
| T4.8.33 | WlCard | Semantic element/link mode, padding and outlined/elevated variants. | Verified | Core/link/depth scoped regressions. |
| T4.8.34 | WlAccordion | Typed header slot, item icons, defaultOpenKeys and PT. | Verified | Depth/slots/model fixtures. |
| T4.8.35 | WlDialog | Size presets, mobile fullscreen and initialFocus. | Verified | Overlay92; transition/focus/nesting regressions. |
| T4.8.36 | WlDrawer | Closable surface, size/width and afterLeave. | Verified | Overlay92 and cancellation/reopening checks. |
| T4.8.37 | WlPopover | Placement/align, arrow and hover/focus trigger. | Verified | Overlay92; active listeners/owned portals and trigger regressions. |
| T4.8.38 | WlTabs | Vertical/disabled tabs, lazy/keepAlive panels and native/router links. | Verified | Tabs/focus/link/state/ARIA checks; local alias integration reconciled separately. |
| T4.8.39 | WlDivider | Vertical orientation. | Verified | Core/layout scoped checks. |
| T4.8.40 | WlCommandPalette | PT on root/panel/search/list/group/item/status/footer. | Verified | Layout-PT 4 plus existing Palette 13; callback state/priority. |
| T4.8.41 | WlFilterBar | PT across desktop/mobile/filter/backdrop sections. | Verified | Layout-PT 4 plus existing layout; events/attrs preserved. |
| T4.8.42 | WlPageHeader | PT for heading/content/metadata/actions/navigation. | Verified | Layout-PT 4; native attrs/class/style and real heading retained. |
| T4.8.43 | WlSidebar | Optional router targets and PT for navigation/mobile/footer/pin. | Verified | Layout-PT 4, existing Sidebar 5 and router checks. |
| T4.8.44 | WlBreadcrumbs | Item/separator slots and collapsed long chains. | Verified | Core/layout and controlled link regressions. |
| T4.8.45 | WlSteps | Descriptions/errors, controlled click and vertical orientation. | Verified | Feedback/focus and example runtime checks; ol/li retained. |
| T4.8.46 | WlAlert | Icon/action slots, semantic tone and live priority override. | Verified | Feedback accessibility and tone checks. |
| T4.8.47 | WlToast / useWlToast | Existing lifecycle plus show(), all six tones, typed PT context and same-tone promise settlement. | Verified | Current runtime/legacy-adapter/type cases pass on 2026-10-20, including the post-lint rerun; manual/browser acceptance remains separate. |
| T4.8.48 | WlConfirmDialog / useWlConfirm | Awaitable result/slots, all six tones, danger compatibility and reactive cancellation. | Verified | Current proxy/replacement/isolation, old-store and tone cases pass on 2026-10-20 with strict types and post-lint rerun; manual/browser acceptance remains separate. |
| T4.8.49 | WlField | labelId, hint plus error, optional marker, horizontal layout and label slot. | Verified | Field-name 17 and PT/doc 64 example regressions. |
| T4.8.50 | WlIcon | Per-app trusted icon registry and meaningful title. | Verified | Registry/title/app-isolation and core checks. |

## Recent integration

- Seven public additions are prepared: WlLink and the six generated controls
  WlCheckboxGroup, WlRadioGroup, WlTooltipComponent, WlContextMenu, WlToolbar and
  WlTagsInput. The released WlTooltip directive keeps its name in 0.x.
- Strict generic inference preserves existing ungrouped selection models while
  inferring grouped leaves. Calendar multiple selection, typed Table slots and
  checked menu item contracts include negative consumer fixtures.
- The manual PT catalog now describes 385 canonical/compatible paths across 54
  components, with actual DOM targets and EN/RU prose. CommandPalette, FilterBar,
  PageHeader and Sidebar expose their existing DOM through PT. Field examples
  show labelId/Select, hint/error and optional/horizontal layout; Steps retains
  ordered-list semantics; FileUpload shows local progress, error, retry and
  object-URL cleanup. DatePicker endpoint labels avoid Field ID collisions.
- Hosted navigation uses canonical EN/RU paths; legacy shared query links remain
  supported. Relative-base archives retain query navigation. Follow-up review
  identified language/history/anchor and unknown-route issues; fixes and unit
  regressions are integrated. Internal links and prerender URL attributes no
  longer retain the owned preview origin. The old Linux full matrix completed
  846 passed/two failed/30 configured skips; fresh production E2E renewal is pending;
  canonical paths, legacy redirects, static EN/RU HTML and portable preview still
  require final Pages/prerender/smoke results.
- StackBlitz includes explicit primitives/font CSS, and all three starter families
  passed isolated installs and production builds. Nuxt passed three parallel SSR
  requests and browser hydration, with stable IDs and working controls. All 188
  archive files in each starter match the final archive;
  actual StackBlitz hosting is not claimed.
- Test restructuring preserves the eight original monolith scenario bodies while
  splitting them into 38 component suites and relocating 55 existing suites by
  purpose. Full library units now pass 849/849 on both supported Node branches;
  library coverage gates pass. Current document-ready Playground units pass 397/397 in 32 files
  on each Node branch, followed by actual exit-0 strict checks; source/test inputs
  stayed stable throughout both renewals without temporary source edits.
- Documentation/migrations, RFC and RC/manual-accessibility/announcement material
  are prepared. The live source JSDoc inventory records 711/711 members in 60 SFCs;
  generated API annotations and imported/mapped slot descriptions are reconciled.
- The final archive is `496220bb…5dcb0`; all five consumer lanes, nine browser
  contexts, three starter builds/SSR and Nuxt hydration passed on it.
  Production and installed-consumer limits retain their established
  measured baseline +5%; unused-export and strict negative-type checks remain.
- Historical owned-anchor Windows and Linux comparisons each passed 24 cases / 122 PNGs
  after individual review of four corrected Select crops per platform. Original
  files, initial failures and exact-pixel evidence remain recorded; neither
  platform replaces final E2E or manual AT acceptance. The later viewport revision
  passed Windows24/122 but failed Linux23/24 before a home PNG. The current
  document-ready revision then passed both platforms 24/122 with unchanged inputs.

- The late Icons anchor defect now has a shared, cancellable route/hash-scoped
  controller: retain a request until the heading mounts; cancel stale requests,
  observers and scheduled frames. Verified old code produced three failed/two
  passed cases; the final corrected focused slice passed 37/37. Initial harness
  errors and earlier incomplete/failed full runs remain retained separately.
- WebKit's valid native marker was removed before a late assertion after the
  real 500 ms animation began; exact finished timing was not instrumented
  (marker removal around 461–633 ms; assertion around 651 ms). The test pauses
  only snapshots 1 and 3 until the original physical-input/rapid-click chain
  cancels them. Original API object/promises, native marker ownership, zero-duration
  checks, physical input, counts and URLs are preserved; 121 existing assertion/
  deadline calls are byte-identical. The later affected20 passed; full production
  acceptance remains pending.
- The current fixture build passed (root session 61962): 918 modules, 10.86 seconds;
  754 build-source inputs stayed at 54eba7f5…; actual ready source/dist count is
  1142 at 1d143932….
  Four fresh generated-asset checks on Node 22/24 passed with 113 icons, 447 tokens,
  five themes and 115 contrast pairs (`generated-assets-viewport-final-run.json`,
  actual completion 78f2fb). No package/font asset was regenerated.
  The later affected20 and Windows visuals passed; Linux visuals failed 23/24.
  Full E2E, Pages, portable and all upcoming boot-revision renewals remain PENDING.

The first fresh affected 20-case browser renewal completed 19 passed/one WebKit
native-theme pointer failure, zero skipped/flaky cases; exact cleanup and all
1142 inputs stayed valid. Marker/keyboard/finished-count checks passed before
the later pointer predicate. Offline snapshots show scrollTop 96 after the
first click and after native completion; the actual hit node was not stored.
The separately instrumented diagnostic and an extra two-paint-frame probe both
completed with the same failure: native capture moved scrollTop from 0 to 96,
BODY held focus, and the sticky header was the hit node after both transitions
finished. The exact internal browser mechanism remains unproved. Both diagnostic
edits were removed, restoring E2E SHA dd42d7aa…; neither failed run is promoted.

The viewport source now restores both saved coordinates immediately before the
real update only for the still-current request with no newer user input. All
four capture input listeners are removed on update/cancel/error/dispose, and no
restoration runs after await/ready/finished. Meaningful old code passed 11/14
and failed three; final source 2efeb9e4… and regression 36dda284… passed 14/14.
Both fresh full suites then passed 381/381 in 29 files with strict exit 0
(root sessions 74440/96676), unchanged complete source/test/config dictionaries
and helper `14bdc3f2…`; no temporary import-restoration exception applies. Full lint
passed 705 files with zero errors/fatal and 1,032 visible warnings, with all 928
code/test/config paths plus 1142 source/dist inputs guarded unchanged.

The first corrected single-WebKit browser case passed 1/1 in 9.711 seconds, but
its wrapper FAILED when a periodic monitor read a created-but-empty main CID
file. Exact owned cleanup, all 23 foreign container IDs, guards and temporary
power cleanup passed. That failure remains history. Three new CID-safe host
copies allow pending empty IDs only in the periodic monitor; all final identity
checks stay strict. Syntax and 42 isolated behavior checks passed.

The fresh CID-safe affected20 actually passed all 20 in 125.565 seconds, five
existing titles across four projects, one attempt each, zero skipped/flaky/global
errors. The primary Windows comparison then passed all 24 cases/122 PNGs in
167.683 seconds. Both retained all 1142 inputs at 1d143932…, unchanged helpers and
references, exact owned cleanup and temporary power cleanup. Windows independent
readback confirms 23 exact process identities absent and port 4173 free.

The supplemental Linux comparison completed 23 passed/one failed in 138.041 seconds. The
Gavia Dark desktop home locator was absent during the unchanged 5000 ms assertion,
before drawing readiness and any PNG for that case; 118 other review captures
remain. All 122 reference hashes and 1142 inputs stayed unchanged, the exact owned
CID was absent and all 23 foreign IDs preserved. All 33 requested assets exist and
match frozen hashes; all eight stored response bodies match dist. The 24 completed
responses are HTTP 200; nine incomplete records do not establish HTTP failures.
The initial Home graph starts 2073.247 ms after DOMContentLoaded, following serial
bootstrap and shell-catalog loads. Saved inspect has no explicit CPU/memory caps,
but host VM/filesystem/server attribution is unproved. See
`linux-viewport-final-independent-waterfall-review.json`. A correction to overlap
only initial-route loading with bootstrap/catalog is being prepared; its future
reports remain unselected. Full 878/Pages/portable and renewed boot-revision gates
remain PENDING; neither old success nor this Linux failure is a new product pass.

A bounded digit-two prototype and independent validator prove exact compatible
master structure for 36 accepted outlines: 55 points each across six master groups,
all 1704 original points/flags preserved, 138 tracked constant quadratics at
original explicit integer anchors, exact recovery of 36 original contours,
seven rejected corruptions and 46 unchanged guarded inputs. See
`font-two-anchor-feasibility-summary.json` and `font-two-anchor-proof-checks.json`.
No font was built/saved and no variable delivery/intermediate/shaping/rasterizer
or optical gate was promoted; the 24-glyph-per-style blocker remains explicit.

## Remaining work and release boundaries

1. **Retain the confirmed integration evidence:** the dated
   [verification record](VERIFICATION-2026-10-18.md) and local reports above cover
   full units, library coverage, builds, declarations, compatibility, installed
   consumers, starters, fresh size gates and both visual platforms. All 475 source
   API prose strings and seven new manifests have EN/RU presentation coverage.
   Full lint passed with zero errors; its 1,032 warnings remain visible and are not
   a warning-free claim. Later source changes need appropriate renewed evidence.
2. **Keep the variable-font blocker explicit:** fix 24 incompatible glyphs per
   style while preserving Gavia's accepted authored drawing. Then separately
   build/shape/subset/measure the new font and review Windows rendering. Static
   faces remain accepted; preflight does not establish interpolation or80 KB.
3. **Keep size and performance claims precise:** eight current production fixtures
   and three installed probes establish limits with 5% headroom. The installed raw
   metric covers every retained kit chunk; the old index-only value is not
   comparable. These size checks do not establish isolated runtime microbenchmarks
   or every network/performance scenario. No review-era figure is a current baseline.
4. **Complete remaining presentation/tooling work:** the real two-theme README UI
   image is complete. Brand-source/variant archive relocation with retained
   provenance and remaining major toolchain upgrades still require their own work.
5. **Finish the authorized automated checklist:** full units/coverage, library
   build/pack, archive inspection, publint/attw, Node16/NodeNext declarations,
   historical compatibility, installed Vue 3.4/3.5 / TypeScript consumers,
   SSR/hydration and dependency/token/icon/API gates now passed as recorded above.
   The 1d54 all-project renewal was intentionally stopped as a failed partial; corrected-revision renewal is pending. The completed
   846/2/30 diagnostic is not a pass; do not promote an earlier partial, failed
   or merely started browser attempt to a complete successful gate.
6. **Complete site-specific gates:** final Pages build/prerender, desktop/mobile
   static-route smoke and portable preview remain PENDING. Previous Windows and
   separate Linux five-theme visuals passed after image review. The later viewport
   Windows comparison passed and Linux23/24 failed before a home PNG. The current
   document-ready revision subsequently passed both 24-case/122-PNG comparisons
   with unchanged references and exact cleanup; these do not waive final E2E. All
   three local starter builds plus Nuxt SSR/hydration passed. Actual StackBlitz
   hosting remains separate. No new browser/build command ran for this ledger edit.
7. **Perform manual accessibility and owner acceptance:** dated/versioned NVDA
   with Firefox; VoiceOver with Safari on macOS and physical iOS; include focus,
   live announcements, nested overlays, controls and restored states. See the
   [prepared manual protocol](../docs/maintainers/manual-accessibility.md).
8. **Complete the agreed 1.0 migration deliberately:** English fallback and text
   default cleanup, removal of deprecated tone/PT/dismissable aliases and the
   Tooltip component naming migration. Current 0.x compatibility is retained.
9. **Keep all 25 individual post-1.0 tasks queued:** see
   [10-post-1.0.md](10-post-1.0.md). The 13 T10 groups above are indexes, not
   implementations. DateTimePicker, AvatarGroup and selective icon/component
   CSS entries are among that explicitly accepted later work.
10. **Deliver only after separate commands:** RC versioning and feedback dates,
    commit/push, package/Pages publication, GitHub Releases/settings/listings and
    external announcements remain pending. Confirm exact SHA/archive/public URL
    separately. See the [candidate checklist](../docs/maintainers/release-candidate.md).

The two existing local commits and unrelated changes remain preserved. This
bookkeeping edit creates no new commit, archive, release, baseline, publication or
external announcement. It records completed automated gates without claiming
complete release, manual or owner acceptance.

Earlier source checkpoint, retained for traceability: API generator 4/4 and
prerender helper 3/3 pass;
component/manifest/CSS contract slices pass (12/8/4); site/routes/changelog
integration 17/17 and overlay/Table follow-up 25/25 pass. Token generation check
confirms 447 tokens, five themes and 115 contrast pairs; icon check confirms 113
icons. Known errors in the 16 touched guides were repaired: scoped lint 0 errors
with 31 existing warnings, and 16 selected consumer-compilation cases passed.
Local documentation link audit checked71 Markdown files and 282 local targets;
the relocated historical migration link was repaired. Current full/build/visual
and consumer results supersede that checkpoint's earlier pending gates; final
E2E/Pages/prerender/portable and manual/publication boundaries remain explicit above.

### Boot revision checkpoint (history) and remaining font limits

The cold-start correction shares typed cached page imports between the entry,
bootstrap and App, starts only the initial route alongside bootstrap/catalog
work, evicts rejected requests for retry and keeps shared loaders/navigation
out of the HTML entry. Final full renewal passed 389/389 in 31 files plus strict
exit 0 on Node 22.14.0 and 24.19.0, with full stable source/test/config guards
and no restoration exceptions. Full lint passed 708 files, zero errors/fatal
errors and 1,034 warnings, with 931 code/test/config inputs stable. Its separate
1143-input guard is the actual prebuild dictionary, not the later build output.
The production fixture build passed 919 modules in 8.42 seconds: 755 source
inputs stayed at `0ca8af15…`, and the actual new ready dictionary has 1154 files
at `158c2c66…`. All four renewed Node 22/24 token/icon jobs passed with that
complete dictionary unchanged. At that checkpoint the nine-source selector included only
completed base reports. All 31 index self-tests passed; aggregation had
23 PASS/seven PENDING/one font BLOCKED, no inconsistencies.
The boot affected20 then completed actual exit 1: 19 passed/one WebKit
failure, zero skipped/flaky/global errors, one attempt each, 99.339 seconds.
`project.spec.ts:122` resolved the release heading after reload but its viewport
ratio stayed zero for the unchanged five-second assertion. Root cause remains
under investigation. Exact two-CID cleanup, all 23 foreign IDs, all 1154 inputs
at `158c2c66…`, no published ports and zero-error temporary power cleanup passed.
See `e2e-boot-affected20-safe01-run.json`. No subsequent visual/full run started;
those gates, Pages and portable remain unselected/PENDING.

A bounded digit-five producer and independent saved-output validator actually
passed: 36 accepted variants/six master groups, 62 points each, all 2076 original
points/flags retained, 78 tracked constant quadratics at existing integer anchors,
36 exact polynomial streams/TTF contours recovered, seven corruptions rejected
and 46 unchanged protected inputs. The initial inspection harness `KeyError` is
preserved separately. See `font-remaining-anchor-summary.json` and
`font-five-anchor-proof-checks.json`; no font was built or saved.

Certificates for digits 3/6/8/9 cover 24 master groups/144 accepted outlines and
prove only the demonstrated constant-quadratic insertion method is insufficient:
it cannot change existing multi-control chain lengths, line blocks or contour
counts. Three's existing chain lengths differ, six/nine lose a counter chain,
and eight's line-block count differs. This does not prove all exact normalization
impossible. Four remains separately excluded. Zero/two/five proofs in ignored
data do not establish intermediate interpolation, rasterizer/hinting, shaping,
serialization, optical or shipping acceptance; the variable-font gate remains
blocked for the unchanged accepted masters.

### Document-ready anchor renewal

The preceding single-WebKit project diagnostic actually failed 0/1, under its
instrumented c1202829 snapshot. It retains one pre-DOM documentElement telemetry
error. Forwarded app scrolling moved 0→1371 at 163 ms before load 167 ms/pageshow 192 ms;
a later reset at 245 ms has no recorded JS scroll/focus call, unchanged geometry
and BODY focus, with fonts loaded 269 ms. Exact UA internals remain unproved.
The instrumentation was removed first: original project test dd6238e5… and all
1154 original product inputs exactly recovered 158c2c66. Both owned containers
were absent, all 23 foreign IDs preserved, no ports published and power cleanup
passed. See the raw `e2e-project-reload-diag-run01` reports and exact restoration.

The corrected shared owner waits for document/presentation and target font
readiness before one guarded alignment, releases listeners on stale/cancelled/
detached requests and prevents stale resolved promises from scrolling. Current
hook a92db077… and new readiness test 03752123… are bound by the complete renewals;
App 86a5fb00… is comment-only. Final 397/32 units plus strict types passed on both
Node branches with stable full inputs and helper `14bdc3f2…`, zero restoration exceptions.
Full lint 709 files returned 0 errors/fatal and 1,032 warnings, with 932 code/test/config
paths guarded; its 1154 prebuild dictionary is recorded separately. The actual
919-module production build passed in 6.73 seconds, with 755 source inputs at 2a03df57… and 1154 ready inputs at 1d54cd11…;
four new asset checks passed with all ready inputs unchanged. At the completed-base checkpoint, the selector bound those reports only.

The new affected20 actually passed all 20 across four projects in 87.387 seconds,
one attempt each and zero failed/skipped/flaky/global errors, root 26177/696c38
exit 0. Full 1154 inputs stayed at 1d54cd11…, both exact owned CIDs were absent,
all 23 foreign IDs preserved, no ports published and power cleanup passed. This
scoped diagnostic does not complete final 878 acceptance.

Windows visual then passed 24/24 cases/all 122 PNGs in 79.648 seconds with references,
helpers and all 1154 inputs unchanged. Only the authorized independent cleanup is
selected: 22 exact CIM birth/full StartTime identities absent, 4173 free, no foreign reuse,
no process stopped. The first unsuffixed attempt failed CIM permission before
any identity check (checked 0), remains preserved and is not evidence of a leak.

Supplemental Linux then passed 24/24/all 122 PNGs in 115.101 seconds, zero
failed/skipped/flaky/global errors. Its persisted mounted preflight and actual
read-only/no-host-port inspect cover 1154/1d54; all baseline/helper/input hashes
stayed unchanged. The exact owned CID was absent, all 23 foreign IDs preserved
and temporary power cleanup passed. Both current visual gates are selected.
Index: 25 PASS/five PENDING/one font BLOCKED, no inconsistencies; 31 self-tests pass.

The prior full 878 run `e2e-load-ready-owned-linux-complete` was intentionally
stopped after a confirmed Chromium preferences failure: assertion 105 of the
Back/Forward language/theme case at `preferences.spec.ts:92` saw HTML lang `en`
instead of `ru`. Last started progress was 393/878. No final raw result JSON,
complete pass/skip count or mounted-after proof exists, so the result is
`PARTIAL_DIAGNOSTIC_NOT_FULL`. Native container exit143 and producer/awake exit1
remain failures. The exact owned CID was identity-checked before stopping; both
exact CIDs were removed, all 23 foreign IDs preserved and no host ports published.
The power lease cleared/closed with API errors0. Saved host before/after and
mounted-before dictionaries match 1154/1d54 and archive496 is unchanged. See
`e2e-load-ready-owned-linux-complete-partial-independent-readback.json`.

The completed trace/source analysis shows early preload captured EN, then Back
restored a RU URL before App mounted. Late `readInitialView` canonicalized from
the stale EN ref and overwrote the correct RU route; its history watcher missed
that pre-mount traversal. The exact timeline is retained in
`preferences-startup-current-url-proposal.json`. After cleanup, root installed a
minimal App correction that reads current explicit URL preferences at startup,
retaining the preloaded theme fallback only for a missing/invalid visit theme.
Meaningful old-product regression: five failures/six passes, actual exit1
(10611/c930f6); corrected App: 11/11, actual exit0 (4567/26d148). The first
wrong-working-directory run remains a separate harness failure. App SHA is
`4b87023b…`; raw red/green JSON and run records are retained under
`preferences-startup-{old-red-cwd,fixed-green}`. Focused success does not waive
fresh full units/types/lint/build/assets/browser acceptance. The first renewed
lint found one regression formatting error; its report is retained and final
formatted bytes require fresh complete checks.

Affected24 preparation preserves the five previous titles plus this exact
preferences case across four projects. Three syntax checks and 33 isolated scope
checks passed; these are not browser acceptance. New lint/build/assets producers
use fresh prefixes and were not executed by their preparer. The stopped partial
is retained as history entry13 with null completed totals, original diagnostic
history retained and no gate promoted. Completed base reports were subsequently adopted atomically as recorded below;
old visuals bind only the old App. Corrected-revision affected24, full878, visuals, Pages and portable remain
pending. No commit, push or publication was performed.

## Current URL-startup preferences — renewed base checks

Fresh complete lanes bind final regression formatting on Node 22.14.0 and
24.19.0: 403/403 assertions in 32 files and strict typecheck exit 0, actual root
completions 88361/09dfa5 and 49249/4f796e. Full source/test/config before/after
and both-runtime dictionaries match with no exceptions; helper `14bdc3f2…` and
final regression `bdd4f0d8…` are unchanged. Earlier pre-format 403-test runs and
the one-error lint remain history. Clean lint 91995/004d16 passed 709 files with
zero errors/fatal and 1,032 warnings. All 932 code/test/config paths and every
lint path were covered; the separate prebuild 1154/`a68df5fb…` guard was stable.

Production fixture build 27829/b1d195 passed 919 modules in 7.75 seconds. Its
755 source inputs stayed at `1e996130…`; the 1154 ready files hash to
`c1af679f3c3d00555e34e60394a5fdabe854cc3f63209c57c37d7a4978965d99`.
App `4b87023b…` and the unchanged eight other revised source hashes are explicitly
bound to that snapshot; unit files are separately bound by full guards and lint.
Four Node 22/24 token/icon checks then passed (edad41), preserving the full ready
dictionary. Archive `496220bb…` remains exact; library/static-font evidence is
unchanged.

Only completed base reports were atomically selected under
`current-url-startup-preferences`; previous visual selections were backed up and
removed. All 31 index self-tests passed. Aggregate exit 1 reports 23 PASS, seven
PENDING, one variable-font BLOCKED and no inconsistencies. See
`preferences-clean-base-selection-observation.json`.

Affected24 then completed actual exit 0 (root 20646/83e50c): 24/24, six exact
titles in each of four browser projects, zero failed/skipped/flaky/global errors,
one attempt per case and 123.154 seconds. Original assertions and 60-second
deadlines remain. Complete saved host/mounted before/after dictionaries match
1154/`c1af679f…`; both exact owned CIDs are absent, 23 foreign IDs unchanged,
no host ports published and temporary power cleanup passed. The actual raw
report, cleanup and independent readback are retained under
`e2e-preferences-affected24-safe01`. It is history entry 14, diagnostic only,
`trustedGreenResult:false`; no full E2E gate was promoted. Previous history is
preserved. Fresh full 878, visuals, Pages and portable remain pending; Windows
visuals had started at this update and are not yet accepted. The observer only
aggregated stored reports and edited bookkeeping, with no browser/source jobs or
publication.

## Current preference revision — accepted visuals, full matrix running

Windows root 3194/bb88e9 completed exit 0: 24/24 and all 122 PNGs in 90.011
seconds, zero failed/skipped/flaky/global errors. All references, helpers and
1154/`c1af679f…` inputs stayed unchanged. Independent cleanup 66592/fc25de
completed exit 0: 26 exact birth/full-StartTime identities absent, 4173 free,
no PID reuse or process stopped; temporary power clear/close errors 0.

Linux root 85083/ce9035 then completed exit 0: 24/24 and all 122 separate PNGs
in 99.125 seconds with no failed/skipped/flaky/global errors. Structured mounted
preflight and independent inflight inspect f81b27 bind 1154/`c1af679f…`, pinned
image, exact owner/CID and read-only/no-host-port isolation. Baseline/helper/host
hashes were unchanged, exact owned CID removed, all 23 foreign full IDs preserved
and power cleanup passed. Both current visual gates are explicitly selected;
the independent selection observations retain hashes and report provenance.

Index: 25 PASS, five PENDING, one variable-font BLOCKED, no inconsistencies;
31 self-tests pass. Explicit native exit propagation confirms aggregate exit 2
for the blocker; earlier tool exit 1 came from the PowerShell wrapper status.
Fresh original full E2E `e2e-preferences-owned-linux-complete` (root 99878)
finished with actual exit 1 after an exact-owned controlled stop; it is
PARTIAL_DIAGNOSTIC_NOT_FULL. Last started progress was 840/878, with four WebKit
context-teardown timeouts (MultiSelect Gavia Dark and Autocomplete Gavia, Classic,
Classic Dark), no final raw JSON and no complete matrix totals. Retained traces
show passing body assertions before approximately 60-second context-close
failures; they do not establish the underlying cause. The old controlled-stop
reason says three, but the final log and four artifacts prove four local errors.
The full guard retained 1154/`c1af679f…`; both exact owned IDs were removed, all 23
foreign IDs preserved, no host ports published and power cleanup completed.
Independent readback and four-trace triage are retained under the ignored
verification directory. Base and current visual gates remain accepted. Complete
878, Pages/portable and manual/remote/publication evidence are pending. Native
output storage is a separate proposed A/B experiment with no causality or passing
replacement-run claim.

The completed two-case bind-output diagnostic
`e2e-webkit-close-two-bind-protocol01` failed both WebKit cases in 490.844 seconds:
one body timeout and one context-teardown timeout. Raw results show zero skipped,
flaky or global errors; source/distribution inputs stayed at 1154/`c1af679f…`, exact owned
cleanup and foreign-ID preservation passed. Its independent readback is retained
separately and does not complete full E2E. Native storage remains an A/B
experiment; no storage-causality claim is made. The subsequent native-output
pair (`e2e-webkit-close-two-native-safe-protocol01`) also failed its scoped gate:
one pass and one body timeout in 171.322 seconds. Native manifest/copy and exact
cleanup passed. This diagnostic is retained separately and does not complete full
acceptance or prove that storage was the cause.

The new native-results full producer (`6e6a61c5…`) is prepared with unchanged
878/all-project/one-worker/zero-retry/60s scope. It copies the stopped exact-owned
container's native output before removal, verifies the complete manifest/tree,
and preserves the container on failed, interrupted or unverified export. Export
has its own 120-second bound. An explicit index branch pins the reviewed
producer/preflight/contracts and checks output hashes, owner identity, chronology
and current visual/product equivalence. Its 81 in-memory acceptance tests include
the original 31 cases; current aggregation remains 25 PASS/five PENDING/one font
BLOCKED with no inconsistencies. No replacement full report is selected or
accepted by this preparation. The replacement
`e2e-preferences-native-owned-linux-complete` (session 46851) was gracefully
interrupted after known failures, using the unchanged 1154/`c1af679f…` product and
original full settings. Its actual child/run exit is 130 (root orchestration exit
1); the 878 scheduled reporter records contain only 95 actual attempts: 87 passed,
seven failed and one interrupted. There are 783 records without any attempt. Raw
`skipped:784` includes the interrupted record and is not the configured 30-skip
complete gate. Native manifest/copy, full input guard, exact two-CID cleanup,
foreign-23 preservation and awake closure passed; none passes the partial browser
matrix. The independent partial readback retains those distinctions. Complete
878 remains PENDING/unselected. The legacy acceptance branch also requires the
actual writable `/results` bind in Docker inspect, preventing native output from
entering that branch when mode metadata is removed.

A separate native-dist producer is prepared but has not created a volume or run
a browser. It derives the production subtree from a fresh explicit ready
snapshot, copies it to a fresh owner-bound local volume, and requires exact file
bytes/SHA, directory shape and millisecond HTTP mtime/Last-Modified preservation.
The staging writer is removed before the main readonly volume mount; the other
source binds and original full test/preflight/output-export settings remain
unchanged. Unverified output retains the exact main container and volume for
recovery. Its 52 isolated checks passed; no source or index acceptance rule was
relaxed. A reviewed explicit three-container/staged-volume acceptance branch is
still required before such a future run can be selected.

The [font audit](../docs/maintainers/font-variation-audit.md), root-applied SHA
`509f3de6…`, now records all eight numeral endpoint-data proofs and the corrected
four duplicate-K/seam-A correspondence candidate. This removes the earlier claim
that one padding location or signed-area obstruction is mandatory. It does not
prove boundary-role/optical intent, continuous containment/topology, global UPM/
hint/metadata treatment or real variable-font binary round-trip, shaping and
native raster behavior. Accepted static masters/assets remain unchanged and
still report 24 incompatible glyphs per style; no font was saved or built and
T5.3 stays Blocked. The audit was excluded from frozen browser inputs before
root's documentation-only application. No source or browser job was launched by
this observer.

The current staged-dist full attempt failed at 22:39:18 UTC on October 18
(`e2e-catalog-preload-native-dist-complete`, root tool completion `69323c`,
outer exit 1, Docker child exit 125 after unexpected EOF). The saved input guard
confirms all 1155 inputs unchanged at `f5e6c272…`; the temporary awake request was
cleared and closed, with no wrapper child left running. Docker engine API access
failed before cleanup inventory: no exact absence checks or native result export
completed, and volume cleanup is absent. Main CID `fda8e25b…`, metadata CID
`d0f0c6b…` and volume
`gavia-dist-e2e-catalog-preload-native-dist-complete-3332861d-bf3f-471e-b4a0-132a9a58d0bb`
remain UNRECONCILED; the stage CID had been verified absent before the main run.
The single subsequent read-only Docker API observation (`13a29d`, 22:40:39 UTC)
still failed. Current Windows/Linux visual passes remain valid; this incomplete
full attempt is failed infrastructure history, with no full-pass or cleanup claim.
No restart, prune, removal or additional verification job was performed.

# Review programme verification — 2026-10-18

## Current authorized checks — 2026-10-20

The user subsequently authorized existing lint, strict types, affected-code tests
and builds with fixes. Current results and outstanding repairs are recorded in
[the implementation ledger](IMPLEMENTATION.md). The no-runs instruction below
describes the preceding iteration and is superseded for those named gates only.
No new verification wrappers, commits, pushes, packaging or publication were
introduced; the older full-E2E/Docker failure is retained without restarting it.

The requested checks are now complete: final lint has zero errors and 39 length
warnings (715 files); both strict typechecks, affected tests and both production
builds pass. Initial compiler timeout and junction permission failures are kept
as history; their targeted retries pass with unchanged assertions and timeouts.
The original filesystem-capability skip also passed when rerun with permission.
FileUpload row-slot API punctuation was synchronized by the existing generator,
then its API check, documentation tests and final builds passed. Fresh E2E,
visual, Pages, installed archives, knip and manual acceptance are not claimed.

## Superseding implementation boundary — 2026-10-19

Missing current-stage code was added after the checks in this record: Toast and
confirmation tone/PT/lifecycle, public WlConfig integration in Playground,
compiler pinning/contract documentation and byte/string-color utilities with
their examples, guides and regression sources. No checks or generators were run
on these changes, and no verification harness was extended. Follow-up runtime,
type, package, browser, visual and Pages acceptance is pending. The previously
verified archive does not contain this code. See the current
[implementation status](IMPLEMENTATION.md#current-follow-up--code-prepared-verification-deferred).

The latest user instruction suspends new runs, commits, pushes and publication.
The subsequent lint/brand follow-up manually addresses the saved diagnostics,
updates lint policy and relocates brand originals into `archives/brand`.
A social SVG/PNG was created and viewed locally; that asset export is not a
browser/visual test or a renewed check. Lint, knip, type/unit/API checks,
derivative recovery and package/browser/Pages gates were not run afterward.
No current warning count or successful validation is inferred from these edits.
Everything below is retained historical evidence: "current" and "final" refer
to the named recorded snapshot/archive, not the latest dirty working tree.
The incomplete full E2E attempt and its unverified Docker cleanup remain open;
the Docker engine was not probed or restarted during the follow-up.

## Historical authorization and source

The user authorized all deferred local checks and fixes on 2026-10-18.
Commits, pushes, publication and external announcements remain unauthorized.
This record distinguishes local automated evidence from manual acceptance and
publication. The source is the dirty working tree based on `fc7792d`; the two
existing local commits are preserved.

Logs and machine-readable reports are retained in the ignored
`.tmp/verification-2026-10-18/` directory. Initial failures remain there alongside
corrected runs. They are not reported as successful checks.

Last verified Playground revision was `early-catalog-preload`, bound to the
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

## Confirmed results

| Gate | Result | Evidence |
| --- | --- | --- |
| Library production/declarations | Renewed after the final panel/ref correction on Node 22.14.0 and 24.19.0 | `build-ref-node22.log`, `build-ref-node24.log`; declaration diagnostics fail the build |
| Library full units | 122 files, 849/849 on each Node version | `unit-library-ref-node22-tests.json`, `unit-library-ref-node24-coverage-tests.json`; earlier 836/843 reports retained |
| Library coverage | Lines/statements 98.57%, branches 91.12%, functions 92.24%; configured gates unchanged and passed | `unit-library-ref-node24-coverage-summary.json`; successful 849-test quality snapshot promoted with the normal generator before rebuilding |
| Playground full units | Current early-catalog preload: 408/408 in 34 files on Node 22.14.0 and 24.19.0, strict exit 0 on both | `playground-catalog-preload-clean-node22/24-run.json` and raw JSON; identical 742-file source/test/config guards, helper `14bdc3f2…` unchanged, final regression `249d0c9b…` bound, no exceptions |
| Localization deduplication | 19/19 affected tests, strict typecheck and scoped lint passed | `i18n-dedup-tests.log`, `i18n-dedup-typecheck.log`; exhaustive EN/RU literal/copy/placeholder checks |
| Compatibility | Renewed against immutable 0.11.1 fixture | `compatibility-ref.log`; 53 historical components, 418 classes, 447 tokens and public contracts |
| Package lint / declaration entry points | Renewed on the final archive | `publint-ref.log`, `attw-ref.log`; strict publint, all packed JS, declaration and JSON entry points, no ignored attw rules |
| Tokens / icons / API / dependency boundaries | Passed | `tokens-final.log`, `icons-final.log`; 447 tokens, 5 themes, 115 contrast pairs, 113 icons; generated API current, Vue only required peer |
| Size budgets | All eight Vue 3.4/3.5 production fixtures passed again against the established baseline +5% limits; no reset | `size-ref.log`, `size-ref-evidence.json`, `scripts/size-limits.json`; original review sizes are historical |
| Maintainer tooling | 83 distinct Node cases and 8 Python font preflight cases passed | `tooling-summary.json`; Windows junction-dependent cases rerun successfully outside the restricted sandbox |
| Additional CI checks | Both Pages provenance cases passed; generated API check passed and all 12 responsive image derivatives verified | `pages-provenance-additional.log`, `api-additional.log`, `brand-images-additional.log`; actual Node 24 tool exits were zero, API check has empty output |
| Desktop font archive | Passed; 15 verified font/notice files, no publication | `font-archive.log`; ZIP retained locally |
| Full static-font acceptance | All 12 faces passed, including 120 numeral and 60 refined-letter checks, shaping, metrics and frozen TTF/WOFF2 identity | `static-font-full-readonly-run.json`, `static-font-full-readonly-qa.json`; unchanged full verifier and assertions, only its exact QA report destination redirected into ignored scratch; font sources, assets and canonical QA JSON unchanged |
| Variable-font structural preflight | Blocked, exit 1: 24 incompatible glyphs in each style across six accepted masters per style | `font-variable-audit-current.json`; reconfirmed in this run, static fonts unchanged; the eight passing audit unit cases do not establish build readiness |
| Integrated strict types | Unchanged-library evidence retained; current preload Playground strict checks completed exit 0 on both Node versions | `library-strict-node24-final.json`, `playground-catalog-preload-clean-node22/24-run.json`; actual compiler logs and source stability retained |
| Full ESLint | Current preload revision: 712 files, zero errors/fatal errors, 1,032 warnings, actual exit 0 | `lint-catalog-preload-final-clean-summary.json` and raw JSON; full source/test/config and prebuild source/distribution guards passed, environment restored |
| Installed archive consumers | Final archive: 5/5 lanes passed, 66 strict copied SFCs each, all nine desktop/mobile/SSR-hydration contexts passed | `consumer-ref-final-summary.json`; pnpm Vue 3.4.0/TS 5.4.5, Vue 3.4.38 and 3.5.40; npm/Bun Node lanes; native menu focus, stable IDs, events and font checks |
| Starters | Final-archive Vite, custom theme and Nuxt builds/SSR passed; actual Nuxt browser hydration passed with zero errors | `starter-final-496220bb87e3/summary.json`, `hydration/result.json`; all 188 files match the archive in each installation; same SSR/client DOM and IDs, working input/Clear, loaded Gavia Sans, independently verified owned-process/port cleanup |
| Windows visual, current early-catalog preload | PASS 24/24 and 122/122 PNG comparisons, zero failed/skipped/flaky/global errors, 229.894 seconds | `visual-windows-catalog-preload-final-summary.json`; 1155/`f5e6c272…` and all 122 reference hashes unchanged, helpers unchanged; independent 21 exact birth/full-start identities absent, 4173 free and awake cleanup zero |
| Windows visual, previous document-ready revision | PASS 24/24 cases and 122/122 PNG comparisons, zero failed/skipped/flaky, 79.648 seconds | `visual-windows-load-ready-final-summary.json`; all 122 reference hashes/helpers/1154 inputs unchanged at 1d54cd11…; authorized independent cleanup confirms 22 exact process identities absent, 4173 free; first CIM-denied attempt retained separately |
| Windows visual, previous URL-startup correction | PASS 24/24 and 122/122 PNG comparisons, zero failed/skipped/flaky/global errors, 90.011 seconds | `visual-windows-preferences-final-summary.json`; all reference/helper/1154 hashes unchanged at `c1af679f…`; independent cleanup confirms 26 exact identities absent and 4173 free; power lease cleared/closed |
| Docker/Linux visual, current early-catalog preload | PASS 24/24 and 122/122 separate PNG comparisons, zero failed/skipped/flaky/global errors, 215.257 seconds | `linux-catalog-preload-final-verified-summary.json`; 1155/`f5e6c272…`, all references and helpers unchanged, independent in-flight readonly/no-port proof, exact owned CID absent, 23 foreign IDs unchanged and awake cleanup zero |
| Docker/Linux visual, previous document-ready revision | PASS 24/24 cases and 122/122 separate PNG comparisons, zero failed/skipped/flaky/global errors, 115.101 seconds | `linux-load-ready-final-verified-summary.json`; mounted 1154/1d54 proof, baseline/helper/source guards unchanged, actual read-only/no-port inspect, exact owned CID absent and 23 foreign IDs preserved |
| Docker/Linux visual, previous URL-startup correction | PASS 24/24 and 122/122 separate PNG comparisons, zero failed/skipped/flaky/global errors, 99.125 seconds | `linux-preferences-final-verified-summary.json`; mounted 1154/`c1af679f…`, actual read-only/no-port inspect and unchanged baseline/helper proof; exact CID absent and 23 foreign IDs preserved |
| README UI capture | Real five-component EN capture in two themes, reviewed | `docs/brand/readme-preview.webp`; 848 × 454, 31,762 bytes; reproducible local capture script |
| Production browser regressions, previous Playground revision | 72/72 across all four projects, 18 each, zero failed/flaky/skipped; history rather than the current final gate | `e2e-production-affected-summary.json`; 1143 inputs unchanged during that run; includes five menu/portal themes, native links, anchors, 320px controls and hero transitions |
| Focused gate after E2E corrections | 7/8 passed on the first attempt, zero skipped/flaky; Firefox later nested-grid anchor failed, so the final full matrix was withheld | `e2e-production-gate-final-summary.json`; all four Field cases and native-tab handoffs passed; actual Ctrl/default-prevention telemetry recorded, 1143 inputs unchanged, owned cleanup complete |
| Focused gate after instant alignment | 7/8 passed, zero skipped/flaky; Chromium reached the overview anchor but its TOC link lacked `aria-current` | `e2e-anchor-instant-gate-summary.json`; four Field cases and all native-tab handoffs passed, 1143 inputs unchanged, environment restored and owned cleanup complete; full 878-case run withheld pending investigation |
| Focused gate after render-frame alignment | Diagnostic 3/8 passed, five failed, zero skipped/flaky; includes a 54.829-second Chromium page-creation stall and a real mobile nested-grid viewport failure | `e2e-anchor-frame-gate-summary.json`, `-trace-analysis.json`; 1143 inputs unchanged, environment restored, 31 exact owned identities gone and port 4173 free; no successful full gate inferred |
| Anchor click regression | Actual old-code 6/14 passed and 8 failed; final code 14/14 passed again on each Node version | `documentation-anchor-links-old-results.json`, `documentation-anchor-links-regression-summary.json`, `playground-anchor-owned-final-node22/24-run.json`; real hrefs and modified/default-prevented events covered without simulating browser geometry |
| Completed full production E2E, before late-target correction | All 878 completed: 846 passed, 2 failed, 30 configured quality skips, zero flaky/global runner errors | `e2e-anchor-owned-linux-complete-summary.json`, raw results and cleanup; Chromium lazy-target viewport and WebKit transient native-theme marker failures retained, 1143 inputs unchanged at `5796d882…`, both owned containers absent and all 23 foreign IDs preserved |
| Playground production build, current early-catalog preload | Actual exit 0: 920 modules, 24.84 seconds | `e2e-catalog-preload-final-build-run.json`; 756 source inputs unchanged at `a1d2f151…`, ready 1155/`f5e6c272…`, library archive `496220bb…` unchanged |
| Generated assets, renewed on both Node versions | Four successful current-preload checks: 113 icons, 447 tokens, five themes, 115 contrast pairs | `generated-assets-catalog-preload-final-run.json`; Node 22.14.0/24.19.0, check mode only, full 1155/`f5e6c272…` unchanged |
| Late-target anchor regression | Verified old code: three failed/two passed, zero unhandled errors; corrected focused slice: 37/37, exit 0 | `late-anchor-old-red-verified-summary.json`, `late-anchor-implementation-summary.json`, `late-anchor-final-focused-results.json`; initial harness-only failure retained separately |
| Native-theme viewport regression | Meaningful old-code result: 11/14 passed, three failed; final code 14/14 passed on Node 24.19.0 | `theme-viewport-old-red-summary.json`, `theme-viewport-implementation-summary.json`, `theme-viewport-final-green-results.json`; source `2efeb9e4…`, new regression `36dda284…`; no unhandled errors |
| Affected20, completed viewport revision | Actual exit 0, 20/20 passed across four projects, zero failed/skipped/flaky/global errors, one attempt each | `e2e-viewport-affected20-safe01-run.json`, raw JSON, mounted preflight/guard and exact two-CID cleanup; 1142 inputs unchanged at `1d143932…`, 125.565 seconds, no full gate promoted |
| First viewport-fix WebKit browser check | Raw browser 1/1 passed in 9.711 seconds, but the wrapper FAILED | `e2e-viewport-native-check01-run.json`, `-summary.json` and raw JSON; a periodic monitor read the newly created empty main CID file; exact cleanup and guards passed, narrow browser success is not a final gate |
| Affected20, previous document-ready revision | PASS 20/20, five exact titles × four projects, zero failed/skipped/flaky/global errors, one attempt each, 87.387 seconds | `e2e-load-ready-affected20-safe01-run.json`; 1154 inputs stable at 1d54cd11…, exact two-CID cleanup/foreign preservation/power release passed; scoped diagnostic does not promote full 878 |
| Affected24, previous URL-startup correction | PASS 24/24, six exact titles × four projects, zero failed/skipped/flaky/global errors, 123.154 seconds | `e2e-preferences-affected24-safe01-run.json`, raw results and independent readback; 1154/`c1af679f…` unchanged, exact two-CID cleanup and 23 foreign IDs preserved; scoped history only, not the full 878 gate |
| Affected20, preceding boot revision | FAILED: 19/20 passed; WebKit release-heading viewport ratio zero after reload at `project.spec.ts:122` | `e2e-boot-affected20-safe01-run.json`, raw JSON and exact cleanup; 1154 inputs unchanged at `158c2c66…`; subsequent reload diagnostics and the successful readiness correction are recorded below |
| Renewed browser and remaining site acceptance | Current preload Windows/Linux visuals PASS; full attempt INFRAFAIL/incomplete, cleanup UNVERIFIED; full gate, Pages and portable PENDING | Both 24/122 visual gates bind 1155/`f5e6c272…`; `e2e-catalog-preload-native-dist-complete` ended after Docker engine loss; 221 starts, no completed raw results/export or cleanup proof |

The earlier completed consumer matrix used archive SHA-256
`29aee93e8efa2a342bc4dd85a09170f86bc9a9f6b5f4386c7408958df3a4594d`,
retained as an ignored `gavia-ui-0.12.1-before-overlay-29a…tgz` backup.
The intermediate panel-correction archive has SHA-256
`2765665b4d458642e000157f573280d0d773c06878ba80f105a214c2040dd2ae` and is
retained as `gavia-ui-0.12.1-before-ref-2765665.tgz`. The final renewed archive is
`packages/ui-kit/gavia-ui-0.12.1.tgz`, SHA-256
`496220bb87e31c679f112b0f541751d5bd85f0c73011814a9e92843ee5c5dcb0`:
765,612 bytes, 188 entries. Both production/declaration builds, packing, strict
publint, declaration entry points, compatibility and unchanged size limits
passed. All five installed consumer lanes and final starter/build/SSR/hydration
evidence passed on that same archive. See `package-ref-summary.json` and
`consumer-ref-final-summary.json`.

## Defects found and corrected

- Declaration builds previously returned success with TypeScript diagnostics.
  Module-local development environment declarations and the Table development
  guard now typecheck, and `vite:dts` diagnostics fail the build.
- Generic declaration imports of bare `.`/`..` now normalize to explicit ESM
  index paths; strict Node16/NodeNext regression cases pass.
- Historical service adapter interfaces remain implementable by consumer void
  callbacks. New `WlToastController` / `WlConfirmController` interfaces describe
  the richer return values and methods exposed by the composables. Newly added
  PT component sections are optional in the historical map contract.
- IconButton union keys and Tag's inherited native `color` attribute preserve
  their released contracts without weakening strict negative link tests.
- A warning regression now awaits Vue's scheduled watcher. The copyable
  ContextMenu guide is a standalone SFC with public package imports.
- Shared Select/Autocomplete clear targets provide 24 usable CSS pixels;
  Autocomplete accounts for the adjacent dropdown's one-pixel border seam.
- E2E Alert assertions follow status/alert semantics. Native TimePicker and the
  new 12-hour interval example have independent production fixtures.
- Route checks cover canonical documentation paths as well as legacy query
  compatibility; canonical paths also have a strict reload/anchor regression.
- Large language resources reuse precompiled messages for copyable source.
  Fresh documentation chunks measure 389,779 bytes EN and 462,753 bytes RU,
  below Vite's existing warning threshold, without raising that threshold.
- Lint errors were repaired, including real label associations and robust
  changelog parsing, while preserving generic inference and template adapters.
- Installed Button size evidence now sums every retained package chunk rather
  than only `dist/index.js`; unused component/catalog checks remain enforced.
- Docker comparison explicitly disables snapshot updates and preserves JSON
  evidence outside its disposable container. Windows PNGs stay canonical.
- The visual capture helper must not enlarge the viewport around a fullscreen
  dialog: its `100dvh` height follows that viewport. Overlay captures now retain
  the actual mobile screen dimensions; ordinary tall font sections keep their
  existing complete-section capture behavior.
- Anchored overlays wait for rendered refs before caching the CSS layer or
  handing off initial menu focus. Live anchor/panel replacement rebinds
  observers, cancels stale scheduled work and reconciles stack ownership without
  repeating `onOpen`. Authored inline layers are retained independently of the
  helper's own inline z-index, so replacement and lower layers can be measured.
- Initial documentation anchors now observe asynchronously mounted page content,
  scroll once when the target is ready and cancel observation/frames on hash,
  root or lifecycle changes. Regression tests fail on the previous behavior.
- Ordinary documentation TOC clicks now hand one anchor request to application
  navigation, which owns history and render-frame alignment. Native fragment
  default and component scroll handlers no longer compete on those clicks.
  Ctrl/Meta/Shift/Alt, middle-button and already-prevented events retain their
  native handling and do not scroll the originating page. Real hrefs remain.
- Shared Playground runtime modules and Vite's preload helper no longer reside
  in an HTML entry. The isolated graph probe changed 144 static entry back-edges
  and seven lazy preload references to zero of each; a build-time guard rejects
  their return. Preload remains enabled, console assertions remain strict, and
  all five affected portal themes passed with strict zero-console assertions in
  each of the four browser projects. The isolated graph probe records the
  initial-loading tradeoff: 579 additional summed gzip bytes and three extra
  static JS requests; it is not a whole-application speed claim.
- Seven E2E files now describe the expanded live contracts: combined Field
  description/error IDs, scoped status outputs and duplicate TOC presentations,
  the 60-component manifest, 12-hour time example, full-text results, disabled
  last options and lazy inactive hero art. Native TimePicker and modified-link
  behavior remain covered. Long aggregate quality/catalog tests are split by
  existing audit/category without removing cases or increasing timeouts.

## Visual reference follow-up

The final shared-overlay fix exposed four Gavia Select crops on each platform:
the old references had been captured with the mount-race fallback `top: 4px` /
`z-index: 1`. The corrected panels are anchored at fractional coordinates and
use their actual CSS layer. Playwright encloses the element in an integer
screenshot rectangle, adding one edge row (143 to 144 pixels).

All four Windows expected/actual/diff triplets were viewed. CSS resources and
normalized listbox DOM match; all original rows match exactly after a one-row
desktop offset or zero-row mobile offset. The trace does not contain exact
bounding-box return values; that limitation is explicit in
`select-geometry-analysis/conclusion.json`. The guarded four-PNG adoption is
recorded in `windows-ref-select-adoption.json`, after which the entire Windows
24-case/122-image comparison passed. Earlier adoption manifests remain intact.
Linux had the same four one-edge-row candidates, individually reviewed with
zero changed RGBA pixels in the original 143 rows. Its guarded adoption and
original-file backups are recorded in `linux-final-496-adoption.json`; the
complete 24-case/122-image comparison then passed. Original Windows reference
bytes are retained in `windows-ref-select-original-backups.json` and its backup
directory. No component dimensions,
screenshot tolerances, CSS or package source changed for this reference update.

## Browser verification chronology

The first complete production browser matrix completed all 810 cases:
677 passed, 130 failed, three configured non-Chromium axe cases skipped,
zero flaky cases. Its JSON, all 130 failure traces, root-cause grouping and
owned-process cleanup are retained in `e2e-production-final-summary.json`.
It is diagnostic evidence and is not a successful final E2E gate.

That matrix exposed a shared anchored-panel
mount race (lost initial menu focus and a cached layer of 1 on reopening) and
an initial documentation-anchor race with asynchronous child pages. Corrective
source changes now have focused regressions, renewed full unit/coverage/type
gates and a rebuilt final library archive. Installed-browser, starter hydration,
Windows and Linux visual gates have passed on those corrections. The full
production E2E, Pages and portable gates still require their final results.

The diagnostic browser run also exposed an orchestration error: tests read
canonical CHANGELOG and quality JSON directly, so changing them while retaining
the old production build can produce a source/build mismatch. The quality input
was restored from its previous successful measurement while the new one was
retained separately. The next full run snapshots all source-read inputs and
production files and checks them again afterwards; a drift invalidates a green
browser result. No mismatch from this run is classified as a product defect.

Final browser projects, Pages build/prerender and desktop/mobile smoke, and the
portable preview are tracked during this verification run. Their results will
replace this paragraph only after completion.

The subsequent 878-case diagnostic was interrupted after 853 recorded starts;
the runner and preview were absent, with no final Playwright JSON or completion
totals. Its termination cause is unproven. The nine explicit failures and nine
traces comprise four copies of the stale Field role assertion, four page-creation
stalls (including one that consumed the body budget), and one unresolved Firefox
native-tab handoff. See `e2e-production-verified-interruption.json`; starts are
not counted as passed tests. All 1143 frozen inputs retained fingerprint
`f3f39cbb610631a2db7aa39d222162c21ea7481b55426df086581de98a3d33a3`.
Independent cleanup found no valid owned process and port 4173 free. A stale
parent-PID match to an older Windows process was explicitly excluded and left
untouched; descendant ownership also requires a compatible creation time.

Trace timing records a 59,789 ms `newPage` operation and 174,415 ms worker cleanup;
neither establishes a component or font/header defect. Windows power-event
correlation places the earlier overnight sleep before this run and outside those
stalls. The native-link failure occurred after a short successful click, with no
reported new page; its actual modifier/default-prevention values were absent
from that trace, so no component or browser cause is claimed.

After the interruption guard and cleanup, the reviewed Field assertion fix and
passive native-click telemetry were applied with SHA checks. The Field test
retains error text, focus, invalid-state and description/removal checks while
asserting the default absence of duplicate live announcements. Telemetry records
the actual click and popup timing without cancelling events or modifying the
application DOM. A new complete run will use the configured local one-worker
mode and the default pinned Chromium headless shell; all cases, assertions,
60-second test deadlines and zero retries are retained. This isolates a viable
execution lane and does not establish the cause of the two-worker failures.

The new eight-case gate passed seven cases and failed the later nested-grid
viewport assertion in Firefox. All four Field cases passed. Native-click
telemetry in all projects recorded a trusted Ctrl-click with final
`defaultPrevented: false`, a new context page and a retained original URL, with
no instrumentation errors. The four browser projects differ in when they report
the popup; those differences remain in the raw evidence. The failing anchor is
investigated separately, and the full 878-case run has not started. This gate
does not override or hide the failure with the earlier 72-case pass.

The gate's process-local environment comparison recorded absent/null variables
as empty strings after .NET restoration. PATH matched exactly; the child process
ended and no user/global environment was changed. Later invocations explicitly
remove originally absent process variables rather than treating null/empty as
an exact restoration.

A passive copy of the exact Firefox chain passed once, while trace timing showed
competing CSS smooth-scroll operations. Programmatic route and TOC alignment now
explicitly uses instant scrolling; assertions and global smooth-scroll CSS are
unchanged. Both Node Playground suites, strict types and full ESLint passed again,
followed by a fresh production build. The next eight-case gate completed with
seven passes and one Chromium failure: the hash and viewport checks passed, but
the requested overview section did not become current. All four native modified
clicks passed, with no final default prevention or telemetry errors. Source/dist
fingerprint `7270bc25557d7769b46b56f4d5bb08173f8f55805cbe6cefb582204649dffc12`
remained unchanged; process environment restoration and owned cleanup passed.

One passive Chromium reproduction also failed. The requested foundations heading
was at viewport top 174.421875 with root scroll padding 81px, both immediately
before the assertion and after its five-second wait. The scrollspy correctly
marked the preceding installation section. Fonts were loaded and the document
was visible and focused. This rules out a rounding-tolerance or stale-current-ID
fix for that reproduction; request-time geometry and later scroll/layout changes
are being measured before another product change. See
`anchor-scrollspy-passive-probe/results.json`. Neither passive probe establishes
stable final browser acceptance.

The final passive request probe passed the complete original chain once. Reading
request-time geometry immediately before the native call produced scrollTop 928
and heading top 81.421875, which remained aligned until Back/Forward. It did not
reproduce a later override or directly capture the original failed call, so the
exact browser/layout cause is still an inference. `App.navigate` now schedules
instant alignment in the next render frame, matching its existing history path;
pending navigation, location and unmount guards prevent stale work. The scrollspy,
CSS and browser assertions are unchanged. Both Node suites and strict types and
full lint passed again. A new production build completed with 754 unchanged
source inputs and 1143 source/dist inputs at fingerprint
`908ac6ff7726593d4a50845d1f2058161bbfe81ba952fb23d9b6b3cfffcf5064`.
The next focused gate and visual/full-browser renewals use this revision.

That render-frame gate completed with three passes and five failures, retaining
all traces and three native-click telemetry attachments (Firefox failed before
that attachment). Chromium spent 54.829 seconds in `browserContext.newPage`
before the body; its late undefined count was a whole-test timeout, not an
observed wrong count. Mobile Chromium separately recorded eight real offscreen
nested-grid samples. WebKit also exhausted deadlines during slow operations.
Source/dist remained at `908ac6…`; independent cleanup passed after repairing an
ignored PowerShell ISO-date parser, preserving its initial failure. No failed
gate is treated as passed.

The mobile trace retained the correct hash while scrollTop moved backwards.
Code inspection found both native fragment navigation and the component's
post-tick scroll handler. Their precise individual contribution was not captured
in that trace. A new mounted event-contract regression independently established
the concrete duplicate-owner/native-modifier defects: 6/14 old-code cases passed,
eight failed. After routing ordinary TOC activation through application navigation,
all 14 passed. Both full Playground unit phases then passed 351/351. A mistakenly
removed `nextTick` import was restored after scoped lint and the first Node 24
compiler exposed it; initial failed reports are retained. Fresh 14-case runs and
strict types on both Node versions passed after that restoration with stable
App, Docs and regression-test hashes. Full suites are not claimed to have had a
whole-source freeze across that import restoration.

The resulting production build and full lint completed successfully. Current
runtime source hashes are App `42d97f7b…` and Docs `f3d61051…`; 754 build source
inputs were unchanged and 1143 source/dist inputs have fingerprint
`5796d88271a3533005478be98c07f411deb2092f47498c0fd2303fea8ee902d8`.
Unit files are outside this browser-input snapshot and have their own recorded
hashes. Windows and Linux visual renewals passed on this exact build. The first
Linux wrapper lost its preflight evidence when Playwright cleared its output
directory, so that wrapper remains failed despite passing screenshot comparisons.
The corrected fresh run writes test artifacts in a child directory, preserving
the actual pre-test mounted-input proof; its complete wrapper passed. No proof
was reconstructed retrospectively. The complete 878-case browser matrix subsequently ran
in the pinned Linux container, matching the CI browser job's platform; Windows
remains the primary visual gate. Local container evidence is
not a remote CI execution, and the failed Windows diagnostics remain separate.

During this complete Linux run, the Chromium scrollspy scenario exposed a
different readiness gap: the static Icons TOC was clickable while `.docs-content`
was still empty. Resolved trace snapshots show no target H2 at the click or the
first expectation, then the target exists later with root scrollTop still zero.
The lazy Assets module completed after the click; fonts had already finished and
the scenario explicitly disabled smooth scrolling. The single-frame navigation
lookup drops a missing target instead of retaining a pending request. The
initial-only page hook cannot resume that later request. That matrix continued
without source changes through all 878 cases. The subsequent correction and its
renewed unit/build evidence are recorded below; no fresh browser pass is inferred.

The host then entered System Idle sleep at 16:58 local time. The later Windows
Power-Troubleshooter event records sleep `2026-10-18T13:58:29.1278177Z` and wake
`2026-10-18T16:48:04.7953347Z`; the E2E log stopped changing at 16:58:32 local.
After wake, exact container ID/name/image/owner checks confirmed the original
container was running, not paused, with no OOM or recorded container error.
Live Playwright/WebKit processes and subsequent case starts establish that the
same run resumed. It was not restarted or counted as complete during the pause.
See `full-linux-pause-power-events.json` and
`e2e-anchor-owned-linux-complete-pause-diagnostic.json`. The Chromium lazy-target
failure occurred before sleep and remains a product regression; the sleep does
not explain away that failure. No persistent power setting was changed.

The complete run subsequently finished all 878 cases: Chromium 256 passed/1
failed, mobile Chromium and Firefox each 197 passed/10 configured quality skips,
and WebKit 196 passed/1 failed/10 configured quality skips. The second failure
is the native theme transition's intermediate marker assertion in WebKit; its
trace is retained for separate analysis. All 1143 inputs remained unchanged.
Both owned container identities were independently absent after cleanup, all
23 foreign container IDs were preserved and no host ports were published.
The temporary SystemRequired power request was also cleared and closed after
completion, with zero native API errors. That infrastructure wait's success
does not turn either failed browser case into a pass. Corrective source work
starts only after this completed run and cleanup.

## Late-target and viewport-preserving checkpoints (history)

The completed Linux matrix is retained as a failed diagnostic: 846 passed,
two failed, 30 exact configured non-Chromium quality skips, zero flaky cases
and zero global runner errors. All 878 had one attempt and retry 0. The later
source corrections are new revisions; no earlier visual or browser pass is
silently transferred to them. Local Linux evidence follows the CI browser job's
platform and is not a remote CI execution or a successful Windows full matrix.

The Chromium Icons failure was a real delayed-target code defect, not a font
load failure. A route/hash-scoped shared controller now retains a request until
the actual heading mounts, and cancels stale requests/observers/frames when its
scope changes. Old-code regression completed with three failures and two passes;
the decisive delayed-child case mounted its target before asserting. The final
four-file focused slice passed all 37 cases. Initial harness-only errors remain
retained separately rather than counted as product failures.

The WebKit trace separately exposed a test timing race: a valid native marker
disappeared between approximately 461 and 633 ms, before the late assertion at
about 651 ms; the real snapshot animation lasts 500 ms. The finished callback's
exact time was not instrumented, so natural completion is the code-supported
explanation rather than a directly observed callback timestamp. The test now
pauses only native snapshots 1 and 3 using CSS animation-play-state before the
real API call. Physical Enter cancels 1 into normally animated 2; the original
rapid-click chain cancels 3 into normally animated 4–6. It returns the original
native object and its real ready/finished promises, writes no native marker,
and preserves all physical-input, zero-duration, count and URL assertions.
All 121 existing assertion/deadline calls are byte-identical. No duration,
timeout or tolerance was increased. See linux-owned-webkit-native-theme-trace-analysis.json
and theme-switch-native-hold-change.json.

The preceding late-target-only Playground suite passed 367/367 in 28 files on each of
Node 22.14.0 and 24.19.0, followed by actual exit-0 direct strict compiler phases.
Both fresh runs retained stable source/test hashes without temporary source
restoration. The earlier 351-case import-restoration history remains above and
is not reused for later stable runs. Actual tool completions are recorded
for sessions 7809 and 20345; run metadata and raw JSON remain the durable evidence.

That revision's full cached lint completed exit 0 on Node 24.19.0: 704 files, zero errors/fatal
errors and 1,032 warnings. All 927 code/test/config paths were stable; every
actually linted path was included in the before/after snapshots. The separate
1143-input production/dist lint guard also passed. Warnings are visible and this
is not a warning-free claim. Four fresh generated-asset checks completed exit 0
on both supported Node versions: 113 icons, 447 tokens, five themes and 115
contrast pairs, without regenerating source assets.

That revision's production fixture build completed exit 0 (session 87735), with
918 modules in 9.19 seconds. All 754 build-source inputs remained at
4ab6d8904ae26d43cf088bcff6ad72535c870eb4963c11b0243a3a4f7c8dd77e.
The fresh ready snapshot has 1142 source/dist inputs at
7dd95a28c5a2308cbf1b40233d042c83adfb1852e8e7064074acb72f3fa74447.
Its count differs from the prior build and is the actual snapshot count, not an
assumed constant. Library archive 496220bb…5dcb0 remains unchanged.

At that preceding late-target checkpoint, renewed affected-browser acceptance,
primary Windows visuals, supplemental Linux visuals, the complete production
matrix, Pages build/prerender/smoke and the portable archive remained PENDING. Only actual
completed reports, unchanged-input guards and exact owned cleanup may update
these statuses. Earlier reviewed baseline adoption remains historical evidence;
no PNG or comparison tolerance was changed during the renewal.

The first affected 20-case renewal then completed with 19 passed and one
WebKit native-theme failure, zero skipped/flaky cases. It passed the earlier
native-marker, keyboard and finished-count checks but failed the following live
pointer predicate. The exact two-container cleanup and all 1142 frozen inputs
remained valid at 7dd95a28…. Offline snapshots show scrollTop changing from 0 to
96 during the first mouse-click interval and remaining 96 after both native
transitions finished; the failing predicate did not record the actual hit node.
No product/hit-testing cause is assigned without the separately authorized
read-only diagnostic. This 19/1 report is not a successful affected or full gate.
See e2e-anchor-late-affected20-summary.json and late-webkit-pointer-trace-analysis.json.

A separately instrumented, single-WebKit production diagnostic reproduced the
failure. Its 29 events and eight geometry samples show the only JavaScript
home-title scroll completed before the test reset the viewport to zero. The
later 0-to-96 shift occurred during native capture without another JavaScript
scroll call; focus moved from the button to BODY. After both native transitions
finished, the button was at y=-15, the actual hit was the sticky header, and no
animation or native marker remained. A second diagnostic adding two real paint
frames after the reset reproduced the same failure. Both failed reports and
attachments remain preserved; neither is a successful browser gate. The exact
internal browser mechanism is unproved. The temporary instrumentation and paint
experiment were removed byte-for-byte, restoring the original test SHA dd42d7aa….
Both diagnostics released their exact containers and temporary system-awake
handles with clean input guards. One permission-review dispatch timeout was
retried and the actual diagnostic subsequently completed; a separate filename-
collision preflight started no browser. The temporary paint probe was removed,
and the original E2E source is exactly restored at SHA dd42d7aa….

### Native-capture viewport preservation

The source now saves both viewport coordinates for the native request and
restores them immediately before invoking the real theme update, only if that
request is still current and no newer user input occurred. All four capture
input listeners are released on update, cancellation, error and disposal. No
viewport restoration runs after awaiting the update or from ready/finished.
This keeps newer user intent and stale-request cancellation in control; the real
native object, promises, marker ownership and animation duration remain intact.
The final source is `theme-transition.ts` SHA `2efeb9e4…`; its new mounted
regression is `playground-theme-transition.test.ts` SHA `36dda284…`.

Actual old-source execution returned exit 1 with 11 passed and three failed out
of 14, with no unhandled errors. The final focused run returned exit 0 with all
14 passed and stable source/test hashes. See
`theme-viewport-old-red-summary.json`, `theme-viewport-implementation-summary.json`
and `theme-viewport-final-green-results.json`.

The final full Playground suite then passed 381/381 in 29 files on both
Node 22.14.0 and 24.19.0, followed by actual exit-0 strict compiler phases.
`playground-viewport-final-node22/24-run.json` records stable full source, test
and config dictionaries, helper SHA `14bdc3f2…`, exact PATH/location restoration and
zero temporary-source exceptions. Root tool sessions 74440 and 96676 completed
exit 0. The current 705-file cached ESLint run also completed exit 0: zero
errors/fatal errors, 1,032 visible warnings, all 928 code/test/config paths and
every linted path covered by unchanged guards. Its separate 1142-input
source/dist guard stayed at `1d143932…`; see `lint-viewport-final-summary.json`.

The fresh production fixture build completed exit 0 (session 61962): 918 modules
in 10.86 seconds. Its 754 build-source inputs stayed at
`54eba7f5b87b283170885772573e2bd9307c900a8e309e46c6cd3866560cc289`.
The actual ready snapshot contains 1142 source/dist files at
`1d143932f421f0ba290cc6ba99a08902488352d941b0a86023beba1c3470ba9f`.
Four fresh icon/token check-mode jobs on the two supported Node versions passed
with unchanged inputs; see `generated-assets-viewport-final-run.json` (actual
root completion 78f2fb). Archive `496220bb…5dcb0` is unchanged.

The first viewport-fix single-WebKit browser case really passed 1/1 in 9.711
seconds, with zero skipped/flaky cases or browser errors. Its wrapper still
FAILED: the periodic monitor read a created-but-empty `main.cid` file and kept
that assertion in `monitorErrors`. Final exact two-CID absence, 23 preserved
foreign containers, no published host ports, input guards and temporary power-
request cleanup all passed. `e2e-viewport-native-check01` remains failed wrapper
history; the narrow browser result does not waive the next affected/full gates.

Three new CID-safe host copies preserve the failed originals. Only the periodic
monitor may defer a trimmed-empty CID; final, post-probe, post-exit and cleanup
reads remain strict, malformed nonempty IDs still fail, and an established ID
cannot change. Their syntax checks and 42 isolated behavior assertions passed;
no Docker/browser was used by that harness. The initial harness newline-only
comparison failure is retained separately.

The fresh CID-safe affected gate then completed exit 0 with all 20 passed:
five exact existing titles on Chromium, mobile Chromium, Firefox and WebKit,
one attempt each, zero skipped/flaky/global errors, 125.565 seconds. Its actual
mounted before/after proof and host guards retain all 1142 inputs at `1d143932…`.
Both owned CIDs were absent, all 23 foreign IDs unchanged, no host port published,
and the temporary power request cleared/closed. This is the affected diagnostic
gate, not the full 878-case acceptance. See `e2e-viewport-affected20-safe01-run.json`.

Primary Windows visuals subsequently passed 24/24 cases and all 122 PNG
comparisons in 167.683 seconds, with no failed/skipped/flaky cases. All reviewed
reference hashes, helper hashes and 1142 source/dist inputs stayed unchanged.
`visual-windows-viewport-final-independent-cleanup.json` independently confirmed
23 exact process identities absent, port 4173 free and no processes stopped.

Supplemental Linux visuals completed 23 passed/one failed, zero skipped/flaky
cases, in 138.041 seconds. Desktop Gavia Dark home failed the unchanged first
five-second visible-locator assertion before drawing readiness or any screenshot
comparison for that case. There is no expected/actual/diff PNG for that failure;
118 review captures from the remaining work are retained. All 122 baseline
hashes and all 1142 source/dist inputs stayed unchanged. The exact owned
container was absent, 23 foreign IDs unchanged, no host ports published, and
the temporary power request cleared/closed. This failed attempt remains history.

Offline review verifies every one of 33 requested asset paths exists and matches
the frozen ready SHA256; all eight captured response bodies also match exact
dist bytes. All 24 completed responses are HTTP 200; nine request records lack
completion and do not prove HTTP failure. The initial Home graph was requested
2073.247 ms after DOMContentLoaded, after sequential bootstrap and Russian shell
catalog work. The saved inspect shows no explicit CPU/memory caps, IPC=host and
read-only current dist. Actual host VM, CPU, filesystem or server delay cause
is unmeasured. See `linux-viewport-final-independent-waterfall-review.json`.

The next correction is being prepared to request only the initial route alongside
bootstrap and locale work, sharing typed cached route imports and evicting failed
requests for retry. Its future source/build/unit/lint/asset/visual/E2E reports are
not selected yet. No timeout, assertion, baseline or tolerance was relaxed. Full
production E2E, Pages and portable acceptance remain PENDING; these completed
viewport results cannot be transferred to that later boot revision.

## Separate acceptance

NVDA, VoiceOver, owner acceptance, remote CI execution and actual publication
need separate evidence. No local check establishes them. Variable-font
interpolation remains blocked by 24 incompatible glyphs per style; the original
static Gavia drawings are preserved. Post-1.0 scope remains explicitly tracked
in `10-post-1.0.md` rather than being represented as delivered code.

The font investigation now has actual pinned FontTools/Skia tools isolated in
ignored `.tools/font-build`; no global installation or font asset changed. The
complete existing static-font verifier subsequently passed all twelve faces with
its sole report write redirected into ignored scratch. This also checks HarfBuzz
shaping, every glyph component, numeric alternates, accepted geometry and frozen
binary/non-name table identities. Static-font acceptance is separate from the
failing variable-master topology check. The
real drawing pipeline exactly reproduced 192 affected numeral variants and 96
tabular aliases. Joint Cu2Qu conversion gives compatible streams for digit 3,
but the other seven affected digits already differ at the offset/boolean stage.
Digit 4 demonstrates a contour-topology change before curve conversion. Common
point counts, arbitrary padding or the passing static audit do not establish
correspondence. A normalized representation still needs drawing/quantization,
interpolation, shaping, size and native optical acceptance. No variable-font
build, geometry-tolerance approval or 80 KB result is claimed. See
`font-correspondence-findings.md` and its actual pipeline capture reports.

A separate bounded digit-two candidate now proves exact common master structure
for all 36 accepted normal/italic and default/tabular/proportional outlines in
six master groups. Each derived contour has 55 points; all 1704 original points
and complete flags/cyclic order remain. The 138 tracked constant quadratics add
276 points only at original explicit integer anchors. Removing those additions
recovers all 36 exact accepted contours and their directed polynomial streams;
the original implied midpoints and metrics are retained. An independent saved-
output validator rereads accepted TTFs and rejects seven deliberate corruptions.
All 46 guarded inputs stayed byte-identical. See
`font-two-anchor-feasibility-summary.json`, `font-two-anchor-proof-checks.json`
and `font-two-anchor-feasibility-findings.md`. This is digit-two master feasibility
only: no font was built or saved, no other glyph was accepted by this candidate,
and intermediate interpolation, shaping, rasterizer/hinting and optical review
remain untested. The variable-font gate remains blocked.

## Boot correction checkpoint (history)

The selected initial page now starts loading alongside bootstrap; bootstrap
waits for that shared page request and its catalog preparation concurrently
before mounting. App uses the same typed cache, failed imports are evicted for
retry, and shared loader/navigation modules remain outside the HTML entry.
The frozen source handoff is recorded in `playground-cold-page-final-handoff.json`.
The focused 19-case unit and initial strict runs preceded final import formatting;
that limitation is retained, and complete final-source renewal follows below.

Fresh final-source Playground units actually passed 389/389 in 31 files on both
Node 22.14.0 and 24.19.0; both strict phases returned exit 0. The stable helper
and full source/test/config inputs remained unchanged without restoration
exceptions. Root sessions 22098 and 82822 completed exit 0; see
`playground-boot-final-node22/24-run.json` and their actual raw unit JSON.
Full lint then records 708 files, zero errors/fatal errors and 1,034 warnings,
actual exit 0. Its 931 code/test/config inputs stayed unchanged and cover every
linted file. The separate lint production/dist guard covers the actual prebuild
1143-file dictionary, rather than falsely claiming the later built dictionary.
See `lint-boot-final-summary.json` and its raw/guard reports.

The actual production fixture build completed exit 0 with 919 modules in 8.42
seconds. Its 755 source inputs stayed at
`0ca8af15ac902ede1643291bca35c77fafaef4e3316895e1f04ae60d2b14c8ef`.
The fresh ready dictionary contains 1154 source/dist files at
`158c2c660efd86cfaa44bf64d1fe8c1bdaa04562c7d29f83dc0f0dcb05c44852`;
fixture SHA is `d5664fc2ad07c048d237d6844d1cd7fa0d339d081c8c9d97f4a3af654c478ed0`.
Four fresh icon/token jobs passed on both supported Node versions with the
entire ready dictionary unchanged. The active selector binds nine actual source
hashes and only these completed base reports; 31 index self-tests passed and
aggregation returned the expected font-blocker exit 2: 23 PASS, seven PENDING,
one BLOCKED, no inconsistencies. The boot affected20 then completed actual
exit 1: 19 passed/one WebKit failure, zero skipped/flaky/global errors, one attempt
each, 99.339 seconds. After reload, `project.spec.ts:122` resolved the release
heading but its viewport ratio stayed zero during the unchanged five-second
assertion. This observed failure is under investigation; no root cause is
assigned from the result alone. Both exact owned CIDs were absent, all 23 foreign
IDs unchanged, no host ports published, all 1154 inputs stable at `158c2c66…`,
and the temporary power request cleared/closed with zero API errors. See
`e2e-boot-affected20-safe01-run.json`, its actual raw JSON and cleanup. No new
visual or full run started after this failed gate; full E2E, Pages and portable
remain unselected/PENDING.

## Digit-five proof and the demonstrated method boundary

A separate bounded inspection read 180 accepted variants for digits 3/5/6/8/9.
Only five was normalized: all 36 accepted normal/italic and spacing variants
share 62 points in six master groups. All 2076 original points/full flags and
original cyclic order remain. The 78 tracked constant quadratics add 156 integer
points at existing explicit anchors; both four-control chains and all six
original implied midpoints per contour are retained. Removing those additions
recovers all 36 exact directed polynomial streams and actual TTF metrics.
The independent saved-output validator rejected seven corruptions. All 46
protected accepted/source/fixture/capture inputs stayed unchanged. The initial
inspection `KeyError: postCu2Qu` is retained as a harness failure; the corrected
inspection, five producer and independent validator each actually returned 0.
See `font-remaining-anchor-summary.json`, `font-five-anchor-proof-checks.json`
and `font-remaining-anchor-findings.md`.

The obstruction certificates concern one explicit operation only: inserting
`Q(P,P,P)` at existing explicit on-curve integer anchors while preserving every
original point. This adds isolated one-control blocks and cannot change an
existing run of two-or-more off-curve controls, a line block or contour count.
Across 24 six-master groups/144 accepted outlines, digit 3 has different existing
multi-control chain lengths; 6 and 9 lose a two-control counter chain in heavy
masters; 8 has different line-block counts. These invariants prove the limits
of that operation, not impossibility of all exact normalization methods.
The ambiguous native starts in 8 are separately recorded and are not used as
its impossibility certificate. Four's contour topology and accepted Bold integer
geometry remain outside this candidate. No new chain splitting, implied-point
rounding, line replacement or geometry tolerance was introduced.

Zero, two and five therefore have bounded common-master proofs in ignored data.
No font was built or saved. Intermediate interpolation, native rasterizer/hinting,
serialization, shaping, optical acceptance and variable delivery remain untested;
the actual 24-glyph-per-style structural release blocker remains unchanged.

## Current document-ready revision

A separately authorized one-WebKit diagnostic reproduced the preceding boot
release-anchor failure: 0/1 passed, actual exit 1. Only project E2E instrumentation
changed from the 158c2c66 product; the diagnostic snapshot c1202829 was guarded
throughout. One pre-DOM telemetry error about missing documentElement is retained,
so this is not described as error-free instrumentation. Later forwarded calls
show the app's real scrollIntoView at 163 ms moving scrollY 0→1371 while interactive;
load followed at 167 ms and pageshow at 192 ms. At 245 ms, scrollY returned to 0 with no
recorded JS scroll or focus call, constant target/document geometry and BODY
focus; fonts became loaded at 269 ms. These observations support a restoration-
ordering problem but do not expose the browser's exact internal reset cause.
The original project test SHA dd6238e5… was restored before implementation;
`project-reload-diag-source-restoration.json` proves all 1154 original product
inputs exactly recover 158c2c66 with zero changes. Cleanup removed both exact
owned CIDs, preserved all 23 foreign IDs, published no ports and released the
zero-error temporary power request. Raw failed reports remain history.

The shared anchor owner now waits for document/presentation readiness and the
target's active font-ready promise before its guarded one-time instant alignment.
Existing complete documents bypass the document-load wait. Stale route/hash
requests, replacement, detach and cancellation release readiness listeners;
resolved stale promises cannot perform a later scroll. The controller still
uses scoped target observation and scheduled frames without timers or polling
loops. Current hook SHA is a92db077…; the added meaningful readiness unit file is
03752123…. App's associated 86a5fb00… change is comment-only. The initial 24-case
slice preceded a final queued-frame variable extraction, explicitly disclosed;
the following full renewals validate the final source bytes.

Actual final 397/397 units in 32 files and strict types passed on both supported
Node versions, sessions 26754/45afd0 and 97596/b001c8, with stable full source, test
and config dictionaries and helper `14bdc3f2…`. Full cached lint completed exit 0:
709 files,
zero errors/fatal and 1,032 warnings; all 932 code/test/config paths unchanged and
every linted file covered. Its 1154-file prebuild production/dist guard 9f68a01d…
is distinct from the subsequently built dictionary. The actual production build
completed 919 modules in 6.73 seconds, exit 0; 755 source files stayed at 2a03df57… and the
new 1154-file ready fingerprint is
`1d54cd11554c2164c1a1f6908a63d5d167c039789382d6c9dacd6530e83b5276`.
Four new Node 22/24 asset jobs passed with this full dictionary unchanged.
At the completed-base checkpoint, the selector bound
`initial-route-and-document-ready-anchors`; all 31 self-tests passed and the
aggregate had 23 PASS/seven PENDING/one font BLOCKED, no inconsistencies. The new affected20
then completed actual exit 0 (root 26177/696c38): all 20 passed across four projects,
five exact titles, one attempt each, zero skipped/failed/flaky/global errors,
87.387 seconds. The full 1154 dictionary remained unchanged at 1d54cd11…; exact
two-CID absence, 23 preserved foreign IDs, no published ports and zero-error power
release passed. See `e2e-load-ready-affected20-safe01-run.json` and its actual raw
JSON/guards/cleanup. This scoped pass does not complete the 878-case gate.

Primary Windows visual subsequently passed 24/24 cases and all 122 PNGs in
79.648 seconds, with unchanged references/helpers and all 1154 inputs at 1d54cd11….
The authorized independent cleanup checked 22 exact CIM birth/full StartTime identities:
all absent, port 4173 free, no reused foreign IDs and no process stopped. The first
unsuffixed independent attempt failed CIM permission before checking any PID
(checked 0); it remains preserved and does not establish a process leak. Only
`visual-windows-load-ready-final-independent-cleanup-authorized.json` is selected.

Supplemental Linux visual also completed actual exit 0: 24/24 cases and all 122
separate PNG comparisons in 115.101 seconds, zero failed/skipped/flaky/global
errors. Its actual mounted preflight verified 1154/1d54 before the reporter began;
all 122 baseline hashes, source/dist and helpers stayed unchanged. Saved inflight
inspect proves exact CID/image/name/owner identity, read-only product mounts and
no published host ports. The exact owned CID was absent after cleanup, all 23
foreign IDs unchanged and the temporary power request cleared/closed with no
API error. See `linux-load-ready-final-verified-summary.json`, actual raw results,
`mounted-inputs.json` and `linux-load-ready-final-verified-inflight-inspect.json`.

The saved 1d54 aggregate has 25 PASS/five PENDING/one font BLOCKED, no
inconsistencies; all 31 index self-tests passed. Root intentionally stopped
`e2e-load-ready-owned-linux-complete` (session 26783) after a confirmed completed
Chromium failure at `preferences.spec.ts:92`: “Back and Forward restore each
visit's language and theme mode after manual choices and reload”; assertion 105
expected HTML lang `ru` but observed `en`. Last started progress was 393/878;
there is no final raw result JSON, complete pass/skip count or mounted-after
report. This is `PARTIAL_DIAGNOSTIC_NOT_FULL`, not a completed matrix outcome.

The exact owned main CID was identity-checked and stopped at 19:15:58Z; its saved
inspect reports exit 143, while the producer/awake host completed exit 1. The
unchanged wrapper preserved its FAIL and missing-result error. Independent
readback verifies both exact CIDs absent, no host-port publication, all 23
foreign full IDs unchanged and the power lease cleared/closed with API errors 0.
Saved ready, host before/after and mounted-before dictionaries agree on all 1154
files at 1d54; archive SHA remains 496220bb…. Root's later App correction is
explicitly distinguished from the immutable old-run source proof. See
`e2e-load-ready-owned-linux-complete-partial-independent-readback.json` and the
controlled-stop, native run/summary/inspect, cleanup, input guard and awake reports.

Trace/source analysis identifies a startup ordering defect: early preload
initialized the EN locale ref; browser Back restored the correct RU URL before
App mounted. Late `readInitialView` used that stale EN ref and rewrote the RU
route as English; the App history watcher had not mounted for that earlier Back.
The completed trace is retained in the
`preferences-Back-and-Forwa-b7b99-r-manual-choices-and-reload-chromium` artifact;
`preferences-startup-current-url-proposal.json` records the exact timeline.

After owned cleanup, root installed the regression and minimal App correction.
The meaningful old-product run actually failed five cases/succeeded six; the
first run with a wrong working directory is retained as a harness failure only.
The corrected App reads explicit preferences from the current URL at startup,
using the preloaded theme ref only when that visit has no valid explicit theme.
The unchanged 11-case regression then passed 11/11 (root 4567/26d148), following
old-product exit 1 (10611/c930f6). See
`preferences-startup-old-red-cwd-{run,results}.json` and
`preferences-startup-fixed-green-{run,results}.json`. App SHA is `4b87023b…`.
The focused pass does not promote full units, a browser gate or release readiness.
The first renewed lint found one regression formatting error; its failed report
is retained, and fresh complete units/types/lint must bind the final formatted
bytes before new build/assets/browser acceptance.

New affected24 helpers preserve the five previous exact titles and add this
preferences title: six titles × four projects, diagnostic only. All three syntax
checks and 33 isolated scope checks passed; no browser job was launched by their
preparation. Original browser assertions/deadlines remain unchanged. New
lint/build/generated-asset helpers use fresh preference-final prefixes and were
only prepared/syntax-checked by this observer. The partial attempt is retained
as the thirteenth history entry with no final totals and no gate promotion.

Fresh completed base evidence was subsequently selected atomically as recorded
below; previous visual passes cannot cover the changed App. Corrected-revision
full878, affected24, renewed visuals, Pages and portable remain pending. No commit, push, package/Pages publication or external announcement was
performed.

## Current URL-startup preference correction — completed base

Both fresh clean stable lanes completed actual exit 0: Node 22 root 88361/09dfa5
and Node 24 root 49249/4f796e. Each raw report contains 403/403 passing assertions
in 32 files, zero failed/pending/todo, followed by strict vue-tsc exit 0. Their
complete source/test/build/config dictionaries match before/after and between
runtimes. Helper `14bdc3f2…` is unchanged, and no drift exception applies. Final
regression bytes are `bdd4f0d8…`. Earlier successful 403-test lanes checked the
pre-format bytes; these clean lanes cover the final three-line formatting
correction after the initial lint failure.

Clean full ESLint completed actual exit 0 (91995/004d16): 709 files, zero errors
or fatal errors and 1,032 warnings retained. All 932 code/test/config paths were
stable and every raw lint path was covered. Its prebuild 1154-file guard retained
`a68df5fb…`, separately recorded from the subsequent built product snapshot.

The fixture production build completed actual exit 0 (27829/b1d195): 919 modules
in 7.75 seconds. All 755 source inputs remained at
`1e99613088eea6b24db7a45cd6161d3f03897cb8261ffd033719f7bf78b5bf31`.
The 1154 ready files hash to
`c1af679f3c3d00555e34e60394a5fdabe854cc3f63209c57c37d7a4978965d99`;
App `4b87023b…` and the eight other selected source hashes are bound to that
dictionary. The unit regression is outside production inputs and is separately
bound by both full lane guards and explicit lint source hashes. Four generated
asset checks then completed exit 0 on both supported runtimes (edad41), verifying
113 icons, 447 tokens, five themes and 115 contrast pairs, with the entire ready
dictionary unchanged. Library archive `496220bb…` remains exact; no new package
or font build is inferred.

The active selector was backed up and atomically replaced with completed base
reports only, revision `current-url-startup-preferences`. Previous Windows/Linux
visual selections were removed and preserved in the old-selector backup. All 31
index self-tests passed; the report-only aggregate exited 1 with 23 PASS, seven
PENDING, one variable-font BLOCKED and no inconsistencies. It is not release
readiness. `preferences-clean-base-selection-observation.json` records exact
reports, hashes and actual root completions.

The affected24 run subsequently completed actual exit 0 (root 20646/83e50c):
24/24 passed, six exact titles in each of Chromium, mobile Chromium, Firefox and
WebKit. Raw duration is 123,153.779 ms (123.154 seconds), with zero failed,
skipped, flaky or global errors, one attempt per case, one worker, zero retries
and the original 60-second deadlines. It includes the previously failing
Back/Forward preferences case without assertion changes. Saved ready, host
before/after and mounted before/after dictionaries agree on all 1154 files at
`c1af679f…`. Both exact owned CIDs were removed, all 23 foreign IDs preserved,
no host ports published and the temporary power lease cleared/closed without
API errors. See `e2e-preferences-affected24-safe01-run.json`, raw JSON, cleanup,
guards and `-independent-readback.json`.

This scoped success is history entry 14, `DIAGNOSTIC_AFFECTED_NOT_FULL`, with
`trustedGreenResult:false`; it does not fill the full 878-case gate. The original
13 history entries and failed partial attempt remain. Full E2E, renewed visuals,
Pages and portable are still pending. The current Windows visual run had started
at this update and has not been selected. The observer only read reports and
updated bookkeeping; no browser, source or publication job was launched.

## Current preference revision — both visual platforms accepted

Primary Windows comparison completed actual exit 0 (root 3194/bb88e9): 24/24
cases and all 122 PNG comparisons/captures in 90.011 seconds, zero failed,
skipped, flaky or global errors. All 122 reference hashes match the previously
reviewed dictionary; updates remained disabled and tolerances unchanged. Saved
1154-file before/after dictionaries match the current `c1af679f…` ready snapshot;
helper hashes stayed unchanged. Independent cleanup completed actual exit 0
(66592/fc25de): all 26 persisted PID/CIM-birth/full-StartTime identities absent,
no PID reuse, 4173 free, no process stopped. The temporary power lease cleared
and closed with API errors 0. See `preferences-windows-visual-selection-observation.json`.

Supplemental Linux comparison also completed actual exit 0 (85083/ce9035):
24/24 and all 122 separate PNG comparisons/captures in 99.125 seconds, zero
failed/skipped/flaky/global errors. Persisted mounted verification preceded
reporter start and verified 1154/`c1af679f…` plus all 122 baselines using pinned
image `c7a43566…`. The independent inflight inspect (f81b27) binds exact
CID/name/image/owner, read-only product mounts covering every frozen file and
no host-port publication. Host dictionaries, baselines and helpers stayed
unchanged. The exact owned CID was absent after cleanup; all 23 foreign full
IDs remained, and the power lease cleared/closed with no API errors. See
`preferences-linux-visual-selection-observation.json` and retained raw reports.

Both visual gates are now explicitly selected for `current-url-startup-preferences`.
The aggregate has 25 PASS, five PENDING, one font BLOCKED and no inconsistencies;
all 31 self-tests pass. Explicit propagation confirms Node's native aggregate
exit 2 for the structural font blocker. Earlier tool-level exit 1 observations
came from PowerShell's wrapper status and do not change the recorded gate counts.

The fresh original full 878-case matrix `e2e-preferences-owned-linux-complete`
(session 99878, awake lease `awake-full-preferences-linux`) was deliberately stopped
after four WebKit context-teardown timeouts. Root verified the exact main CID,
name, owner and image before stopping it; the orchestration finished at
2026-10-18T20:47:27.124Z with actual exit 1. This is
PARTIAL_DIAGNOSTIC_NOT_FULL: the last recorded start was 840/878, with no final raw
result JSON or complete matrix totals. The four local failures were MultiSelect
Gavia Dark and Autocomplete Gavia, Classic and Classic Dark. Each retained trace
shows the test-body assertions passing, followed by a separate approximately
60-second context-close timeout; those local observations do not prove a cause or
complete matrix acceptance. The immutable controlled-stop reason mentions three
failures, while the final log and four trace artifacts establish four.

The full guard retained the same 1154/`c1af679f…` source and distribution files.
Both exact owned container IDs were absent after cleanup, all 23 foreign full IDs
were unchanged, no host ports were published and the awake lease was cleared and
closed. See `e2e-preferences-owned-linux-complete-partial-independent-readback.json`
and `webkit-four-context-teardown-independent-triage.json`. Current base and visual
acceptance remain valid; complete 878, Pages/portable, manual assistive-technology
and remote/publication acceptance remain pending. A native-output storage A/B
experiment is being prepared separately; neither storage causality nor a passing
replacement run is inferred.

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

The root-approved [font audit](../docs/maintainers/font-variation-audit.md) now
records bounded endpoint-data proofs for all eight affected numerals. Some use a
hypothetical 2000 UPM representation; every accepted endpoint/flag/order and
physical metric is recovered. Four's duplicate-K/seam-A candidate disproves the
earlier unique-padding/mandatory-area-obstruction claim, but still needs review
of boundary-role transfer and intermediate drawing. Continuous containment and
topology, whole-font UPM/hint/metadata treatment, real variable-font binary
round-trip/instantiation, shaping and native optical/raster acceptance are
unproved. No font was saved/built or accepted static asset replaced. The actual
24-incompatible-glyphs-per-style gate therefore remains BLOCKED. Root's audit-only
application is retained in `font-audit-endpoint-delta/root-application.json`;
it was outside the frozen browser scope and did not alter runtime inputs.

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

# Visual baseline maintenance

All commands here require separate authorization for heavy checks. Inspect the
expected/actual/diff before updating PNGs; Windows/Chromium stays canonical.

`pnpm test:visual` compares images with saved PNGs through
Playwright `toHaveScreenshot` rather than only taking screenshots. It compares six
recipes, complex content, button/palette focus, invalid fields and open
Select/Dialog/Drawer in Classic, Classic Dark and Newspaper on desktop/mobile.
Separate Gavia and Gavia Dark baselines check real Gavia Sans, home,
font page and open Select/Dialog. Five themes are covered in total.

Baselines: `apps/playground/e2e/visual-baselines/`.
Canonical environment: Windows + Chromium from pinned Playwright 1.58.2;
CI uses a separate `windows-2022` job. Desktop: 1280×900,
mobile: 390×844; DPR 1, ru-RU, UTC, fixed date, reduced motion.
Classic baseline fonts are Arial and monospaced Consolas;
Newspaper retains its heading-font role. Allowed difference: 0.2% of pixels.
During capture, the playground header uses normal positioning so it does not cover
the top of tall examples. Functional tests retain the actual sticky header.
Select list screenshots wait for panel entry and align only the frame origin
to whole CSS pixels: fractional fixed positioning changes text rasterization
during cropping. List dimensions, fonts and styles are preserved; interaction tests
check dropdown placement and accessibility.
A separate Linux job continues interaction checks in
Chromium, Firefox, WebKit and mobile Chromium.

For an intentional visual change:

1. Run `pnpm test:visual` and inspect expected/actual/diff.
2. Review changed states and all five themes in the playground.
3. Update baselines with `pnpm test:visual --update-snapshots`.
4. Review every changed PNG and rerun without updating.

CI never updates baselines automatically; screenshots and diffs are saved
as artifacts. Describe the reason for a baseline change in review.

Browser commands start a separate Vite on 4173 by default. To check
an existing local playground, set `GAVIA_E2E_BASE_URL`, for example
in PowerShell: `$env:GAVIA_E2E_BASE_URL = 'http://127.0.0.1:5175'`.
Without it, CI starts its own preview. Scenario and baseline tests
disable smooth page scrolling; separate interaction tests check
overlay motion.

Supplemental Docker/Linux screenshots use separate baseline and result paths;
see [the CI guide](ci.md#supplemental-linux-visual-checks).

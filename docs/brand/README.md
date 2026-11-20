# Legato UI brand sources

The Playground uses the [Legato wordmark](../../apps/playground/src/assets/brand/duetto/legato-wordmark.svg),
the [script L favicon](../../apps/playground/src/assets/brand/duetto/legato-favicon.svg) and
the [Duetto arch](../../apps/playground/src/assets/brand/duetto/duetto-arch.webp).
Link previews use the [Legato social image](../../apps/playground/public/legato-social.png).
The [arch master](../../archives/brand/duetto-arch.webp) and
[paper master](../../archives/brand/laid-paper.webp) preserve the original artwork.
The Playground serves compressed copies at the original dimensions.

## Historical Gavia artwork

The Gavia UI mark is [gavia-ui-mark-lake.svg](gavia-ui-mark-lake.svg): a loon
forming a G, a round transparent eye and primary color #294451.
Its silhouette matches [gavia-ui-mark-v2.png](../../archives/brand/gavia-ui-mark-v2.png).
The former Playground header took its mark color from the theme, and its favicon used
Gavia’s primary color. Its wordmark is [gavia-ui-logo-v2-eye.png](../../archives/brand/gavia-ui-logo-v2-eye.png).

Original artwork was made with built-in imagegen, with a transparent background
and cutouts in the mark. Prompts, authored PNGs and historical variants are
preserved in the version-controlled [source archive](../../archives/brand/README.md).

This directory contains final SVG/WebP assets and their documentation.
The [relocation record](../archive/brand-source-separation.md) records the move,
original hashes and source recovery. Original artwork has not been re-encoded.

When changing the mark, preserve the G silhouette, bill and transparent eye.
Check legibility at 26 px beside the name and version in every theme.

<a id="social-preview"></a>

## Historical Gavia social preview

[gavia-social.svg](gavia-social.svg) is the self-contained 1280 x 640 source for
the [public PNG](../../apps/playground/public/gavia-social.png). It combines the
existing Gavia mark with outlined Gavia Regular lettering on a warm background.
No external fonts or images are required to display the SVG. The PNG export is
57,179 bytes. Both were inspected locally for the mark, lettering and margins;
browser metadata and external social-card rendering remain unverified.

The former square blue mark is preserved as
[gavia-social-original.png](../../archives/brand/gavia-social-original.png).
Previously shared `gavia-social.png` links use this archived design. New link
previews use the Legato image listed above.

## README component preview

`readme-preview.webp` is a real Chromium capture of PageHeader, Field, Input,
Switch and Button in Gavia and Gavia Dark, using the English ProfileForm recipe
and the shipped Gavia Sans. It is not a generated mockup. The capture frames
cloned rendered components without changing the application or recipe.

Start an explicitly requested production preview, then run:

```sh
node scripts/capture-readme.mjs --base-url http://127.0.0.1:4174/
```

The command does not build or start a server. It writes the WebP (maximum 200 kB)
and local provenance in `.tmp/readme-preview/evidence.json`. Review the result
before including it. The 2026-10-18 capture is 848 × 454 and 31,762 bytes.

<a id="фон-первого-экрана"></a>

## Hero background

The daytime [gavia-lake-hero-v2.webp](gavia-lake-hero-v2.webp) is a photographic
background of a quiet lake at dawn: gray-blue water, a misty conifer shore and
a loon on the right. Soft light on the left leaves space for text.
The image contains no lettering, UI or artificial white panel.

PNG source: [gavia-lake-hero-v2.png](../../archives/brand/gavia-lake-hero-v2.png).
Built-in imagegen was used without a CLI. An original landscape was generated
first, then the bird’s position was adjusted. The user’s sketch guided color
and composition; its pixels, text and interface were not copied.
Exact prompt and revision:
[gavia-lake-hero-v2-prompt.txt](../../archives/brand/gavia-lake-hero-v2-prompt.txt).

Size: 2172 × 724, ratio 3:1. The bill tip is around 79% of the width, the head
at 82% and the body at 83–95%; vertically, the bird occupies roughly 43–67%,
with its reflection below. When cropping, check the bill, eye, silhouette,
visibility beside the installation panel and text legibility.

[gavia-lake-hero-v1.png](../../archives/brand/gavia-lake-hero-v1.png), 1774 × 887, is the historical
illustrated variant with sunset lighting and gray-olive water.
Prompt: [gavia-lake-hero-v1-prompt.txt](../../archives/brand/gavia-lake-hero-v1-prompt.txt).
Use a new version suffix for future revisions and record source provenance.

Gavia Dark and Classic Dark use [gavia-lake-night-v2.webp](gavia-lake-night-v2.webp):
the same location, shore and loon on a moonlit night with soft blue light.
The moon replaces the original sun on the left horizon, partly hidden by the
same ridge. Its silver reflection follows the original sunlight axis.
The moon’s position is not adjusted to fit the interface.
[PNG source](../../archives/brand/gavia-lake-night-v2.png) and
[exact prompts](../../archives/brand/gavia-lake-night-v2-prompt.txt).
Built-in imagegen, no CLI; 2172 × 724. WebP quality 86, with no crop or color
changes during export. Gavia, Classic and Newspaper use the daytime scene.
Gavia Dark and Classic Dark use the nighttime scene. Both Legato themes use
the Duetto arch.

The browser selects a 640, 1024, 1600, 1920 or 2172 px landscape.
Each landscape loads on the first visit to a theme that uses it. Loaded
landscapes stay available for later light/dark transitions.
URL metadata does not preload all variants. Where View Transitions API is supported, changing the theme uses
one temporary whole-page transition. Other browsers apply color tokens immediately
while the hero keeps its image crossfade. `prefers-reduced-motion: reduce`
disables both transitions.
A ghost `WlIconButton` in the hero’s upper-right corner has a colored 32 px sun
or moon icon and a 44 × 44 px hit area. It switches Legato ↔ Legato Dark,
Gavia ↔ Gavia Dark and Classic ↔ Classic Dark. Newspaper switches to Classic Dark and returns on the
next click. The idle icon has no background box; keyboard focus adds an outline.

The previous [v1 night variant](../../archives/brand/gavia-lake-night-v1.webp) is kept for history.

## Information card backgrounds

- [gavia-forest-card-v1.webp](gavia-forest-card-v1.webp): a light misty forest
  along the lower and right edges. [PNG source](../../archives/brand/gavia-forest-card-v1.png) and
  [exact prompt](../../archives/brand/gavia-forest-card-v1-prompt.txt).
- [gavia-reeds-card-v1.webp](gavia-reeds-card-v1.webp): beige seed heads and shore
  grasses on the right of a warm light background.
  [PNG source](../../archives/brand/gavia-reeds-card-v1.png) and
  [exact prompt](../../archives/brand/gavia-reeds-card-v1-prompt.txt).

Both were made with built-in imagegen, without a CLI, at 2172 × 724 (3:1).
The left two-thirds are left clear for text.
Light themes use soft multiply blending. In dark themes, grayscale CSS inversion,
screen blending and a gradual mask retain visible silhouettes on the dark surface;
source images and composition are shared.
The original WebP exports preserve dimensions and use quality 86 without crop,
composition or color changes. Responsive derivatives use the maintained
[artwork pipeline](../maintainers/playground-performance.md#responsive-brand-artwork)
and remain lazy-loaded. Archived PNG files remain the sources.

Backgrounds are decorative: `alt=""`, `aria-hidden="true"`. Card and hero content
remains HTML. Content determines block size. Review text contrast and mobile
cropping in every theme.

Palette and contrast: [Gavia theme](../theme-gavia.md).

The GitHub README button is [playground-button.svg](playground-button.svg):
a standalone SVG with Gavia’s primary color and the text “Open Playground”.

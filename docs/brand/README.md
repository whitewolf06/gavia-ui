# Gavia UI brand sources

The Gavia UI mark is [gavia-ui-mark-lake.svg](gavia-ui-mark-lake.svg): a loon
forming a G, a round transparent eye and primary color #294451.
Its silhouette matches [gavia-ui-mark-v2.png](gavia-ui-mark-v2.png).
The playground header takes the mark color from the theme; the favicon uses
Gavia’s primary color. The wordmark is [gavia-ui-logo-v2-eye.png](gavia-ui-logo-v2-eye.png).

Images were made with built-in imagegen, with a transparent background and
cutouts in the mark. Prompts are saved in `*-prompts.txt` and
`gavia-ui-mark-v2-prompt.txt`. v1 and preview variants are kept for history.

When changing the mark, preserve the G silhouette, bill and transparent eye.
Check legibility at 26 px beside the name and version in every theme.

<a id="фон-первого-экрана"></a>

## Hero background

The daytime [gavia-lake-hero-v2.webp](gavia-lake-hero-v2.webp) is a photographic
background of a quiet lake at dawn: gray-blue water, a misty conifer shore and
a loon on the right. Soft light on the left leaves space for text.
The image contains no lettering, UI or artificial white panel.

PNG source: [gavia-lake-hero-v2.png](gavia-lake-hero-v2.png).
Built-in imagegen was used without a CLI. An original landscape was generated
first, then the bird’s position was adjusted. The user’s sketch guided color
and composition; its pixels, text and interface were not copied.
Exact prompt and revision:
[gavia-lake-hero-v2-prompt.txt](gavia-lake-hero-v2-prompt.txt).

Size: 2172 × 724, ratio 3:1. The bill tip is around 79% of the width, the head
at 82% and the body at 83–95%; vertically, the bird occupies roughly 43–67%,
with its reflection below. When cropping, check the bill, eye, silhouette,
visibility beside the installation panel and text legibility.

[gavia-lake-hero-v1.png](gavia-lake-hero-v1.png), 1774 × 887, is the historical
illustrated variant with sunset lighting and gray-olive water.
Prompt: [gavia-lake-hero-v1-prompt.txt](gavia-lake-hero-v1-prompt.txt).
Save new variants beside it with a new version suffix.

Gavia Dark and Classic Dark use [gavia-lake-night-v2.webp](gavia-lake-night-v2.webp):
the same location, shore and loon on a moonlit night with soft blue light.
The moon replaces the original sun on the left horizon, partly hidden by the
same ridge. Its silver reflection follows the original sunlight axis.
The moon’s position is not adjusted to fit the interface.
[PNG source](gavia-lake-night-v2.png) and
[exact prompts](gavia-lake-night-v2-prompt.txt).
Built-in imagegen, no CLI; 2172 × 724. WebP quality 86, with no crop or color
changes during export. Daytime art is used in all light themes
(Gavia, Classic and Newspaper); nighttime art in both dark themes.
The shared hero layout is preserved.

Both images are preloaded and remain two hero layers. The night layer appears
after loading. Where View Transitions API is supported, changing the theme uses
one temporary whole-page transition. Other browsers apply color tokens immediately
while the hero keeps its image crossfade. `prefers-reduced-motion: reduce`
disables both transitions.
A ghost `WlIconButton` in the hero’s upper-right corner has a colored 32 px sun
or moon icon and a 44 × 44 px hit area. It switches Gavia ↔ Gavia Dark and
Classic ↔ Classic Dark; Newspaper switches to Classic Dark and returns on the
next click. The idle icon has no background box; keyboard focus adds an outline.

The previous [v1 night variant](gavia-lake-night-v1.webp) is kept for history.

## Information card backgrounds

- [gavia-forest-card-v1.webp](gavia-forest-card-v1.webp): a light misty forest
  along the lower and right edges. [PNG source](gavia-forest-card-v1.png) and
  [exact prompt](gavia-forest-card-v1-prompt.txt).
- [gavia-reeds-card-v1.webp](gavia-reeds-card-v1.webp): beige seed heads and shore
  grasses on the right of a warm light background.
  [PNG source](gavia-reeds-card-v1.png) and
  [exact prompt](gavia-reeds-card-v1-prompt.txt).

Both were made with built-in imagegen, without a CLI, at 2172 × 724 (3:1).
The left two-thirds are left clear for text.
Light themes use soft multiply blending. In dark themes, grayscale CSS inversion,
screen blending and a gradual mask retain visible silhouettes on the dark surface;
source images and composition are shared.
WebP files are the playground loading versions: same dimensions, quality 86,
with no crop, composition or color changes. PNG files remain the sources.

Backgrounds are decorative: `alt=""`, `aria-hidden="true"`. Card and hero content
remains HTML. Content determines block size. Review text contrast and mobile
cropping in every theme.

Palette and contrast: [Gavia theme](../theme-gavia.md).

The GitHub README button is [playground-button.svg](playground-button.svg):
a standalone SVG with Gavia’s primary color and the text “Open Playground”.

---
"gavia-ui": minor
---

Enable variable Gavia Sans font delivery while retaining the accepted static
fonts and authored drawing. The source derives exact common numeral geometry,
builds a real 100–700 variable axis with Core and complete international faces, and provides CSS with
static fallbacks and the existing Gavia family alias.

The Playground font page adds a live 100–700 weight slider (step 1), numeric
readout and synchronized presets. Intermediate values update the custom sample
and alphabets immediately in either style without changing the text or size.

Draft generation passed for both styles and all six accepted weights, including
exact geometry, metrics and shaping after WOFF2 serialization. Exact IUP uses
zero tolerance and verifies every reconstructed tuple delta. Four variable WOFF2
files are now canonical package/site assets. Accepted static font binaries,
frozen identities and source artwork remain unchanged. The existing CSS import
enables variable faces and keeps static registrations under a negative feature
query, avoiding native face-matching competition at the authored weights.

Core combines Latin-1, common Cyrillic, numbers and punctuation in one request.
Complete faces retain every original character and layout feature, including
canonical composition and combining clusters. CSS declares complete faces first,
then Core; the existing Playground plugin preloads normal Core. Only private
Core glyph names are omitted; serialization guards restore the original GID
mapping for exact outline, metric and shaping checks. No contour approximation
or positional-table change is used. The builder rejects either Core file above
80,000 bytes before writing any output.
Focused Windows Chromium checks pass: the Russian Gavia home page loads one
75,428-byte Core file; both styles, the six masters, weights 450/550, exact
Core/full cluster raster and the 35-entry standalone ZIP are verified.
The owner accepted the font visually on 2026-10-22. Layout-shift measurements
and verification of the exact release candidate remain pending. Existing font/CSS
exports stay stable; the generated variable manifest is included when present.

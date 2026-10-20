# Playground loading and asset maintenance

The current source separates site text, copyable SFC source and artwork from the
initial shell. Bundle and transfer budgets need a separately authorized
production build and browser measurement; review figures are not current results.

## Locale resources

`src/i18n/index.ts` imports each language/namespace dynamically. Bootstrap waits
for the current shell and route before mounting. Navigation keeps the previous
page visible until its text is ready; language selection keeps complete previous
text until the new locale is loaded. Failed loads expose retry without replacing
the last complete view. Other-language catalogs are not fetched by a cold visit.

`build/i18n.ts` uses `@intlify/unplugin-vue-i18n` with the runtime-only Vue I18n
build and compiler removal. Virtual resources leave canonical JSON readable by
Node release tooling. Literal encoding preserves emails, code, braces, pipes,
quotes and line breaks, and supports the existing named placeholders. Missing
Russian keys receive English fallback at build time. Compact reverse-lookup
keys replace eager imports of the other language for metadata localization.
The build rejects hash collisions rather than returning a different translation.

Home receives only the two Button messages it uses alongside shell text. Full
example, documentation, token and changelog catalogs load with their pages.
`virtual:gavia-catalog-summary` derives home counters and theme options from
the generated token catalog, so initial theme resolution needs no full token
array. Canonical token JSON remains generated exclusively by `tokens:sync`.

## Copyable examples

Examples, recipes and additional guides import only the selected `?raw` SFC.
`useLazySource` shares successful/in-flight loads, drops failed cache entries
for retry and ignores obsolete results after selection changes or disposal.
Copying is disabled until the selected source is ready. The running example and
copy text continue to originate in the same SFC.

`scripts/example-source-core.mjs` contains the browser-safe transform without
dictionary imports. The existing Node wrapper keeps the canonical English
default for package checks. Literal `examples.*` and `documentation.*` calls are
resolved when exporting; do not introduce arbitrary i18n calls into a copied
example. For a dynamic value, translate a literal string then use a function
replacement so user text containing `$` remains unchanged.

## Responsive brand artwork

Authored PNG sources live in the tracked [brand archive](../../archives/brand/README.md);
final WebP originals remain in `docs/brand`. Their bytes are unchanged. Twelve derivatives
in `src/assets/brand` cover 640/1024/1600 widths. `srcset` also retains the
original 2172-wide image for larger pixel densities. Cards retain lazy loading;
the night hero enters the DOM on the first dark-theme visit and stays cached
for later transitions. Eager URL metadata does not fetch all image bytes.

Generate with an explicit path to **sharp 0.35.5**, available in a workspace or
the bundled document/image runtime; no global installation is needed:

```sh
node apps/playground/scripts/brand-images.mjs --write --sharp-module /absolute/path/to/sharp
node apps/playground/scripts/brand-images.mjs --check
```

The generator reads archived PNGs and keeps source SHA256, output dimensions/bytes/SHA256 and encoder
versions in its manifest. It prepares every image in memory before writing
owned derivatives. `--check` uses Node only and detects source drift or altered
derivative bytes. The generated inventory totals 309,304 bytes across every
size of every image; a browser selects individual candidates, so that total is
not the home page's transfer size. The first 640-wide day/night images are
17,886 / 16,406 bytes; original WebPs are 112,136 / 110,972 bytes. These are file
sizes, not measured loading or visual improvements.

Existing manifest paths record the original `docs/brand` source locations;
the checker maps those exact names to the archive without relaxing hash checks.
This relocation has not been checked or regenerated in the no-runs iteration.

Inspect Windows expected/actual/diff before accepting screenshot changes.
Production locale/preferences/navigation, five-theme desktop/mobile rendering,
chunk sizes and the 80 KB gzip / 400 KB transfer targets remain pending until
the explicit production/browser checks run.

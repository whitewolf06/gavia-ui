# Theme builder

Open Theme Builder from the menu, search or a home-page link.
Its direct URL is `?view=theme-builder`. GitHub Pages keeps the `/legato-ui/` subpath.

## Editing the palette

1. Choose Legato, Legato Dark, Gavia, Gavia Dark, Classic, Classic Dark or Newspaper as a base.
   Changing the base resets colors; Reset colors restores the current base palette and keeps the name.
2. Enter a new name: 1–32 characters, beginning with a lowercase Latin letter,
   followed by lowercase letters, digits or hyphens. The shipped identifiers
   (`legato`, `legato-dark`, `gavia`, `gavia-dark`, `white`, `graphite`, `newspaper`) are reserved.
3. Set eight roles: page background, cards, soft surface, primary and muted text,
   borders, primary action, and links/focus. Native color pickers and HEX inputs
   support `#rgb` / `#rrggbb`.
4. Try buttons, inputs, Select, Checkbox and Switch in the live preview, including
   disabled and invalid states. Incomplete HEX input is not applied: the preview
   keeps the last valid color and export stays blocked until the input is fixed.
5. Review contrast. Each row shows its ratio and threshold. Selected text and
   focus pairs are checked, not the accessibility of the entire theme. Low contrast
   is flagged; selected colors are not replaced automatically.

The selected primary color is preserved. The button text and hover color
are chosen automatically for contrast. Link color is configured separately.
Soft states and stronger borders are derived from the palette;
status colors, dimensions, typography and motion come from the base.

By default the preview is isolated with `data-wl-theme` and local token overrides.
The teleported Select panel receives the same attribute and styles through
`pt.overlay`. Editing the palette does not change the header or other pages.
Changing the header theme preserves the preview settings.

### Apply the palette to the Playground

Click **Apply to Playground** to use the current valid palette across the site.
The base theme and generated token overrides are applied to `html`, so the header,
other pages and overlays teleported to `body` use the same colors. Editing the
preview afterwards does not update the global palette until you apply it again.

The header shows the applied palette name and an **Undo** button on every page.
Undo removes the temporary root overrides and restores the previous theme
preference, including system mode. Choosing any built-in theme also cancels the
applied palette, even when choosing its current base again. A direct URL selecting
a different built-in theme takes priority over the saved palette.

The applied snapshot is stored separately as `legato-ui.applied-theme.v1` and
restored before the first paint after a reload. It does not change the editable
draft's schema or the CSS/JSON export format. Browser storage can be unavailable;
in that case application and Undo still work in the current tab. Applying the
palette is opt-in: ordinary visits and prerendered pages keep the standard themes.

A draft with valid values is saved only in this browser:
name, base and colors are stored in `localStorage` under `legato-ui.theme-builder.v1`.
Restoration validates the schema version, name, base and each HEX value.
Invalid data is skipped. If browser storage is unavailable,
settings remain in memory until the page is closed.

## Export

- **For an agent** — a ready task with a JSON specification and steps for creating
  CSS through the public generator or CLI.
- **JSON** — a v2 input config: `schemaVersion`, `name`, `baseTheme`, `palette`
  and `mode`, with optional manual `overrides` and `contrastPairs`. Derived
  bindings and `colorScheme` are not user settings. It is not loaded
  automatically by mounted components; pass it to `createWlTheme` or the CLI.
- **CSS** — a complete base snapshot with changes, the `wl.tokens` layer, a safe
  selector for the new name and `prefers-reduced-motion`. The full snapshot lets
  aliases in every layer resolve at the theme root, including component portals.

Choose a format and click Copy, or use **Download config** to save the same JSON
as `<name>.theme.json`. If clipboard access is unavailable, a field appears for
manual copying. Generate or check the downloaded config directly:

```sh
pnpm exec legato-theme --config my-gavia.theme.json --output my-gavia.css
pnpm exec legato-theme --config my-gavia.theme.json --output my-gavia.css --check
```

The CLI and preview use the same generation logic. For the full/delta contract,
manual overrides, exit codes and scoped contrast checks, see the
[customization guide](theming.md#generate-css-from-a-versioned-config).
Older v1 exports remain palette-only snapshots when read; their derived fields
do not become manual overrides. Browser draft storage and the applied snapshot
keep their separate v1 formats.

Import full CSS after library styles
and set the new theme name on `html`:

```ts
import 'legato-ui/styles/base.css';
import './my-gavia.css';
document.documentElement.dataset.wlTheme = 'my-gavia';
```

For a new built-in repository theme, follow the separate
[maintainer token procedure](../maintainers/tokens.md): edit the canonical source,
register the name and metadata, synchronize generated files and verify the theme.
Consumer v2 configs do not register a new built-in theme or change existing names.
The editor does not publish packages or change repository files from the browser.

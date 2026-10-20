# Theme builder

Open Theme Builder from the menu, search or a home-page link.
Its direct URL is `?view=theme-builder`. GitHub Pages keeps the `/gavia-ui/` subpath.

## Editing the palette

1. Choose Gavia, Gavia Dark, Classic, Classic Dark or Newspaper as a base.
   Changing the base resets colors; Reset colors restores the current base palette and keeps the name.
2. Enter a new name: 1–32 characters, beginning with a lowercase Latin letter,
   followed by lowercase letters, digits or hyphens. The five shipped identifiers
   (`gavia`, `gavia-dark`, `white`, `graphite`, `newspaper`) are reserved.
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

The preview is isolated with `data-wl-theme` and local token overrides.
The teleported Select panel receives the same attribute and styles through
`pt.overlay`. Editing the palette does not change the header or other pages.
Changing the header theme preserves the preview settings.

A draft with valid values is saved only in this browser:
name, base and colors are stored in `localStorage` under `gavia-ui.theme-builder.v1`.
Restoration validates the schema version, name, base and each HEX value.
Invalid data is skipped. If browser storage is unavailable,
settings remain in memory until the page is closed.

## Export

- **For an agent** — a ready task with a JSON specification and steps for creating
  a theme through canonical `packages/ui-kit/tokens/source.json`.
- **JSON** — `schemaVersion`, `name`, `baseTheme`, `colorScheme`, `palette`,
  foundation `overrides` and separate `semanticBindings` for the primary action.
  This playground format is not loaded automatically by the public library.
- **CSS** — a complete base snapshot with changes, the `wl.tokens` layer, a safe
  selector for the new name and `prefers-reduced-motion`. The full snapshot lets
  aliases in every layer resolve at the theme root, including component portals.

Choose a format and click Copy. If clipboard access is unavailable,
a field appears for manual copying. Import the CSS after library styles
and set the new theme name on `html`:

```ts
import 'gavia-ui/styles/base.css';
import './my-gavia.css';
document.documentElement.dataset.wlTheme = 'my-gavia';
```

For a permanent repository theme, the agent first copies each token value from
`themes[baseTheme] ?? value` into a new snapshot, then applies foundation overrides
and the specified semantic bindings. After registering the theme name and metadata,
run `pnpm tokens:sync` / `pnpm tokens:check` and check contrast and components.
The new theme extends the existing system; previous themes and public names remain.
The editor does not publish packages or change repository files from the browser.

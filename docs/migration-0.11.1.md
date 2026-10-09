# Upgrade to Gavia UI 0.11.1

0.11.1 is a patch release with styling and documentation fixes.
Props, events, slots, public class/token names and import paths are preserved.
Type changes from 0.11.0 are described in the [0.11.0 migration](migration-0.11.0.md).

## Update

```bash
pnpm add gavia-ui@0.11.1
```

After upgrading, import styles and themes the same way. These fixes belong
to the library CSS; no application overrides are required.

## Styling

- Breadcrumb separators have equal spacing on both sides.
- WlPill aligns text with the dot and takes its content width.
  For a full-width label, set `style="width: 100%"` explicitly.
- The main accent in light Gavia changed to `#3c7490`; hover is `#376b84`
  and active is `#326179`. Accent text and links use `#326179`
  to keep readable contrast on soft selected surfaces.
  Use `--wl-text-accent` for custom links and `--wl-action-primary-*`
  for primary actions. Gavia Dark and other themes retain their palettes.

Playground and documentation copy was revised. Saved documentation section links
open with the requested section scrolled into view.

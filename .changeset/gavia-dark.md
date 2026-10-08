---
"gavia-ui": minor
---

Add Gavia Dark with Gavia Sans, matching Gavia geometry, an accessible dark lake palette, and explicit themes/gavia-dark.css import. Rename display labels White and Graphite to Classic and Classic Dark while preserving the white/graphite identifiers, CSS paths and original catalogue positions. The public theme catalogue now contains five entries; see docs/migration-themes.md for literal tuple and label consumers.

Use a subtly blue moonlit night version of the original lake hero in both Gavia Dark and Classic Dark, keeping the moon at the original sun position. In Gavia Dark, make dark backgrounds nearly neutral gray at comparable luminance, with a barely warm undertone for neutral surfaces. Strengthen the turquoise brand accent and shift it slightly toward blue for primary actions, links, the logo and focus while preserving status colors. Give the installation card a muted dark turquoise accent fill with a distinct turquoise border, matching the role of the light Gavia accent surface.

Keep the home forest and reeds illustrations visible on dark surfaces using theme-aware image blending. Mark the project-card GitHub documentation and contribution links as external and open them in a new tab.

Keep narrow WlAlert messages readable by wrapping actions when an icon, action and close control share the available width.

Add a sun/moon WlIconButton in the hero’s upper right corner for Gavia ↔ Gavia Dark and Classic ↔ Classic Dark; Newspaper switches to Classic Dark and back to Newspaper. Keep both day/night images mounted and preloaded with the same composition: all light themes use day and both dark themes use night. Fade in the night layer once loaded and animate interface colors; prefers-reduced-motion disables both transitions.

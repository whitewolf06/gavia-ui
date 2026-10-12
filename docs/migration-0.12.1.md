# Upgrading to Gavia UI 0.12.1

This patch updates the public Playground and documentation. Library props,
events, slots, classes, tokens, theme identifiers and import paths are unchanged.
Consumers do not need to update application code or locale configuration.

## Playground preferences

On first visit, the Playground follows the system colour scheme using the
Gavia/Gavia Dark pair and chooses the first supported browser language (EN/RU).
Unsupported languages fall back to English. Manual choices are saved in local
storage; valid `theme` and `lang` URL parameters take priority over saved choices.
`theme=system` keeps the automatic mode, including changes to the OS colour scheme.
The existing five named themes remain available for manual selection.

## Documentation navigation

The four home metrics link to components, icons, tokens and themes. Components
are sorted by name within their existing groups. The documentation sidebar has
a local search by component name and description, with clear and empty states;
the same catalogue is used on desktop and mobile.

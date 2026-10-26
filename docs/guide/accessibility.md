# Accessibility in an application

Use the native semantics and documented keyboard behavior of each component.
Provide meaningful labels for inputs, actions, dialogs and navigation regions.
An icon-only action needs an accessible name; decorative icons should not repeat
that name. State changes need readable text as well as color.

`WlField` provides slot values for the input ID, descriptions and invalid state.
Bind them to the actual control, rather than relying on a visual label nearby.
Forward application errors and required state through the documented field and
input contracts. Explain errors in text and preserve the user's entered value.

For lists and navigation, test Arrow/Home/End/Enter/Escape behavior where it is
documented, disabled options, visible active items and selection announcements.
For overlays, test the accessible name, initial focus, Escape/dismissal, focus
return, nested overlays and repeated opening. Respect reduced motion.

Review your complete screen at desktop and mobile widths, keyboard-only, at
200% zoom and in every supplied theme. Check contrast when overriding tokens.
Run automated accessibility checks and perform a separate screen-reader review
for forms, errors, live updates and overlays. An axe result does not establish
screen-reader usability or accessibility of every application composition.

[Component guides](https://whitewolf06.github.io/gavia-ui/docs/) document
the actual API and interactions. The
[design-system reference](../reference/design-system.md) describes shared
patterns; [maintainer checks](../maintainers/quality.md) describe verification.

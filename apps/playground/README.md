# Gavia UI playground

The playground shows Gavia UI components, their sizes and states,
five themes, design tokens, working SFC examples and six interface flows.

```bash
pnpm install
pnpm build
pnpm dev
pnpm build:playground
```

In a clean checkout, build the library first: public types are in dist.
During development, the playground loads examples from source. Copyable code
uses public `gavia-ui` imports.
`verify:package` installs the archive separately and checks that code without
access to workspace source.

`src/bootstrap.ts` installs `WlConfig`, `WlToastService` and
`WlConfirmationService`. CSS is imported explicitly in `src/main.ts`.
There are five themes: Gavia, Gavia Dark, Classic, Classic Dark and Newspaper.
Search supports keyboard navigation, the design system is available at
`?view=system`, and the package version appears beside the logo.

Checks: `pnpm test:e2e`, `pnpm test:visual`. Visual baselines use
Windows/Chromium; update them after reviewing the diff under the
[design system rules](../../docs/design-system.md).

## Full Chromium for local checks

Playwright uses headless shell by default. If that process exits when opening
a page on your workstation, you can select the full version of the same pinned
Chromium. Scenarios, assertions and visual baselines stay the same:

```powershell
$env:GAVIA_E2E_CHROMIUM_CHANNEL = "chromium"
pnpm test:e2e
pnpm test:visual
Remove-Item Env:GAVIA_E2E_CHROMIUM_CHANNEL
```

`pnpm exec playwright install chromium` installs both variants.
CI leaves the variable unset and uses the default headless shell.

Language configuration, EN/RU shared sources and documentation policy: [localization](../../docs/localization.md).

# Gavia UI consumers

Copy a starter directory outside this workspace, run `pnpm install`, then `pnpm dev`.
These projects use the public npm package rather than source aliases. Review the
generated lockfile and commit it in your application. Use Node 22.13+ on the 22.x
line or Node 24.

- [Vite](vite-starter/README.md): a Vue 3.4-compatible form.
- [Nuxt](nuxt-starter/README.md): app-scoped configuration with SSR.
- [Custom theme](custom-theme/README.md): explicit CSS layers and scoped tokens.

Starter builds and installed-package acceptance are separate release checks.
The development work does not imply they have been run against an unpublished version.

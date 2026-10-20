ARG PLAYWRIGHT_VERSION=1.58.2
FROM mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-noble

WORKDIR /workspace
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY packages/ui-kit/package.json packages/ui-kit/package.json
COPY apps/playground/package.json apps/playground/package.json
RUN node -e "const [major, minor] = process.versions.node.split('.').map(Number); if (!(major === 24 || major === 22 && minor >= 13)) throw new Error('Use Node 22.13+ or Node 24');" \
    && corepack enable && pnpm install --frozen-lockfile

COPY . .
ENV CI=1
ENV GAVIA_E2E_PRODUCTION=1
RUN pnpm build && GAVIA_E2E_BUILD=1 pnpm build:playground
CMD ["pnpm", "exec", "playwright", "test", "-c", "apps/playground/playwright.visual.linux.config.ts"]

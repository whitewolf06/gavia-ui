import { spawnSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** Plan argv without invoking Docker, used by the safety-focused unit tests. */
export function dockerVisualPlan(root, args = []) {
  root = resolve(root);
  if (/[,\r\n]/.test(root)) throw new Error("Docker bind paths cannot contain commas or newlines");
  let update = false;
  const selection = [];
  for (let index = 0; index < args.length; index++) {
    if (args[index] === "--update-snapshots" && !update) update = true;
    else if (args[index] === "--project" && ["desktop", "mobile"].includes(args[index + 1])) selection.push("--project", args[++index]);
    else throw new Error("Usage: node scripts/visual-docker.mjs [--update-snapshots] [--project desktop|mobile]");
  }
  const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).devDependencies["@playwright/test"];
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error("Pin @playwright/test exactly before running its Docker image");
  const image = `gavia-ui-visual:playwright-${version}`;
  const baselines = join(root, "apps/playground/e2e/visual-baselines-linux");
  const results = join(root, ".tmp/visual-linux");
  return {
    root, baselines, results,
    build: ["build", "--file", ".github/docker/visual.Dockerfile", "--build-arg", `PLAYWRIGHT_VERSION=${version}`, "--tag", image, "."],
    run: ["run", "--rm", "--init", "--ipc=host", "--env", "GAVIA_VISUAL_REVIEW=1",
      "--mount", `type=bind,source=${baselines},target=/workspace/apps/playground/e2e/visual-baselines-linux${update ? "" : ",readonly"}`,
      "--mount", `type=bind,source=${results},target=/workspace/apps/playground/test-results-linux`,
      image, "pnpm", "exec", "playwright", "test", "-c", "apps/playground/playwright.visual.linux.config.ts",
      ...selection, ...(update ? ["--update-snapshots"] : ["--update-snapshots=none"])]
  };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const plan = dockerVisualPlan(fileURLToPath(new URL("../", import.meta.url)), process.argv.slice(2));
    mkdirSync(plan.baselines, { recursive: true });
    mkdirSync(plan.results, { recursive: true });
    for (const args of [plan.build, plan.run]) {
      const result = spawnSync("docker", args, { cwd: plan.root, stdio: "inherit" });
      if (result.error) throw result.error;
      if (result.status !== 0) {
        process.exitCode = result.status ?? 1;
        break;
      }
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

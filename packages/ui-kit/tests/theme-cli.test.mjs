// @vitest-environment node
import { existsSync, mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runThemeCli } from "../bin/theme-cli.mjs";
import * as engine from "../src/theme/index";

const directories = [];
const configuration = {
  schemaVersion: 2,
  name: "cli-theme",
  baseTheme: "gavia",
  palette: { primary: "#245bd1" },
  contrastPairs: [{ name: "primary", foreground: "--wl-action-primary-text", background: "--wl-action-primary-bg", minimum: 4.5 }]
};

afterEach(() => {
  for (const directory of directories.splice(0)) {
    if (dirname(directory) !== resolve(tmpdir()) || !basename(directory).startsWith("gavia-theme-cli-")) {
      throw new Error("CLI fixture cleanup must stay inside its temporary directory.");
    }
    rmSync(directory, { recursive: true, force: true });
  }
});

function fixture(input = configuration) {
  const directory = mkdtempSync(resolve(tmpdir(), "gavia-theme-cli-"));
  directories.push(directory);
  const config = join(directory, "theme.json");
  const output = join(directory, "theme.css");
  writeFileSync(config, JSON.stringify(input), "utf8");
  const stdout = [];
  const stderr = [];
  const run = (args = ["--config", config, "--output", output]) => runThemeCli(args, engine, {
    cwd: directory,
    stdout: (message) => stdout.push(message),
    stderr: (message) => stderr.push(message)
  });
  return { directory, config, output, stdout, stderr, run };
}

describe("theme CLI adapter with the public generator", () => {
  it("writes the same deterministic CSS as the API and checks it without rewriting", () => {
    const task = fixture();
    const original = readFileSync(task.config, "utf8");
    expect(task.run()).toBe(0);
    expect(readFileSync(task.output, "utf8")).toBe(engine.createWlTheme(engine.parseWlThemeConfig(configuration)).css);
    utimesSync(task.output, new Date(0), new Date(0));
    expect(task.run(["--config", task.config, "--output", task.output, "--check"])).toBe(0);
    expect(statSync(task.output).mtimeMs).toBe(0);
    expect(readFileSync(task.config, "utf8")).toBe(original);
    expect(task.stderr).toEqual([]);
  });

  it("reports stale and missing CSS without modifying files or making directories", () => {
    const task = fixture();
    writeFileSync(task.output, "old CSS", "utf8");
    expect(task.run(["--config", task.config, "--output", task.output, "--check"])).toBe(2);
    expect(readFileSync(task.output, "utf8")).toBe("old CSS");
    const missing = join(task.directory, "missing", "theme.css");
    expect(task.run(["--config", task.config, "--output", missing, "--check"])).toBe(2);
    expect(existsSync(dirname(missing))).toBe(false);
    expect(task.stderr.join("")).toContain("CSS is missing or out of date:");
  });

  it("prioritizes failed contrast over stale CSS and writes neither output nor directories", () => {
    const task = fixture({ ...configuration, overrides: { "--wl-action-primary-bg": "#ffffff", "--wl-action-primary-text": "#ffffff" } });
    const output = join(task.directory, "failed", "theme.css");
    expect(task.run(["--config", task.config, "--output", output, "--check"])).toBe(3);
    expect(task.stderr.join("")).toContain("Contrast failed: primary (1.00:1; minimum 4.5:1)");
    expect(task.stderr.join("")).toContain("CSS is missing or out of date:");
    expect(task.run(["--config", task.config, "--output", output])).toBe(3);
    expect(existsSync(dirname(output))).toBe(false);
  });

  it("retains the palette-only legacy contract and explains ignored snapshot fields", () => {
    const palette = engine.parseWlThemeConfig(configuration).palette;
    const legacy = { schemaVersion: 1, name: "legacy-theme", baseTheme: "gavia", palette,
      colorScheme: "dark", overrides: { "--wl-palette-accent": "#ff0000" }, semanticBindings: { "--wl-text": "#ffffff" } };
    const task = fixture(legacy);
    expect(task.run()).toBe(0);
    const paletteOnly = { schemaVersion: 1, name: legacy.name, baseTheme: legacy.baseTheme, palette };
    expect(readFileSync(task.output, "utf8")).toBe(engine.createWlTheme(engine.parseWlThemeConfig(paletteOnly)).css);
    expect(task.stderr.join("")).toContain("derived export fields are ignored");
  });

  it("rejects overwriting the configuration", () => {
    const task = fixture();
    const original = readFileSync(task.config, "utf8");
    expect(task.run(["--config", task.config, "--output", task.config])).toBe(1);
    expect(readFileSync(task.config, "utf8")).toBe(original);
    expect(task.stderr.join("")).toContain("must be different files");
  });

  it.each([{ args: [] }, { args: ["--unknown"] }, { args: ["--check", "--check"] }, { args: ["--config", "a", "--config", "b"] }])("rejects invalid arguments $args", ({ args }) => {
    const task = fixture();
    expect(task.run(args)).toBe(1);
    expect(existsSync(task.output)).toBe(false);
    expect(task.stderr.join("")).toContain("Usage:");
  });

  it("reports malformed JSON, invalid settings and IO errors with exit code one", () => {
    const task = fixture({ ...configuration, schemaVersion: 100 });
    expect(task.run()).toBe(1);
    writeFileSync(task.config, "{", "utf8");
    expect(task.run()).toBe(1);
    expect(task.run(["--config", "not-present.json", "--output", task.output])).toBe(1);
    expect(existsSync(task.output)).toBe(false);
    expect(task.stderr).toHaveLength(3);
  });

  it("prints help without reading configuration or generating CSS", () => {
    const task = fixture();
    expect(task.run(["--help"])).toBe(0);
    expect(task.stdout.join("")).toContain("--config <theme.json> --output <theme.css> [--check]");
    expect(existsSync(task.output)).toBe(false);
  });

  it("keeps the starter's generated CSS and configured contrast checks consistent with the public API", () => {
    const input = JSON.parse(readFileSync(new URL("../../../examples/custom-theme/theme.config.json", import.meta.url), "utf8"));
    const result = engine.createWlTheme(engine.parseWlThemeConfig(input));
    expect(readFileSync(new URL("../../../examples/custom-theme/src/theme.css", import.meta.url), "utf8")).toBe(result.css);
    expect(result.css.startsWith("/* Generated by legato-ui/theme.")).toBe(true);
    expect(result.contrast).toHaveLength(17);
    expect(result.contrast.every((pair) => pair.passes)).toBe(true);
  });
});

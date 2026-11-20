/* global process */
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";

const usage = "Usage: legato-theme --config <theme.json> --output <theme.css> [--check]\n";

function argumentsFor(argv) {
  const options = { check: false };
  for (let index = 0; index < argv.length; index++) {
    const argument = argv[index];
    if (argument === "--check" && !options.check) {
      options.check = true;
    } else if ((argument === "--config" || argument === "--output")
      && !options[argument.slice(2)] && argv[index + 1]?.trim() && !argv[index + 1].startsWith("--")) {
      options[argument.slice(2)] = argv[++index];
    } else {
      throw new Error(`Unexpected or repeated argument: ${argument}. ${usage.trim()}`);
    }
  }
  if (!options.config || !options.output) throw new Error(usage.trim());
  return options;
}

/**
 * The engine is the public theme module, also used by source-level CLI tests.
 * @param {string[]} argv
 * @param engine The public theme module.
 * @param {{ cwd?: string, stdout?: (message: string) => unknown, stderr?: (message: string) => unknown }} [options]
 */
export function runThemeCli(argv, engine, {
  cwd = process.cwd(),
  stdout = (message) => process.stdout.write(message),
  stderr = (message) => process.stderr.write(message)
} = {}) {
  try {
    if (argv.length === 1 && argv[0] === "--help") {
      stdout(usage);
      return 0;
    }
    const options = argumentsFor(argv);
    const configPath = realpathSync(resolve(cwd, options.config));
    const outputPath = resolve(cwd, options.output);
    const existingOutput = existsSync(outputPath) ? realpathSync(outputPath) : outputPath;
    const comparable = (path) => process.platform === "win32" ? path.toLowerCase() : path;
    if (comparable(configPath) === comparable(existingOutput)) {
      throw new Error("Configuration and CSS output must be different files.");
    }
    const input = JSON.parse(readFileSync(configPath, "utf8"));
    const config = engine.parseWlThemeConfig(input);
    if (input.schemaVersion === 1) {
      stderr("Legacy schemaVersion 1: only name, baseTheme and palette are used; derived export fields are ignored.\n");
    }
    const result = engine.createWlTheme(config);
    const failed = result.contrast.filter((pair) => !pair.passes);
    for (const pair of failed) {
      stderr(`Contrast failed: ${pair.name} (${pair.ratio.toFixed(2)}:1; minimum ${pair.minimum}:1).\n`);
    }
    if (options.check) {
      const current = existsSync(outputPath) && readFileSync(outputPath, "utf8") === result.css;
      if (!current) stderr(`CSS is missing or out of date: ${options.output}\n`);
      if (failed.length) return 3;
      if (!current) return 2;
      stdout(`CSS is current: ${options.output}\n`);
      return 0;
    }
    if (failed.length) return 3;
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, result.css, "utf8");
    stdout(`Wrote ${options.output}\n`);
    return 0;
  } catch (error) {
    stderr(`legato-theme: ${error instanceof Error ? error.message : String(error)}\n`);
    return 1;
  }
}

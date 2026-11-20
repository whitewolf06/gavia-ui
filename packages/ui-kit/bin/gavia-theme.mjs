#!/usr/bin/env node
/* global process */
import { runThemeCli } from "./theme-cli.mjs";

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 22 || (major === 22 && minor < 13)) {
  process.stderr.write("legato-theme requires Node 22.13 or later.\n");
  process.exitCode = 1;
} else {
  try {
    const engine = await import("../dist/theme-generator.js");
    process.exitCode = runThemeCli(process.argv.slice(2), engine);
  } catch (error) {
    process.stderr.write(`legato-theme: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

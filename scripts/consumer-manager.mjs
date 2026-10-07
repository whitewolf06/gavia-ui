import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { delimiter, dirname, join, resolve } from "node:path";

export function consumerManager(name) {
  const paths = [...new Set([dirname(process.execPath), ...(process.env.PATH ?? process.env.Path ?? "").split(delimiter)])];
  let executable;
  let prefix = [];
  if (name === "npm") {
    const candidates = paths.flatMap((base) => [
      join(base, "node_modules", "npm", "bin", "npm-cli.js"),
      resolve(base, "../lib/node_modules/npm/bin/npm-cli.js"),
      resolve(base, "../share/nodejs/npm/bin/npm-cli.js")
    ]);
    const cli = process.env.GAVIA_NPM_CLI ?? candidates.find(existsSync);
    if (cli) { executable = process.execPath; prefix = [cli]; }
    else if (process.platform !== "win32") executable = "npm";
    else throw new Error("npm CLI was not found. Set GAVIA_NPM_CLI to npm-cli.js.");
  } else if (name === "bun") {
    const filename = process.platform === "win32" ? "bun.exe" : "bun";
    const candidates = paths.flatMap((base) => [
      join(base, filename), join(base, "node_modules", "bun", "bin", filename)
    ]);
    executable = process.env.GAVIA_BUN_EXECUTABLE ?? candidates.find(existsSync);
    if (!executable) throw new Error("Bun binary was not found. Install Bun or set GAVIA_BUN_EXECUTABLE.");
  } else throw new Error("Unsupported consumer manager: " + name);

  const version = execFileSync(executable, [...prefix, "--version"], { encoding: "utf8", timeout: 10_000 }).trim();
  return {
    name, version,
    run(args, cwd) {
      execFileSync(executable, [...prefix, ...args], {
        cwd, env: process.env, stdio: "inherit", timeout: 120_000
      });
    }
  };
}


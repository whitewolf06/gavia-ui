import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";

// Keep release assertions tied to confirmed npm metadata, not source version.
// Reading avoids the application's Vite JSON import in the Node ESM runner.
const source = readFileSync(
  fileURLToPath(new NodeURL("../src/project/project-info.ts", import.meta.url)), "utf8"
);
const literal = source.match(/\bpublishedVersion:\s*["']([^"']+)["']/);
if (!literal) throw new Error("Canonical publishedVersion is missing from project-info.ts");

export const publishedVersion = literal[1]!;

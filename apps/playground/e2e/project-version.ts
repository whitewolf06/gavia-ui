import { readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";

// Keep release assertions tied to confirmed npm metadata, not source version.
const published = JSON.parse(readFileSync(
  fileURLToPath(new NodeURL("../src/project/published-package.json", import.meta.url)), "utf8"
)) as { name: string; version: string };
export const { name: publishedName, version: publishedVersion } = published;

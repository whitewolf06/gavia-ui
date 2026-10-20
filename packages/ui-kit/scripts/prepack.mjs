import { fileURLToPath } from "node:url";
import { writePackageDocumentation } from "../../../scripts/package-docs.mjs";

const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--check")) throw new Error("Usage: node scripts/prepack.mjs [--check]");
const root = fileURLToPath(new URL("../../../", import.meta.url));
const names = writePackageDocumentation(root, { check: args[0] === "--check" });
console.log(`${args[0] === "--check" ? "Verified" : "Generated"} package documentation: ${names.join(", ")}`);

import { createWlTheme, parseWlThemeConfig } from "legato-ui/theme";
import { readFileSync, writeFileSync } from "node:fs";

const config = parseWlThemeConfig(JSON.parse(readFileSync(new URL("../theme.config.json", import.meta.url), "utf8")));
const theme = createWlTheme(config);
const failed = theme.contrast.filter((pair) => !pair.passes);
if (failed.length) throw new Error(`Theme contrast failed: ${failed.map((pair) => pair.name).join(", ")}`);
writeFileSync(new URL("../src/theme.css", import.meta.url), theme.css, "utf8");

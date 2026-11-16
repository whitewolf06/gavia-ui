import type { WlThemeConfig, WlThemeResult } from "../../src/theme/index";
import { createWlTheme, parseWlThemeConfig } from "../../src/theme/index";

export const themeConfig: WlThemeConfig = {
  schemaVersion: 2, name: "brand", baseTheme: "gavia", mode: "delta",
  palette: { primary: "#245bd1" }, overrides: { "--wl-input-radius": "8px" },
  contrastPairs: [{ name: "link", foreground: "--wl-text-accent", background: "--wl-bg", minimum: 4.5 }]
};
export const themeResult: WlThemeResult = createWlTheme(themeConfig);
parseWlThemeConfig(JSON.parse("{}"));
// @ts-expect-error A token name is checked against the public catalog.
createWlTheme({ ...themeConfig, overrides: { "--not-a-token": "1px" } });
// @ts-expect-error Palette keys use the public role names.
createWlTheme({ ...themeConfig, palette: { accent: "#ffffff" } });
// @ts-expect-error A new input config is explicitly version 2.
createWlTheme({ ...themeConfig, schemaVersion: 1 });

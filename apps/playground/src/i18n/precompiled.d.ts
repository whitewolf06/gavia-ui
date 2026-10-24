declare module "*.json?compiled" {
  const messages: Record<string, unknown>;
  export default messages;
  export const aliases: Record<string, string>;
  export const sourceMessages: Record<string, string> | true;
  export const parameters: Record<string, string[]>;
}

declare module "virtual:gavia-catalog-summary" {
  import type { WlThemeName } from "gavia-ui";
  const summary: {
    tokenCount: number;
    themeCount: number;
    themeColorSchemes: Record<string, "light" | "dark">;
    themes: { name: WlThemeName; label: string; colorScheme: "light" | "dark" }[];
  };
  export default summary;
}

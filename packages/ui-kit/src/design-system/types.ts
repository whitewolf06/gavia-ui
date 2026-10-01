export type WlTokenLayer = "foundation" | "semantic" | "component";
export type WlTokenType = "color" | "dimension" | "number" | "fontFamily" | "duration" | "shadow" | "string";
export interface WlDesignTokenDefinition {
  name: `--wl-${string}`;
  layer: WlTokenLayer;
  type: WlTokenType;
  category: string;
  description: string;
  value: string;
  themes?: Partial<Record<"white" | "graphite" | "newspaper", string>>;
}
export interface WlDesignTheme {
  name: "white" | "graphite" | "newspaper";
  label: string;
  description: string;
  colorScheme: "light" | "dark";
}
export interface WlTypographyRole {
  name: string;
  label: string;
  description: string;
  fontSize: `--wl-${string}`;
  lineHeight: `--wl-${string}`;
  fontWeight: `--wl-${string}`;
  fontFamily: `--wl-${string}`;
}
export interface WlContrastPair {
  name: string;
  label: string;
  foreground: `--wl-${string}`;
  background: `--wl-${string}`;
  minimum: number;
}

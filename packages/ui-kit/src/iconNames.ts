import { WL_ICON_NAMES, type WlIconName } from "./icons.generated";

/** A canonical name or a persisted icon identifier from a consumer. */
export type WlIconInput = WlIconName | (string & {});

const names = new Set<string>(WL_ICON_NAMES);
const aliases: Readonly<Record<string, WlIconName>> = Object.freeze({
  "angle-left": "chevron-left",
  "angle-right": "chevron-right",
  bolt: "lightning",
  cog: "settings",
  "ellipsis-v": "more",
  "exclamation-triangle": "warn",
  "info-circle": "info",
  pencil: "edit",
  "question-circle": "help",
  "sign-out": "logout",
  sparkles: "sparkle",
  thumbtack: "pin",
  times: "x",
  "alert-circle": "exclamation-circle",
  zap: "lightning",
});

/** Resolve names for display only; callers retain their original stored value. */
export function resolveWlIconName(input?: string | null): WlIconName | undefined {
  if (typeof input !== "string") return undefined;
  const tokens = input.trim().split(/\s+/);
  const identifier = tokens.length === 1 ? tokens[0] : tokens
    .filter((token) => token !== "pi" && token !== "pi-spin");
  // Only recognized legacy tokens are accepted, never arbitrary CSS classes.
  if (Array.isArray(identifier) && identifier.length !== 1) return undefined;
  const name = (Array.isArray(identifier) ? identifier[0] : identifier)?.replace(/^pi-/, "");
  if (!name) return undefined;
  if (names.has(name)) return name as WlIconName;
  return Object.prototype.hasOwnProperty.call(aliases, name) ? aliases[name] : undefined;
}

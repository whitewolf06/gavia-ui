const NATIVE_INPUT_ATTRS = new Set([
  "id",
  "name",
  "form",
  "autocomplete",
  "autofocus",
  "required",
  "readonly",
  "maxlength",
  "minlength",
  "min",
  "max",
  "step",
  "pattern",
  "list",
  "multiple",
  "accept",
  "capture",
  "dirname",
  "inputmode",
  "enterkeyhint",
  "autocapitalize",
  "spellcheck",
  "tabindex",
  "title",
  "role"
]);

function belongsToInput(key: string): boolean {
  const normalized = key.toLowerCase();
  return (
    NATIVE_INPUT_ATTRS.has(normalized) ||
    normalized.startsWith("aria-") ||
    /^on[A-Z]/.test(key)
  );
}

export function splitInputAttrs(attrs: Record<string, unknown>): {
  inputAttrs: Record<string, unknown>;
  rootAttrs: Record<string, unknown>;
} {
  const inputAttrs: Record<string, unknown> = {};
  const rootAttrs: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(attrs)) {
    (belongsToInput(key) ? inputAttrs : rootAttrs)[key] = value;
  }

  return { inputAttrs, rootAttrs };
}

function stringAttr(attrs: Record<string, unknown>, key: string): string | undefined {
  const value = attrs[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function booleanAttr(attrs: Record<string, unknown>, key: string): boolean | undefined {
  const value = attrs[key];
  if (value === undefined || value === null || value === false) return undefined;
  return true;
}

/** Props shared by PrimeVue controls whose actual focus target lives below their root. */
export interface WlPrimeControlProps {
  inputId?: string;
  name?: string;
  required?: boolean;
  readonly?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
}

export function getPrimeControlProps(
  inputAttrs: Record<string, unknown>
): WlPrimeControlProps {
  return {
    inputId: stringAttr(inputAttrs, "id"),
    name: stringAttr(inputAttrs, "name"),
    required: booleanAttr(inputAttrs, "required"),
    readonly: booleanAttr(inputAttrs, "readonly"),
    ariaLabel: stringAttr(inputAttrs, "aria-label"),
    ariaLabelledby: stringAttr(inputAttrs, "aria-labelledby")
  };
}

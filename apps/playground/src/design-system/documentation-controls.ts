import type { WlComponentManifest, WlPropManifest } from "../../../../packages/ui-kit/src/manifest";

export type DocumentationEditor = "select" | "checkbox" | "text" | "number" | "icon";
export interface DocumentationControl extends WlPropManifest {
  editor: DocumentationEditor;
  numberMin?: number;
  numberMax?: number;
  numberStep?: number;
  inputType?: "text" | "date" | "time";
}
export interface DocumentationPreset { id: string; label: string; props: Record<string, unknown> }
type Scalar = string | number | boolean;
const serviceNames = new Set(["WlToast", "WlConfirmDialog"]);
const referenceProps = new Set(["id", "ariaLabelledby", "href", "optionLabel", "optionValue", "dataKey"]);
const namedModelProps: Record<string, readonly string[]> = { WlSidebar: ["pinned", "mobileOpen"], WlChip: ["active"], WlPagination: ["page"] };

/** Read literals only: documentation must never execute an example to discover defaults. */
function literal(expression: string): Scalar | undefined {
  const text = expression.trim();
  if (text === "true" || text === "false") return text === "true";
  if (/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) return Number(text);
  const quote = text[0];
  if ((quote === "'" || quote === '"') && text[text.length - 1] === quote
    && !text.slice(1, -1).includes(quote) && !text.includes("\\")) return text.slice(1, -1);
  return undefined;
}
function camelCase(name: string): string { return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase()); }
function targetTags(entry: WlComponentManifest, source: string): string[] {
  return Array.from(source.matchAll(/<(Wl\w+)\b(?:[^"'>]|"[^"]*"|'[^']*')*>/g))
    .filter((match) => match[1] === entry.name && /\bv-bind="(?:preview|forwardedPreview)"/.test(match[0]))
    .map((match) => match[0]);
}
function decodeAttribute(value: string): string {
  return value.replace(/&(quot|apos|lt|gt|amp|#39);/g, (_, entity: string) =>
    ({ quot: '"', apos: "'", lt: "<", gt: ">", amp: "&", "#39": "'" } as Record<string, string>)[entity] ?? "");
}
/** Defaults belong to the actual target SFC, including its simple initial ref values. */
export function documentationDefaults(entry: WlComponentManifest, source: string): Record<string, Scalar> {
  const initialRefs = new Map<string, Scalar>();
  for (const match of source.matchAll(/\bconst\s+(\w+)\s*=\s*ref(?:<[^;\n]*?>)?\(([^\n]*?)\);/g)) {
    const value = literal(match[2]!);
    if (value !== undefined) initialRefs.set(match[1]!, value);
  }
  const instances = targetTags(entry, source).map((tag) => {
    const values: Record<string, Scalar> = {};
    for (const match of tag.matchAll(/\s([:@\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g)) {
      const attribute = match[1]!;
      const content = match[2] ?? match[3];
      if (attribute.startsWith("v-model:") && content) {
        const value = initialRefs.get(content);
        if (value !== undefined) values[camelCase(attribute.slice(8))] = value;
      } else if (attribute.startsWith(":") && content !== undefined) {
        const value = literal(content) ?? initialRefs.get(content);
        if (value !== undefined) values[camelCase(attribute.slice(1))] = value;
      } else if (!attribute.startsWith("@") && !attribute.startsWith("v-")) {
        values[camelCase(attribute)] = content === undefined ? true : decodeAttribute(content);
      }
    }
    return values;
  });
  const defaults: Record<string, Scalar> = {};
  for (const prop of entry.props) {
    const value = instances[0]?.[prop.name];
    if (value !== undefined && instances.every((instance) => Object.is(instance[prop.name], value))) defaults[prop.name] = value;
    else if (typeof prop.default === "string" || typeof prop.default === "boolean"
      || typeof prop.default === "number" && Number.isFinite(prop.default)) defaults[prop.name] = prop.default;
    else if (prop.name === "motion") defaults.motion = true;
  }
  return defaults;
}

function numericControl(entry: WlComponentManifest, prop: WlPropManifest): DocumentationControl {
  let numberMin = -1e12, numberMax = 1e12, numberStep = 1;
  if (["count", "activeCount", "minLength", "maxFiles", "maxSize", "siblings", "badge"].includes(prop.name)) numberMin = 0;
  if (["rows", "pageCount", "size"].includes(prop.name)) numberMin = 1;
  if (prop.name === "step") { numberMin = 0.01; numberStep = 0.1; }
  if (prop.name === "progress" || entry.name === "WlProgress" && prop.name === "value") { numberMin = 0; numberMax = 100; }
  if (entry.name === "WlSteps" && prop.name === "current") { numberMin = 0; numberMax = 2; }
  if (entry.name === "WlIcon" && prop.name === "size") numberMax = 128;
  return { ...prop, editor: "number", numberMin, numberMax, numberStep };
}

/** A primary target is required; complex data, routing and model values stay in the SFC/API. */
export function createDocumentationControls(entry: WlComponentManifest, source?: string): DocumentationControl[] {
  if (serviceNames.has(entry.name) || source !== undefined && targetTags(entry, source).length === 0) return [];
  const models = new Set(namedModelProps[entry.name] ?? []);
  if (source !== undefined) for (const tag of targetTags(entry, source)) {
    for (const match of tag.matchAll(/\bv-model:([\w-]+)/g)) models.add(camelCase(match[1]!));
  }
  return entry.props.flatMap((prop): DocumentationControl[] => {
    if (prop.name === entry.model?.name || models.has(prop.name) || referenceProps.has(prop.name)
      || entry.name === "WlPagination" && prop.name === "page"
      || entry.name === "WlMenu" && prop.name === "popup"
      || entry.name === "WlAutocomplete" && prop.name === "multiple") return [];
    if (entry.name === "WlPageHeader" && prop.name === "headingLevel") return [{ ...prop, default: 2, values: [1, 2], editor: "select" }];
    if (entry.name === "WlDatePicker" && prop.name === "selectionMode") return [{ ...prop, values: ["single", "range"], editor: "select" }];
    if (entry.name === "WlInput" && prop.name === "type") return [{ ...prop, values: ["text", "email", "search", "tel", "url", "number"], editor: "select" }];
    if (prop.type === "boolean") return [{ ...prop, editor: "checkbox" }];
    if (prop.type === "icon") return [{ ...prop, editor: "icon" }];
    if (prop.values?.length) return [{ ...prop, editor: "select" }];
    if (prop.type === "number") return [numericControl(entry, prop)];
    if (entry.name === "WlIcon" && prop.name === "size") return [numericControl(entry, {
      ...prop, description: (prop.description ?? "") + " Здесь укажите размер в пикселях. CSS-значение можно задать в SFC."
    })];
    if (entry.name === "WlBadge" && prop.name === "value" || entry.name === "WlNavItem" && prop.name === "badge") return [numericControl(entry, {
      ...prop, description: (prop.description ?? "") + " Здесь укажите число. Текстовую подпись можно задать в SFC."
    })];
    if (prop.type === "string") return [{
      ...prop, editor: "text",
      inputType: ["minDate", "maxDate"].includes(prop.name) ? "date"
        : ["minTime", "maxTime"].includes(prop.name) ? "time" : "text"
    }];
    return [];
  }).sort((a, b) => {
    const rank = (control: DocumentationControl): number =>
      entry.name === "WlDatePicker" && control.name === "selectionMode" ? -1
        : control.editor === "select" ? 0 : control.editor === "checkbox" ? 2 : 1;
    return rank(a) - rank(b);
  });
}
export function documentationComplexProps(entry: WlComponentManifest, controls: readonly DocumentationControl[]): string[] {
  if (serviceNames.has(entry.name)) return [];
  const editable = new Set(controls.map((control) => control.name));
  return entry.props.filter((prop) => !editable.has(prop.name)).map((prop) => prop.name);
}

/** Known literal data keeps option keys and selected models compatible with the primary SFC. */
export function documentationPresets(entry: WlComponentManifest): DocumentationPreset[] {
  if (entry.name === "WlSelect") return [{
    id: "with-archive", label: "С недоступным архивом", props: { options: [
      { label: "Команда", value: "team" }, { label: "Личное", value: "personal" },
      { label: "Архив", value: "archive", disabled: true }
    ] }
  }, { id: "empty-options", label: "Пустой список", props: { options: [] } }];
  if (entry.name === "WlTable") return [{ id: "empty-rows", label: "Пустая таблица", props: { value: [] } }];
  if (entry.name === "WlColorPicker") return [{ id: "compact-palette", label: "Три цвета", props: { swatches: ["#2563eb", "#2e9e68", "#bf8615"] } }];
  return [];
}
export function documentationControlSamples(control: DocumentationControl): readonly Scalar[] {
  if (control.editor === "checkbox") return [true, false];
  if (control.editor === "icon") return ["", ...(control.values ?? [])];
  if (control.editor === "select") return control.values ?? [];
  if (control.editor === "number") return [Math.max(control.numberMin ?? -1e12, Math.min(control.numberMax ?? 1e12, 7))];
  if (control.inputType === "date") return ["", "2026-10-15"];
  if (control.inputType === "time") return ["", "09:45"];
  return ["", 'Название "A" & B\'s <C>'];
}
function validDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]), month = Number(match[2]), day = Number(match[3]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  return year > 0 && days !== undefined && day >= 1 && day <= days;
}
export function acceptsDocumentationValue(control: DocumentationControl, value: unknown): value is Scalar {
  if (control.editor === "checkbox") return typeof value === "boolean";
  if (control.editor === "text") {
    if (typeof value !== "string") return false;
    if (value === "") return true;
    if (control.inputType === "date") return validDate(value);
    if (control.inputType === "time") return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
    return true;
  }
  if (control.editor === "number") return typeof value === "number" && Number.isFinite(value)
    && value >= (control.numberMin ?? -1e12) && value <= (control.numberMax ?? 1e12);
  return control.editor === "icon" && value === "" || Boolean(control.values?.some((option) => Object.is(option, value)));
}

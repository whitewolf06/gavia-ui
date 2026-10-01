/** One transformation for the showcase clipboard and the isolated package consumer. */
export function consumerSource(source, preview = {}) {
  // A final v-bind preserves override order without duplicate template attributes.
  const binding = Object.keys(preview).length
    ? `v-bind='${JSON.stringify(preview).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;")}'` : "";
  return source.replace(/from "(?:\.\.\/)+packages\/ui-kit\/src"/g, 'from "@whitelife-core/ui-kit"')
    .replace(/^defineProps<\{ preview\?: Record<string, unknown> \}>\(\);\r?\n/gm, "")
    .replace(/v-bind="preview"/g, binding).trim();
}

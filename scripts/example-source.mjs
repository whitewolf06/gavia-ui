/** One transformation for the showcase clipboard and the isolated package consumer. */
export function consumerSource(source, preview = {}) {
  // A final v-bind preserves override order without duplicate template attributes.
  const binding = Object.keys(preview).length
    ? `v-bind='${JSON.stringify(preview).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;")}'` : "";
  // Setup-aware examples need the same typed options as the live component.
  // Escape '<' in a script literal so input such as '</script>' cannot end the SFC.
  const scriptOptions = JSON.stringify(preview).replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  return source.replace(/from "(?:\.\.\/)+packages\/ui-kit\/src"/g, 'from "gavia-ui"')
    .replace(/^const props = defineProps<\{ preview\?: Record<string, unknown> \}>\(\);\r?\n/gm, () => `const props = { preview: ${scriptOptions} as Record<string, unknown> };\n`)
    .replace(/^defineProps<\{ preview\?: Record<string, unknown> \}>\(\);\r?\n/gm, "")
    .replace(/v-bind="preview"/g, binding).trim();
}

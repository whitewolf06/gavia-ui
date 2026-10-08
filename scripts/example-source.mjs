/** One transformation for the showcase clipboard and the isolated package consumer. */
export function consumerSource(source, preview = {}) {
  // A final v-bind preserves override order without duplicate template attributes.
  const binding = Object.keys(preview).length
    ? `v-bind='${JSON.stringify(preview).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;")}'` : "";
  // Setup-aware examples need the same typed options as the live component.
  // Escape '<' in a script literal so input such as '</script>' cannot end the SFC.
  const scriptOptions = JSON.stringify(preview).replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  let result = source.replace(/from "(?:\.\.\/)+packages\/ui-kit\/src"/g, 'from "gavia-ui"');
  // Only the two known component-prop aliases are showcase controls. Do not
  // remove arbitrary PreviewProps aliases or declarations containing app props.
  const typedPreviewAlias = /^type PreviewProps = Partial<InstanceType<typeof Wl(?:Card|Divider)>\["\$props"\]>;\r?\n/m;
  if (typedPreviewAlias.test(result)) {
    result = result.replace(/^const props = defineProps<\{ preview\?: PreviewProps \}>\(\);\r?\n/gm,
      () => `const props = { preview: ${scriptOptions} as PreviewProps };\n`);
    const statelessPreview = /^defineProps<\{ preview\?: PreviewProps \}>\(\);\r?\n/m;
    if (statelessPreview.test(result)) {
      result = result.replace(statelessPreview, "").replace(typedPreviewAlias, "");
    }
  }
  return result
    .replace(/^const props = defineProps<\{ preview\?: Record<string, unknown> \}>\(\);\r?\n/gm, () => `const props = { preview: ${scriptOptions} as Record<string, unknown> };\n`)
    .replace(/^defineProps<\{ preview\?: Record<string, unknown> \}>\(\);\r?\n/gm, "")
    .replace(/v-bind="preview"/g, binding).trim();
}

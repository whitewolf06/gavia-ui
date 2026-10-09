import englishMessages from "../apps/playground/src/i18n/messages/examples.en.json" with { type: "json" };

/** One transformation for the showcase clipboard and the isolated package consumer. */
export function consumerSource(source, preview = {}, messages = englishMessages) {
  // A final v-bind preserves override order without duplicate template attributes.
  const binding = Object.keys(preview).length
    ? `v-bind='${JSON.stringify(preview).replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;")}'` : "";
  // Setup-aware examples need the same typed options as the live component.
  // Escape '<' in a script literal so input such as '</script>' cannot end the SFC.
  const scriptOptions = JSON.stringify(preview).replace(/</g, "\\u003c")
    .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  let result = source.replace(/from "(?:\.\.\/)+packages\/ui-kit\/src"/g, 'from "gavia-ui"');

  // Resolve only the documented literal translation pattern, leaving a standalone SFC.
  const translation = /\bt\((["'])(examples\.[a-zA-Z0-9_.-]+)\1\)/g;
  const resolveMessage = (match, _quote, key) => {
    if (typeof messages[key] !== "string") throw new Error("Missing example translation: " + key);
    return JSON.stringify(messages[key]).replace(/</g, "\\u003c")
      .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
  };
  // Volar 2.2 reads directive expressions before HTML entity decoding. Keep
  // translated JS literals single-quoted and escape double quotes, ampersands
  // and tag delimiters in JS so neither HTML nor the type checker can split them.
  const resolveAttributeMessage = (match, _quote, key) => {
    if (typeof messages[key] !== "string") throw new Error("Missing example translation: " + key);
    const literal = JSON.stringify(messages[key]).slice(1, -1)
      .replace(/\\"/g, "\\u0022").replace(/'/g, "\\'")
      .replace(/&/g, "\\u0026").replace(/</g, "\\u003c")
      .replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
    return "'" + literal + "'";
  };
  result = result
    .replace(/^import \{ usePlaygroundI18n \} from "(?:\.\.\/)+i18n";\r?\n/gm, "")
    .replace(/^const \{ t \} = usePlaygroundI18n\(\);\r?\n/gm, "");
  const templateStart = result.indexOf("<template>");
  const templateEnd = result.lastIndexOf("</template>");
  if (templateStart >= 0 && templateEnd > templateStart) {
    const template = result.slice(templateStart, templateEnd)
      .replace(/:([^\s=>]+)="t\('((?:examples\.)[a-zA-Z0-9_.-]+)'\)"/g, (_attribute, name, key) => {
        if (typeof messages[key] !== "string") throw new Error("Missing example translation: " + key);
        return name + '="' + messages[key].replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;") + '"';
      })
      .replace(/((?:[:@]|v-)[^\s=>]+=")([^"]*)(")/g, (_attribute, opening, expression, closing) =>
        opening + expression.replace(translation, resolveAttributeMessage) + closing);
    result = result.slice(0, templateStart) + template + result.slice(templateEnd);
  }
  result = result.replace(translation, resolveMessage);

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

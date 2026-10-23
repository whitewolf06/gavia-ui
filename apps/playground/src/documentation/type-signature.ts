/** Keep presentation separate from the published TypeScript metadata. */
export function formatDocumentationType(source: string): string {
  const output: string[] = [];
  const angles: boolean[] = [];
  let quote: string | undefined;
  let escaped = false;
  for (let index = 0; index < source.length; index++) {
    const character = source[index]!;
    if (quote) {
      output.push(character);
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = undefined;
      continue;
    }
    // Quoted literal types, including template literals, retain their contents.
    if (character === '"' || character === "'" || character.charCodeAt(0) === 96) {
      quote = character;
      output.push(character);
      continue;
    }
    if (source.startsWith("NoInfer", index) && !/[\w.$]/u.test(source[index - 1] ?? "")) {
      const wrapper = /^NoInfer\s*</u.exec(source.slice(index));
      if (wrapper) {
        angles.push(true);
        index += wrapper[0].length - 1;
        continue;
      }
    }
    if (character === "<") angles.push(false);
    if (character === ">" && source[index - 1] !== "=" && angles.length && angles.pop()) continue;
    output.push(character);
  }
  return quote || angles.includes(true) ? source : output.join("");
}

export function documentationTypeParts(source: string): string[] {
  return formatDocumentationType(source).split(/([<|,])/u);
}

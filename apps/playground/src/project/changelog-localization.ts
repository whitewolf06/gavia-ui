import { playgroundLocale, playgroundTranslationKey, translate } from "../i18n";

function localized(text: string): string {
  const key = playgroundTranslationKey("changelog", text);
  return key ? translate(key) : text;
}
/** One English Markdown source with a Russian prose overlay for the playground. */
export function localizeChangelogMarkdown(source: string): string {
  if (playgroundLocale.value !== "ru") return source;
  const lines = source.replace(/\r\n?/g, "\n").split("\n");
  const output: string[] = [];
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]!;
    if (!line.trim()) {
      output.push("");
      continue;
    }
    const heading = /^(#{1,6})\s+/.exec(line);
    if (heading) {
      output.push(heading[1] + " " + localized(line.slice(heading[0].length).trim()));
      continue;
    }
    const bullet = /^[-*]\s+/.exec(line);
    let text = bullet ? line.slice(bullet[0].length) : line.trim();
    while (index + 1 < lines.length && lines[index + 1]!.trim()
      && !/^(?:#{1,6}\s|[-*]\s)/.test(lines[index + 1]!)) {
      text += " " + lines[++index]!.trim();
    }
    output.push((bullet ? "- " : "") + localized(text));
  }
  return output.join("\n");
}

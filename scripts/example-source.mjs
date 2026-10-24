import englishDocumentation from "../apps/playground/src/i18n/messages/documentation.en.json" with { type: "json" };
import englishExamples from "../apps/playground/src/i18n/messages/examples.en.json" with { type: "json" };
import { consumerSource as transform } from "./example-source-core.mjs";

const englishMessages = { ...englishExamples, ...Object.fromEntries(Object.entries(englishDocumentation.strings)
  .map(([key, text]) => ["documentation.strings." + key, text])) };

/** Node release tools retain the canonical English default without loading it in the browser. */
export function consumerSource(source, preview = {}, messages = englishMessages) {
  return transform(source, preview, messages);
}

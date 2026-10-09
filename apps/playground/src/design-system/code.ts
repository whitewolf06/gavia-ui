import { consumerSource as transformConsumerSource } from "../../../../scripts/example-source.mjs";
import russianMessages from "../i18n/messages/examples.ru.json";
import { playgroundLocale } from "../i18n/locale";

/** Export the currently displayed language as plain, standalone Vue code. */
export function consumerSource(source: string, preview: Record<string, unknown> = {}): string {
  return transformConsumerSource(source, preview, playgroundLocale.value === "ru" ? russianMessages : undefined);
}

import { consumerSource as transformConsumerSource } from "../../../../scripts/example-source-core.mjs";
import { playgroundMessages } from "../i18n";

/** Export the currently displayed language as plain, standalone Vue code. */
export function consumerSource(source: string, preview: Record<string, unknown> = {}): string {
  return transformConsumerSource(source, preview, playgroundMessages());
}

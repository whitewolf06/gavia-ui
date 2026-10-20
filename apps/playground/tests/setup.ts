// Playground tests run against its Vue version and browser shims independently
// from the library's minimum-version contract tests.
import { beforeAll } from "vitest";
import { ensurePlaygroundMessages } from "../src/i18n";

// Each component fixture can select a language synchronously. Test setup loads
// its text explicitly; production loads only the selected view and language.
beforeAll(async () => {
  await Promise.all(["en", "ru"].map((locale) => ensurePlaygroundMessages(
    ["documentation", "examples", "tokens", "changelog"], locale as "en" | "ru"
  )));
});
if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

if (typeof globalThis.matchMedia === "undefined") {
  globalThis.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false
  })) as unknown as typeof globalThis.matchMedia;
}

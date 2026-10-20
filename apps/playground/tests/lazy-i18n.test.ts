import { afterAll, describe, expect, it, vi } from "vitest";
import { createPlaygroundLocaleUrl, ensurePlaygroundMessages, hasPlaygroundMessage, playgroundI18n, playgroundMessages, playgroundTranslationKey, preparePlaygroundPage, setPlaygroundLocale, translate } from "../src/i18n";
import { flattenCatalog } from "../src/i18n/catalog";
import changelogEnglish from "../src/i18n/messages/changelog.en.json";
import changelogRussian from "../src/i18n/messages/changelog.ru.json";
import documentationEnglish from "../src/i18n/messages/documentation.en.json";
import documentationRussian from "../src/i18n/messages/documentation.ru.json";
import examplesEnglish from "../src/i18n/messages/examples.en.json";
import examplesRussian from "../src/i18n/messages/examples.ru.json";
import shellEnglish from "../src/i18n/messages/shell.en.json";
import shellRussian from "../src/i18n/messages/shell.ru.json";
import tokensEnglish from "../src/i18n/messages/tokens.en.json";
import tokensRussian from "../src/i18n/messages/tokens.ru.json";

// A fresh module must not inherit languages warmed by legacy component fixtures.
vi.hoisted(() => {
  vi.resetModules();
});

afterAll(async () => {
  await setPlaygroundLocale("en");
});

describe("precompiled page and language catalogs", () => {
  it("loads the current shell and home Button text before rendering, without other languages or page catalogs", async () => {
    playgroundI18n.global.locale.value = "en";
    await preparePlaygroundPage("home", "en");
    expect(translate("shell.App.text1")).toBe(shellEnglish["shell.App.text1"]);
    expect(hasPlaygroundMessage("examples.add_0017")).toBe(true);
    expect(hasPlaygroundMessage("documentation.strings.s0001")).toBe(false);
    expect(Object.keys(playgroundI18n.global.getLocaleMessage("ru"))).toEqual([]);
  });

  it("preserves literal code, email addresses, quotes, braces, pipes, newlines and unfilled named placeholders", async () => {
    const languages = {
      en: {
        shell: shellEnglish, documentation: documentationEnglish,
        examples: examplesEnglish, tokens: tokensEnglish, changelog: changelogEnglish
      },
      ru: {
        shell: shellRussian, documentation: documentationRussian,
        examples: examplesRussian, tokens: tokensRussian, changelog: changelogRussian
      }
    };
    for (const locale of ["en", "ru"] as const) {
      // The installer must use this locale even while the other one is visible.
      await ensurePlaygroundMessages(["documentation", "examples", "tokens", "changelog"], locale);
      await setPlaygroundLocale(locale);
      for (const [namespace, catalog] of Object.entries(languages[locale])) {
        const raw = flattenCatalog(catalog, namespace);
        const actual = Object.fromEntries(Object.keys(raw).map((key) => [key, translate(key)]));
        expect(actual, locale + ":" + namespace).toEqual(raw);
      }
      for (const namespace of ["documentation", "examples"] as const) {
        const raw = flattenCatalog(languages[locale][namespace], namespace);
        expect(Object.fromEntries(Object.keys(raw).map((key) => [key, playgroundMessages()[key]]))).toEqual(raw);
      }
      expect(playgroundTranslationKey("documentation", languages[locale].documentation.strings.s0001)).toBe("documentation.strings.s0001");
    }
    await setPlaygroundLocale("en");
    const key = "shell.design_system.states.text470";
    expect(translate(key, { arg0: 3 })).toBe(shellEnglish[key].replace("{arg0}", "3"));
    expect(playgroundTranslationKey("documentation", documentationEnglish.strings.s0001)).toBe("documentation.strings.s0001");
  });

  it("keeps complete previous text until a language is ready and preserves route/theme/hash links", async () => {
    await preparePlaygroundPage("home", "en");
    const pending = setPlaygroundLocale("ru");
    expect(playgroundI18n.global.locale.value).toBe("en");
    expect(translate("shell.App.text1")).toBe(shellEnglish["shell.App.text1"]);
    await pending;
    expect(translate("shell.App.text1")).toBe(shellRussian["shell.App.text1"]);
    expect(document.documentElement.lang).toBe("ru");
    const current = new URL("https://example.test/gavia-ui/?view=docs&component=WlSelect&theme=gavia-dark#docs-wlselect-props");
    const changed = createPlaygroundLocaleUrl(current, "ru");
    expect(changed.searchParams.get("view")).toBe("docs");
    expect(changed.searchParams.get("component")).toBe("WlSelect");
    expect(changed.searchParams.get("theme")).toBe("gavia-dark");
    expect(changed.hash).toBe(current.hash);
    await Promise.all([setPlaygroundLocale("ru"), setPlaygroundLocale("en")]);
    expect(playgroundI18n.global.locale.value).toBe("en");
  });
});

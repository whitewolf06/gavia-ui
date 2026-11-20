import type { Plugin } from "vue";
import { flushPromises, mount } from "@vue/test-utils";
import { createWlTheme, parseWlThemeConfig } from "legato-ui/theme";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { playgroundI18n } from "../src/i18n";
import { playgroundLocale } from "../src/i18n/locale";
import PlaygroundHeader from "../src/PlaygroundHeader.vue";
import ThemeBuilderPage from "../src/ThemeBuilderPage.vue";
import { createPlaygroundThemeUrl, getPlaygroundThemeToggleTarget, isPlaygroundTheme, parsePlaygroundTheme, playgroundThemeOptions, withPlaygroundTheme } from "../src/themes";

let previousLocale = playgroundLocale.value;
beforeEach(() => {
  previousLocale = playgroundLocale.value;
  playgroundLocale.value = "en";
});
afterEach(() => {
  playgroundLocale.value = previousLocale;
});

describe("playground theme routes", () => {
  it("downloads editable v2 config whose generated CSS matches the live export", async () => {
    const storageKey = "legato-ui.theme-builder.v1";
    const previousDraft = localStorage.getItem(storageKey);
    localStorage.removeItem(storageKey);
    const wrapper = mount(ThemeBuilderPage, {
      props: { theme: "gavia" }, global: { plugins: [playgroundI18n as unknown as Plugin] }
    });
    try {
      await flushPromises();
      await wrapper.get("#tb-name").setValue("download-brand");
      await wrapper.get("#tb-hex-primary").setValue("#0b6a53");
      const download = wrapper.get('[data-testid="theme-builder-download"]');
      expect(download.attributes("download")).toBe("download-brand.theme.json");
      const href = download.attributes("href")!;
      expect(href).toMatch(/^data:application\/json;charset=utf-8,/);
      const input = JSON.parse(decodeURIComponent(href.slice(href.indexOf(",") + 1)));
      const config = parseWlThemeConfig(input);
      expect(config.name).toBe("download-brand");
      expect(config.palette?.primary).toBe("#0b6a53");
      expect(input.schemaVersion).toBe(2);
      expect(input).not.toHaveProperty("semanticBindings");
      expect(input).not.toHaveProperty("colorScheme");
      const generated = createWlTheme(config);
      await wrapper.findAll("button").find((button) => button.text() === "CSS")!.trigger("click");
      await flushPromises();
      expect(wrapper.get('[data-testid="theme-builder-export"] pre').text()).toBe(generated.css.trim());
      await wrapper.get("#tb-hex-primary").setValue("#");
      expect(wrapper.find('[data-testid="theme-builder-download"]').exists()).toBe(false);
    } finally {
      wrapper.unmount();
      if (previousDraft === null) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, previousDraft);
    }
  });

  it("shows the applied palette separately and emits when its built-in base is selected", async () => {
    const fonts = Object.getOwnPropertyDescriptor(document, "fonts");
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
    const wrapper = mount(PlaygroundHeader, {
      attachTo: document.body,
      props: {
        activeView: "theme-builder", theme: "gavia", themePreference: "gavia",
        appliedThemeName: "my-palette", themeOptions: playgroundThemeOptions, version: "1.1.0"
      },
      global: { plugins: [playgroundI18n as unknown as Plugin] }
    });
    try {
      const selector = wrapper.get('[data-testid="pg-theme-selector"]');
      expect(selector.text()).toContain("Custom palette: my-palette");
      await selector.trigger("click");
      await flushPromises();
      const option = [...document.querySelectorAll<HTMLElement>('[role="option"]')].find((element) => element.textContent === "Gavia")!;
      expect(option).toBeTruthy();
      option.click();
      await flushPromises();
      expect(wrapper.emitted("theme")).toEqual([["gavia"]]);
      await wrapper.setProps({ appliedThemeName: undefined });
      expect(selector.text()).toBe("Gavia");
    } finally {
      wrapper.unmount();
      if (fonts) Object.defineProperty(document, "fonts", fonts);
      else Reflect.deleteProperty(document, "fonts");
    }
  });

  it("uses Legato for a new visitor and invalid links", () => {
    expect(parsePlaygroundTheme("")).toBe("legato");
    expect(parsePlaygroundTheme("?theme=unknown&view=docs")).toBe("legato");
    expect(parsePlaygroundTheme("?theme=")).toBe("legato");
    expect(isPlaygroundTheme({ toString: () => "white" })).toBe(false);
  });
  it("honours each shipped theme from a deep link", () => {
    for (const theme of ["legato", "legato-dark", "gavia", "white", "graphite", "newspaper", "gavia-dark"] as const) {
      expect(isPlaygroundTheme(theme)).toBe(true);
      expect(parsePlaygroundTheme("?view=docs&section=colors&theme=" + theme)).toBe(theme);
    }
  });
  it.each([["legato", "legato-dark"], ["gavia", "gavia-dark"]] as const)("switches between %s and %s", (light, dark) => {
    expect(getPlaygroundThemeToggleTarget(light)).toBe(dark);
    expect(getPlaygroundThemeToggleTarget(dark)).toBe(light);
  });
  it("changes theme without losing the Pages route, anchor or unrelated parameters", () => {
    const current = new URL("https://example.test/legato-ui/?view=docs&component=WlButton&theme=white&example=focus#docs-button-source-title");
    const target = createPlaygroundThemeUrl(current, "gavia");
    expect(target.href).toBe("https://example.test/legato-ui/?view=docs&component=WlButton&theme=gavia&example=focus#docs-button-source-title");
    expect(current.searchParams.get("theme")).toBe("white");
    expect(parsePlaygroundTheme(target.search)).toBe("gavia");
  });
  it("lists each light and dark family together", () => {
    expect(playgroundThemeOptions).toEqual([
      { value: "legato", label: "Legato" }, { value: "legato-dark", label: "Legato Dark" },
      { value: "gavia", label: "Gavia" }, { value: "gavia-dark", label: "Gavia Dark" },
      { value: "white", label: "Classic" },
      { value: "graphite", label: "Classic Dark" }, { value: "newspaper", label: "Newspaper" }
    ]);
  });
  it.each(["en", "ru"] as const)("keeps the chosen theme and %s language in native query links with routes and anchors", (language) => {
    playgroundLocale.value = language;
    const href = "?view=docs&section=colors&theme=white#docs-colors-themes";
    const target = withPlaygroundTheme(href, "graphite");
    expect(target).toBe(`?view=docs&section=colors&theme=graphite&lang=${language}#docs-colors-themes`);
    const url = new URL(target, "https://example.test/legato-ui/");
    expect(url.pathname).toBe("/legato-ui/");
    expect(parsePlaygroundTheme(url.search)).toBe("graphite");
    expect(url.searchParams.get("lang")).toBe(language);
    expect(url.hash).toBe("#docs-colors-themes");
    expect(withPlaygroundTheme("?", "newspaper")).toBe(`?theme=newspaper&lang=${language}`);
    expect(withPlaygroundTheme("/legato-ui/?view=docs&component=WlButton#api", "gavia")).toBe(`/legato-ui/?view=docs&component=WlButton&theme=gavia&lang=${language}#api`);
    expect(href).toBe("?view=docs&section=colors&theme=white#docs-colors-themes");
  });
});

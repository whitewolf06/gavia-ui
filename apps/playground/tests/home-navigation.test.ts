import type { Plugin } from "vue";
import { enableAutoUnmount, mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HomePage from "../src/HomePage.vue";
import { playgroundI18n, playgroundLocale } from "../src/i18n";
import { playgroundThemePreference } from "../src/themes";

enableAutoUnmount(afterEach);

let previousHref = window.location.href;
let previousLocale = playgroundLocale.value;
let previousI18nLocale = playgroundI18n.global.locale.value;
let previousTheme = playgroundThemePreference.value;

beforeEach(() => {
  previousHref = window.location.href;
  previousLocale = playgroundLocale.value;
  previousI18nLocale = playgroundI18n.global.locale.value;
  previousTheme = playgroundThemePreference.value;
  playgroundLocale.value = "ru";
  playgroundI18n.global.locale.value = "ru";
  playgroundThemePreference.value = "graphite";
});

afterEach(() => {
  window.history.replaceState(null, "", previousHref);
  playgroundLocale.value = previousLocale;
  playgroundI18n.global.locale.value = previousI18nLocale;
  playgroundThemePreference.value = previousTheme;
  vi.unstubAllEnvs();
});

function mountHome() {
  return mount(HomePage, {
    props: { theme: "graphite" },
    global: { plugins: [playgroundI18n as unknown as Plugin] }
  });
}

describe("Home navigation URLs", () => {
  it("renders canonical Pages destinations from the Russian home", () => {
    vi.stubEnv("BASE_URL", "/gavia-ui/");
    window.history.replaceState(null, "", "/gavia-ui/ru/?theme=graphite");
    const wrapper = mountHome();

    expect(wrapper.get('[data-testid="home-quality"] a').attributes("href"))
      .toBe("/gavia-ui/ru/docs/quality/?theme=graphite");
    expect(wrapper.get(".home-sections + p a").attributes("href"))
      .toBe("/gavia-ui/ru/theme-builder/?theme=graphite");
    expect(wrapper.findAll(".home-action")[1]!.attributes("href"))
      .toBe("/gavia-ui/ru/docs/?theme=graphite#docs-components");
  });

  it("keeps portable destinations on the archive entry with the current language, theme and anchor", () => {
    vi.stubEnv("BASE_URL", "./");
    window.history.replaceState(null, "", "/archive/index.html?theme=graphite&lang=ru");
    const wrapper = mountHome();
    const quality = new URL(
      wrapper.get('[data-testid="home-quality"] a').attributes("href")!, window.location.href
    );
    const catalog = new URL(
      wrapper.findAll(".home-action")[1]!.attributes("href")!, window.location.href
    );

    expect(quality.pathname).toBe("/archive/index.html");
    expect(Object.fromEntries(quality.searchParams)).toEqual({
      view: "docs", section: "quality", theme: "graphite", lang: "ru"
    });
    expect(catalog.pathname).toBe("/archive/index.html");
    expect(catalog.searchParams.get("view")).toBe("docs");
    expect(catalog.searchParams.get("theme")).toBe("graphite");
    expect(catalog.searchParams.get("lang")).toBe("ru");
    expect(catalog.hash).toBe("#docs-components");
  });
});

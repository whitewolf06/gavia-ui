import type { Plugin } from "vue";
import { mount } from "@vue/test-utils";
import summary from "virtual:gavia-catalog-summary";
import { describe, expect, it } from "vitest";
import tokenCatalog from "../../../packages/ui-kit/tokens/catalog.generated.json";
import { gaviaVariableFontFiles } from "../build/font-download";
import { checkBrandImages } from "../scripts/brand-images.mjs";
import HomePage from "../src/HomePage.vue";
import { playgroundI18n } from "../src/i18n";

describe("home-page asset loading", () => {
  it("requires both variable-font styles with a complete fallback and compact core", () => {
    const suffixes = { full: "", core: "-Core" };
    const files = ["normal", "italic"].flatMap((style) =>
      Object.entries(suffixes).map(([subset, suffix]) => ({
        file: "Gavia-Variable" + (style === "italic" ? "-Italic" : "") + suffix + ".woff2",
        style, subset, sha256: "a".repeat(64), bytes: 100,
        unicodeRange: subset === "full" ? "U+0041-005A, U+0301" : "U+0041-005A"
      })));
    const manifest = {
      family: "Gavia Sans",
      axis: { tag: "wght", minimum: 100, default: 400, maximum: 700 },
      files
    };
    expect(gaviaVariableFontFiles(manifest)).toEqual(files);
    expect(files.map(({ file }) => file)).toEqual([
      "Gavia-Variable.woff2",
      "Gavia-Variable-Core.woff2",
      "Gavia-Variable-Italic.woff2",
      "Gavia-Variable-Italic-Core.woff2"
    ]);
    expect(() => gaviaVariableFontFiles({
      ...manifest, axis: { ...manifest.axis, maximum: 900 }
    })).toThrow();
    expect(() => gaviaVariableFontFiles({ ...manifest, files: files.slice(1) })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest,
      files: files.filter(({ style, subset }) => style !== "italic" || subset !== "core")
    })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest, files: [files[0], ...files.slice(0, -1)]
    })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest, files: [{ ...files[0], file: "../outside.woff2" }, ...files.slice(1)]
    })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest, files: [{ ...files[0], sha256: "invalid" }, ...files.slice(1)]
    })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest, files: [{ ...files[0], bytes: 0 }, ...files.slice(1)]
    })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest,
      files: [{ ...files[1], file: "Gavia-Variable-Extended.woff2" }, files[0], ...files.slice(2)]
    })).toThrow();
    expect(() => gaviaVariableFontFiles({
      ...manifest, files: [{ ...files[0], subset: "constructor" }, ...files.slice(1)]
    })).toThrow();

    const previousSuffixes = { full: "", latin: "-Latin", "latin-ext": "-LatinExt", cyrillic: "-Cyrillic" };
    const previousFiles = ["normal", "italic"].flatMap((style) =>
      Object.entries(previousSuffixes).map(([subset, suffix]) => ({
        ...files[0], style, subset,
        file: "Gavia-Variable" + (style === "italic" ? "-Italic" : "") + suffix + ".woff2"
      })));
    expect(() => gaviaVariableFontFiles({ ...manifest, files: previousFiles })).toThrow();
  });

  it("derives compact metrics from canonical tokens without a second token inventory", () => {
    expect(summary.tokenCount).toBe(tokenCatalog.tokens.length);
    expect(summary.themeCount).toBe(5);
    expect(summary.themes.map((theme) => theme.name).sort()).toEqual(tokenCatalog.themes.map((theme) => theme.name).sort());
  });

  it("preserves authored source hashes and every responsive derivative's bytes and dimensions", async () => {
    const manifest = await checkBrandImages();
    expect(manifest.images).toHaveLength(12);
    expect(manifest.images.every((entry: { width: number }) => [640, 1024, 1600].includes(entry.width))).toBe(true);
  });

  it("keeps the night illustration out of a light visit and retains loaded art for later theme transitions", async () => {
    const wrapper = mount(HomePage, { props: { theme: "gavia" }, global: { plugins: [playgroundI18n as unknown as Plugin] } });
    expect(wrapper.find(".home-hero-layer--night").exists()).toBe(false);
    const day = wrapper.get(".home-hero-layer");
    expect(day.attributes("srcset")).toMatch(/640w, .*1024w, .*1600w, .*2172w$/);
    expect(wrapper.findAll(".home-project-art").map((image) => image.attributes("loading"))).toEqual(["lazy", "lazy"]);
    await wrapper.setProps({ theme: "gavia-dark" });
    await wrapper.get(".home-hero-layer--night").trigger("load");
    expect(wrapper.get(".home-hero-layer--night").classes()).toContain("home-hero-layer--visible");
    await wrapper.setProps({ theme: "white" });
    expect(wrapper.get(".home-hero-layer--night").classes()).not.toContain("home-hero-layer--visible");
    wrapper.unmount();
  });
});

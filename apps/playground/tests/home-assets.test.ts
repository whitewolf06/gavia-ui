import type { Plugin } from "vue";
import { mount } from "@vue/test-utils";
import summary from "virtual:gavia-catalog-summary";
import { describe, expect, it } from "vitest";
import tokenCatalog from "../../../packages/ui-kit/tokens/catalog.generated.json";
import { checkBrandImages } from "../scripts/brand-images.mjs";
import HomePage from "../src/HomePage.vue";
import { playgroundI18n } from "../src/i18n";

describe("home-page asset loading", () => {
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

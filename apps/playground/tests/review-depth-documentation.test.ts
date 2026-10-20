import type { Plugin } from "vue";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath, URL as NodeURL } from "node:url";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compileScript, compileTemplate, parse } from "vue/compiler-sfc";
import { consumerSource } from "../../../scripts/example-source.mjs";
import FieldExample from "../src/design-system/examples/WlField.vue";
import FileUploadExample from "../src/design-system/examples/WlFileUpload.vue";
import StepsExample from "../src/design-system/examples/WlSteps.vue";
import { documentationPtSections } from "../src/documentation/components/pt-sections";
import { documentationMetadataSource } from "../src/documentation/localize";
import { playgroundI18n } from "../src/i18n";
import documentationEnglish from "../src/i18n/messages/documentation.en.json";
import documentationRussian from "../src/i18n/messages/documentation.ru.json";

enableAutoUnmount(afterEach);
const base = new NodeURL("../src/", import.meta.url);
const components = fileURLToPath(new NodeURL("../../../packages/ui-kit/src/components/", import.meta.url));
const rawMetadata = documentationMetadataSource(documentationPtSections);
const plugin = playgroundI18n as unknown as Plugin;
let previousLocale = playgroundI18n.global.locale.value;
beforeEach(() => {
  previousLocale = playgroundI18n.global.locale.value;
  playgroundI18n.global.locale.value = "en";
});
afterEach(() => {
  playgroundI18n.global.locale.value = previousLocale;
  vi.unstubAllGlobals();
});

function usedSections(source: string, prefix = ""): string[] {
  return [...source.matchAll(/(section|\w+Section)\(['"]([^'"]+)/g)].map((match) => {
    const parent = match[1] === "panelsSection"
      ? "panels."
      : match[1] === "panelSection"
        ? "panel."
        : match[1] === "menuSection" ? "menuPt." : prefix;
    return parent + match[2];
  });
}

describe("review depth documentation contracts", () => {
  for (const filename of readdirSync(components).filter((file) => /^Wl.*\.vue$/.test(file))) {
    const name = filename.replace(/\.vue$/, "");
    const source = readFileSync(components + filename, "utf8");
    const sections = usedSections(source);
    if (name === "WlMenu" || name === "WlContextMenu") {
      sections.push(...usedSections(readFileSync(components + "internal/MenuPanel.vue", "utf8"), name === "WlContextMenu" ? "menuPt." : ""));
    }
    if (sections.length) it(name + " documents every resolved DOM section with EN/RU prose", () => {
      const entries = rawMetadata[name]!;
      const names = entries.map((entry) => entry.name);
      expect(new Set(names).size).toBe(names.length);
      for (const section of sections) expect(names, name + "." + section).toContain(section);
      for (const entry of entries) {
        expect(entry.element).not.toMatch(/documentation\.strings|^(?:DOM|Wl|slot|template)/);
        const key = entry.description.replace("documentation.strings.", "");
        expect(documentationEnglish.strings[key as keyof typeof documentationEnglish.strings], name + "." + entry.name).toBeTruthy();
        expect(documentationRussian.strings[key as keyof typeof documentationRussian.strings], name + "." + entry.name).toBeTruthy();
      }
    });
  }

  it("keeps canonical nested paths beside their supported 0.x aliases", () => {
    for (const name of ["WlDialog", "WlDrawer"]) {
      expect(rawMetadata[name]!.map((entry) => entry.name)).toEqual(expect.arrayContaining(["closeButton.root", "pcCloseButton.root"]));
    }
    expect(rawMetadata.WlMultiSelect!.map((entry) => entry.name)).toEqual(expect.arrayContaining(["chip.root", "pcChip.root", "filter.root", "pcFilter.root", "selectAllInput", "footer"]));
    expect(rawMetadata.WlTabs!.map((entry) => entry.name)).toEqual(expect.arrayContaining(["panels.root", "panel.root", "tabpanels.root", "tabpanel.root"]));
    expect(rawMetadata.WlTable!.map((entry) => entry.name)).toEqual(expect.arrayContaining(["caption", "headerCell", "sortButton", "selectionInput"]));
  });

  for (const name of ["WlField", "WlSteps", "WlFileUpload"]) {
    for (const path of ["design-system/examples/" + name + ".vue", "documentation/components/" + (name === "WlFileUpload" ? "inputs/" : "showcase/") + name + ".vue"]) {
      it(path + " compiles as an independent public consumer", () => {
        const source = consumerSource(readFileSync(new NodeURL(path, base), "utf8"));
        const parsed = parse(source, { filename: path });
        expect(parsed.errors).toEqual([]);
        expect(source).not.toMatch(/examples\.review|usePlaygroundI18n|v-bind="preview"/);
        const script = compileScript(parsed.descriptor, { id: path });
        const template = compileTemplate({
          source: parsed.descriptor.template!.content, id: path, filename: path,
          compilerOptions: { bindingMetadata: script.bindings }
        });
        expect(template.errors).toEqual([]);
      });
    }
  }

  it("Field example keeps the visible Select label and both validation descriptions connected", async () => {
    const wrapper = mount(FieldExample, { global: { plugins: [plugin] } });
    const combobox = wrapper.get('[role="combobox"]');
    const labelId = combobox.attributes("aria-labelledby");
    expect(wrapper.get("#" + labelId).text()).toContain("Status");
    expect(wrapper.get('[data-orientation="horizontal"] .wl-field__optional').text().length).toBeGreaterThan(0);
    await wrapper.get("form").trigger("submit");
    const input = wrapper.get('input[maxlength="80"]');
    const ids = input.attributes("aria-describedby")!.split(" ");
    expect(ids).toHaveLength(2);
    expect(ids.map((id) => wrapper.get("#" + id).text()).join(" ")).toContain("Enter a material title");
    await input.setValue("Release notes");
    await wrapper.get("form").trigger("submit");
    expect(wrapper.find('[role="alert"]').exists()).toBe(false);
    expect(input.attributes("aria-describedby")!.split(" ")).toHaveLength(1);
  });

  it("Steps example preserves ordered-list semantics and controlled horizontal/vertical navigation", async () => {
    const wrapper = mount(StepsExample, { attachTo: document.body, global: { plugins: [plugin] } });
    const lists = wrapper.findAll("ol");
    expect(lists).toHaveLength(2);
    expect(lists.every((list) => list.attributes("role") === undefined)).toBe(true);
    expect(lists[1]!.attributes("data-orientation")).toBe("vertical");
    const first = lists[0]!.findAll("li button")[0]!;
    await first.trigger("click");
    expect(lists.every((list) => list.findAll("li")[0]!.attributes("aria-current") === "step")).toBe(true);
    await lists[1]!.findAll("li button")[0]!.trigger("keydown", { key: "ArrowDown" });
    expect(document.activeElement).toBe(lists[1]!.findAll("li button")[1]!.element);
    const toggle = wrapper.findAll("button").find((button) => button.text() === "Toggle access error")!;
    await toggle.trigger("click");
    expect(wrapper.findAll(".wl-steps__step.is-error")).toHaveLength(0);
  });

  it("FileUpload example exercises preview, progress, failure, retry and removal locally", async () => {
    const revoke = vi.fn();
    vi.stubGlobal("URL", class extends URL {
      static override createObjectURL = vi.fn(() => "blob:review-preview");
      static override revokeObjectURL = revoke;
    });
    const wrapper = mount(FileUploadExample, { global: { plugins: [plugin] } });
    const file = new File(["image"], "example.png", { type: "image/png" });
    const input = wrapper.get('input[type="file"]');
    Object.defineProperty(input.element, "files", { configurable: true, value: [file] });
    await input.trigger("change");
    await flushPromises();
    expect(wrapper.get("img").attributes("src")).toBe("blob:review-preview");
    const button = (text: string) => wrapper.findAll("button").find((candidate) => candidate.text() === text)!;
    await button("Advance demo progress").trigger("click");
    expect(wrapper.get("progress").attributes("value")).toBe("25");
    await button("Show error").trigger("click");
    expect(wrapper.get(".wl-upload__row").attributes("data-status")).toBe("error");
    await button("Retry").trigger("click");
    expect(wrapper.get("progress").attributes("value")).toBe("0");
    for (let step = 0; step < 4; step++) await button("Advance demo progress").trigger("click");
    expect(wrapper.get(".wl-upload__row").attributes("data-status")).toBe("success");
    await button("Delete").trigger("click");
    expect(wrapper.find(".wl-upload__row").exists()).toBe(false);
    expect(revoke).toHaveBeenCalledWith("blob:review-preview");
  });
});

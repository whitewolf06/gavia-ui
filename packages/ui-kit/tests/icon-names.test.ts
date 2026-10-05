import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { WL_ICONS, WL_ICON_NAMES } from "../src/icons.generated";
import { resolveWlIconName } from "../src/iconNames";
import WlIcon from "../src/components/WlIcon.vue";
import WlIconButton from "../src/components/WlIconButton.vue";
import WlNavItem from "../src/components/WlNavItem.vue";
import baseline from "./fixtures/icons-0.3.json";

const noteKeys = "file-edit file book bookmark check-circle users lightbulb calendar briefcase heart star flag map chart-bar list-check code database link image comments".split(" ");
const referenceDefaults = "sparkles smile cloud-rain alert-circle flame waves lightbulb zap home users heart briefcase cross wrench circle".split(" ");

describe("icon display compatibility", () => {
  it("preserves every previous drawing and resolves the complete catalog", () => {
    for (const name of WL_ICON_NAMES) expect(resolveWlIconName(name)).toBe(name);
    for (const [name, drawing] of Object.entries(baseline)) {
      expect(WL_ICONS[name as keyof typeof WL_ICONS]).toBe(drawing);
    }
  });

  it.each([...noteKeys, ...referenceDefaults])("renders persisted %s without changing it", (key) => {
    const resolved = resolveWlIconName(key);
    expect(resolved).toBeDefined();
    expect(WL_ICONS[resolved!]).toBeTruthy();
    expect(resolveWlIconName(`pi-${key}`)).toBe(resolved);
    expect(resolveWlIconName(`pi pi-${key}`)).toBe(resolved);
    expect(key).not.toMatch(/^pi/);
  });

  it.each([
    ["pi pi-pencil", "edit"], ["cog", "settings"], ["pi-bolt", "lightning"],
    ["pi pi-times", "x"], ["sparkles", "sparkle"], ["alert-circle", "exclamation-circle"]
  ])("resolves %s to %s", (input, expected) => {
    expect(resolveWlIconName(input)).toBe(expected);
  });

  it.each([undefined, null, "", "missing", "__proto__", "constructor", "toString", "pi pi-missing", "pi pi-star arbitrary", "<svg onload=alert(1)>", "star heart", "spinner"]) (
    "returns undefined for unknown or unsafe %s", (input) => expect(resolveWlIconName(input)).toBeUndefined()
  );

  it("renders a legacy identifier as SVG and preserves the unknown-name slot", () => {
    const known = mount(WlIcon, { props: { name: "pi pi-pencil", size: 16 } });
    expect(known.get("svg").attributes("data-icon")).toBe("edit");
    expect(known.get("svg").attributes("width")).toBe("16px");
    expect(known.find("i").exists()).toBe(false);
    const unknown = mount(WlIcon, { props: { name: "missing" }, slots: { default: "fallback" } });
    expect(unknown.find("svg").exists()).toBe(false);
    expect(unknown.text()).toBe("fallback");
  });

  it("accepts persisted identifiers through button and navigation icon props", () => {
    expect(mount(WlIconButton, { props: { icon: "pi pi-cog" } }).get("svg").attributes("data-icon")).toBe("settings");
    expect(mount(WlNavItem, { props: { icon: "pi pi-briefcase", label: "Project" } }).get("svg").attributes("data-icon")).toBe("briefcase");
  });
});

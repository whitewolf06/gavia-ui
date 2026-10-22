import { describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { WlCheckboxGroup, WlRadioGroup, WlTooltip } from "../../src";

async function renderGroups(prefix: string): Promise<string> {
  const app = createSSRApp({ render: () => h("div", [
    h(WlCheckboxGroup<string>, { options: ["Read", "Share"], modelValue: ["Read"], legend: "Permissions" }),
    h(WlRadioGroup<string>, { options: ["Basic", "Team"], modelValue: "Basic", legend: "Plan" }),
    h(WlRadioGroup<string>, { options: ["Light", "Dark"], legend: "Theme" }),
    h(WlTooltip, { content: "Details", visible: true }, { default: () => h("button", "Details") })
  ]) });
  (app.config as typeof app.config & { idPrefix?: string }).idPrefix = prefix;
  return renderToString(app);
}

describe("new controls SSR identities", () => {
  it("keeps repeated renders deterministic and isolates concurrent request prefixes", async () => {
    const [first, repeated, other] = await Promise.all([renderGroups("request-a"), renderGroups("request-a"), renderGroups("request-b")]);
    expect(first).toBe(repeated);
    const ids = [...first.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => id!.includes("request-a"))).toBe(true);
    const otherIds = new Set([...other.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
    expect(ids.some((id) => otherIds.has(id))).toBe(false);
    const names = [...first.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(names).size).toBe(2);
  });
});

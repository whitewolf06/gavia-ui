import { type WlTabItem, WlTabs } from "../src";

const items = [
  { key: "overview", label: "Overview", href: "/overview" },
  { key: "notes", label: "Notes", to: { name: "notes", params: { id: 1 } } }
] as const satisfies readonly WlTabItem<"overview" | "notes">[];
const valid = (
  <WlTabs
    items={items}
    modelValue="notes"
    onUpdate:modelValue={(key) => {
      const selected: "overview" | "notes" | "" = key;
      void selected;
    }}
  />
);
// @ts-expect-error item href remains a URL string.
const invalidHref: WlTabItem = { key: "overview", label: "Overview", href: { name: "overview" } };
// @ts-expect-error linked tabs preserve model inference from their item keys.
const invalidModel = <WlTabs items={items} modelValue="missing" />;
void [valid, invalidHref, invalidModel];

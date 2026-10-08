/** Compile-only PT consumer contracts; included in the strict library typecheck. */
import type { WlConfigOptions } from "../src";
import { createWlPt } from "../src";
import type {
  WlPt,
  WlPtAttributes,
  WlPtCallbackOptions,
  WlPtConfig,
  WlPtConfigStrict,
  WlPtStrict
} from "../src";

export function ptConsumerTypes(): void {
  const select = {
    root: {
      class: ["consumer-select", { compact: true }],
      style: [{ color: "var(--consumer-ink)" }, "padding: 0"],
      "data-owner": "consumer",
      "aria-describedby": "select-help",
      onClick: (event: MouseEvent) => { void event.clientX; },
      onVnodeMounted: (node) => { void node.el; }
    },
    option: ({ context }) => {
      const focused: boolean = context.focused;
      const selected: boolean = context.selected;
      return { class: { focused, selected }, "data-selected": selected };
    }
  } satisfies WlPtStrict<"select">;

  const multiple = {
    hiddenInput: { "aria-label": "Choose values" },
    pcChip: {
      root: { class: "consumer-chip" },
      label: { "data-chip-label": true },
      removeIcon: { "aria-label": "Remove" }
    },
    pcFilter: { root: { placeholder: "Search", "data-filter": true } },
    option: ({ context }) => ({ "data-focused": context.focused, "data-selected": context.selected })
  } satisfies WlPtStrict<"multiselect">;

  const calendar = {
    pcInputText: { root: { "aria-describedby": "date-help" } },
    pcPrevButton: { root: { "aria-label": "Previous month" }, icon: { class: "previous-icon" } },
    day: ({ context }) => {
      const inRange: boolean = context.inRange;
      const today: boolean = context.today;
      const disabled: boolean = context.disabled;
      return { class: { inRange, today, disabled } };
    }
  } satisfies WlPtStrict<"datepicker">;

  const tabs = {
    tabList: { "aria-label": "Settings" },
    tabpanels: { root: { class: "consumer-panels" } },
    tabpanel: { root: { "data-panel": "settings" } }
  } satisfies WlPtStrict<"tablist">;

  const app = createWlPt({
    select: {
      option: ({ context }) => {
        const selected: boolean = context.selected;
        return { class: { selected } };
      }
    },
    autocomplete: { pcInputText: { root: { "aria-label": "Search" } } },
    tabpanels: { root: { class: "app-panels" } }
  });
  const config: WlConfigOptions = { pt: app };
  const strictConfig = { select, multiselect: multiple, datepicker: calendar } satisfies WlPtConfigStrict;

  // Existing dynamic records and arbitrary extension sections remain accepted by the open contract.
  const dynamic: Record<string, unknown> = { root: { "data-source": "dynamic" } };
  const open: WlPt<"select"> = dynamic;
  const extended: WlPt<"multiselect"> = { pcChip: { customSection: { class: "extension" } } };
  const customApp: WlPtConfig = { consumerWidget: { customSection: { "data-value": true } } };
  const legacyApp: Record<string, Record<string, WlPtAttributes>> = { select: { root: { class: "legacy" } } };
  const legacyConfig: WlPtConfig = legacyApp;
  const dynamicApp: Record<string, unknown> = { select: { root: { class: "dynamic" } }, consumerMetadata: "opaque" };
  const dynamicConfig: WlPtConfig = dynamicApp;
  const dynamicMerged = createWlPt(dynamicApp);
  const opaqueExtensions: WlPtConfig = { consumerMetadata: "opaque", consumerFlags: true };
  const declaredExtension = { root: { class: "select" }, analytics: { "data-ui": "selector" } } satisfies WlPtStrict<"select", { analytics?: WlPtAttributes }>;
  const broadCallback = ({ context }: WlPtCallbackOptions): WlPtAttributes => ({ "data-checked": context.checked });
  const legacyCallback: WlPt<"checkbox"> = { box: broadCallback };

  // @ts-expect-error Strict section names detect misspelled option hooks.
  const wrongSection: WlPtStrict<"select"> = { optoin: { class: "typo" } };
  // @ts-expect-error Strict validation includes nested section names.
  const wrongNested: WlPtStrict<"multiselect"> = { pcChip: { removeIocn: { class: "typo" } } };
  // @ts-expect-error Known nested groups are objects; callbacks are resolved only at leaf sections.
  const wrongGroup: WlPt<"multiselect"> = { pcChip: () => ({ root: { class: "ignored-at-runtime" } }) };
  // @ts-expect-error Known sections accept attributes or attribute callbacks, not primitive values.
  const wrongValue: WlPt<"select"> = { option: "consumer-option" };
  // @ts-expect-error Selection context is boolean, not a selected item value.
  const wrongContext: WlPt<"select"> = { option: ({ context }: { context: { selected: string } }) => ({ class: context.selected }) };
  // @ts-expect-error Strict application configuration detects misspelled component names.
  const wrongComponent: WlPtConfigStrict = { multiselekt: multiple };
  // @ts-expect-error Attribute event hooks retain their DOM event contract.
  const wrongHook: WlPtStrict<"select"> = { root: { onClick: (event: KeyboardEvent) => { void event.key; } } };

  void [select, multiple, calendar, tabs, config, strictConfig, open, extended, customApp,
    legacyConfig, dynamicConfig, dynamicMerged, opaqueExtensions, declaredExtension, legacyCallback, wrongSection, wrongNested, wrongGroup,
    wrongValue, wrongContext, wrongComponent, wrongHook];
}

/** Compile-only distinction between Vue-bound PT and directive-managed tooltip attributes. */
import type { WlConfigOptions, WlPtStrict, WlTooltipPtAttributes, WlTooltipValue } from "../src";

export function tooltipPtConsumerTypes(): void {
  const attrs: WlTooltipPtAttributes = {
    class: ["tooltip", { compact: true }], style: [{ color: "red" }, "padding: 2px"],
    "data-owner": "consumer", "aria-label": "Help"
  };
  const tooltip: WlTooltipValue = {
    value: "Help", pt: { root: ({ context }) => ({ ...attrs, "data-context": context.active }), text: { title: "Details" } }
  };
  const config: WlConfigOptions = { pt: { tooltip: { arrow: () => ({ class: "arrow" }) } } };
  const vueBound = {
    root: { onClick: (event: MouseEvent) => void event.clientX, onVnodeMounted: (node) => void node.el }
  } satisfies WlPtStrict<"select">;

  // @ts-expect-error Tooltip DOM sections do not bind Vue listeners.
  const click: WlPtStrict<"tooltip"> = { root: { onClick: () => {} } };
  // @ts-expect-error A section callback is valid, but its return value cannot promise vnode hooks.
  const hook: WlPtStrict<"tooltip"> = { root: () => ({ onVnodeMounted: () => {} }) };
  // @ts-expect-error Directive-managed nodes cannot attach a Vue ref through PT.
  const reference: WlTooltipPtAttributes = { ref: "tooltip" };
  // @ts-expect-error Event restrictions also apply inside application tooltip configuration.
  const appClick: WlConfigOptions = { pt: { tooltip: { text: { onPointerdown: () => {} } } } };

  void [tooltip, config, vueBound, click, hook, reference, appClick];
}

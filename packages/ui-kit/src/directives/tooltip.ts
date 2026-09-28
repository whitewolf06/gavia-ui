import { normalizeClass, normalizeStyle, type Directive, type DirectiveBinding } from "vue";
import { resolveWlPt, wlConfigForDirective, type WlConfigOptions } from "../config";

type TooltipValue = string | { value: string; showDelay?: number; hideDelay?: number; pt?: Record<string, unknown> };
interface TooltipState {
  node: HTMLSpanElement | null;
  timer: ReturnType<typeof setTimeout> | null;
  text: string;
  showDelay: number;
  hideDelay: number;
  placement: "top" | "bottom" | "left" | "right";
  previousDescription: string | null;
  config: WlConfigOptions;
  pt: Record<string, unknown> | undefined;
  onEnter: () => void;
  onLeave: () => void;
  onKeydown: (event: KeyboardEvent) => void;
  onReposition: () => void;
}
const states = new WeakMap<HTMLElement, TooltipState>();
let nextId = 0;

function applySection(element: HTMLElement, baseClass: string, attrs: Record<string, unknown>): void {
  element.className = normalizeClass([baseClass, attrs.class]);
  const style = normalizeStyle(attrs.style);
  if (typeof style === "string") element.style.cssText = style;
  else if (style) Object.assign(element.style, style);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === "class" || key === "style" || value == null) continue;
    if (["string", "number", "boolean"].includes(typeof value)) element.setAttribute(key, String(value));
  }
}

function applyTooltipPt(state: TooltipState): void {
  if (!state.node) return;
  applySection(state.node, "wl-tooltip", resolveWlPt("tooltip", "root", state.config, state.pt));
  const textNode = state.node.querySelector<HTMLElement>(".wl-tooltip__text");
  const arrow = state.node.querySelector<HTMLElement>(".wl-tooltip__arrow");
  if (textNode) applySection(textNode, "wl-tooltip__text", resolveWlPt("tooltip", "text", state.config, state.pt));
  if (arrow) applySection(arrow, "wl-tooltip__arrow", resolveWlPt("tooltip", "arrow", state.config, state.pt));
}

function updateState(state: TooltipState, binding: DirectiveBinding<TooltipValue>): void {
  const value = binding.value;
  state.text = typeof value === "string" ? value : value?.value ?? "";
  state.showDelay = typeof value === "string" ? 0 : value?.showDelay ?? 0;
  state.hideDelay = typeof value === "string" ? 0 : value?.hideDelay ?? 0;
  state.pt = typeof value === "string" ? undefined : value?.pt;
  state.placement = binding.modifiers.bottom ? "bottom" : binding.modifiers.left ? "left"
    : binding.modifiers.right ? "right" : "top";
  if (state.node) {
    applyTooltipPt(state);
    const textNode = state.node.querySelector(".wl-tooltip__text");
    if (textNode) textNode.textContent = state.text;
  }
}
function position(element: HTMLElement, state: TooltipState): void {
  if (!state.node) return;
  const rect = element.getBoundingClientRect();
  const tip = state.node.getBoundingClientRect();
  const gap = 7;
  const x = state.placement === "left" ? rect.left - tip.width - gap
    : state.placement === "right" ? rect.right + gap
    : rect.left + (rect.width - tip.width) / 2;
  const y = state.placement === "top" ? rect.top - tip.height - gap
    : state.placement === "bottom" ? rect.bottom + gap
    : rect.top + (rect.height - tip.height) / 2;
  state.node.style.left = `${Math.max(4, Math.min(x, window.innerWidth - tip.width - 4))}px`;
  state.node.style.top = `${Math.max(4, Math.min(y, window.innerHeight - tip.height - 4))}px`;
}

export const WlTooltip: Directive<HTMLElement, TooltipValue> = {
  mounted(element, binding) {
    const state: TooltipState = {
      node: null, timer: null, text: "", showDelay: 0, hideDelay: 0, placement: "top",
      previousDescription: element.getAttribute("aria-describedby"),
      config: wlConfigForDirective(binding.instance), pt: undefined,
      onEnter: () => {}, onLeave: () => {}, onKeydown: () => {}, onReposition: () => {}
    };
    const clear = (): void => { if (state.timer) clearTimeout(state.timer); state.timer = null; };
    const remove = (): void => {
      state.node?.remove();
      state.node = null;
      if (state.previousDescription === null) element.removeAttribute("aria-describedby");
      else element.setAttribute("aria-describedby", state.previousDescription);
    };
    state.onEnter = () => {
      clear();
      if (!state.text) return;
      state.timer = setTimeout(() => {
        if (state.node) return;
        const node = document.createElement("span");
        node.id = `wl-tooltip-${++nextId}`;
        node.className = "wl-tooltip";
        node.setAttribute("role", "tooltip");
        const textNode = document.createElement("span");
        textNode.className = "wl-tooltip__text";
        textNode.textContent = state.text;
        const arrow = document.createElement("span");
        arrow.className = "wl-tooltip__arrow";
        node.append(textNode, arrow);
        document.body.append(node);
        state.node = node;
        applyTooltipPt(state);
        element.setAttribute("aria-describedby", [state.previousDescription, node.id].filter(Boolean).join(" "));
        position(element, state);
      }, state.showDelay);
    };
    state.onLeave = () => { clear(); state.timer = setTimeout(remove, state.hideDelay); };
    state.onKeydown = (event) => { if (event.key === "Escape") { clear(); remove(); } };
    state.onReposition = () => position(element, state);
    updateState(state, binding);
    states.set(element, state);
    element.addEventListener("mouseenter", state.onEnter);
    element.addEventListener("mouseleave", state.onLeave);
    element.addEventListener("focus", state.onEnter);
    element.addEventListener("blur", state.onLeave);
    element.addEventListener("keydown", state.onKeydown);
    window.addEventListener("scroll", state.onReposition, true);
    window.addEventListener("resize", state.onReposition);
  },
  updated(element, binding) {
    const state = states.get(element);
    if (state) { updateState(state, binding); position(element, state); }
  },
  unmounted(element) {
    const state = states.get(element);
    if (!state) return;
    if (state.timer) clearTimeout(state.timer);
    state.node?.remove();
    element.removeEventListener("mouseenter", state.onEnter);
    element.removeEventListener("mouseleave", state.onLeave);
    element.removeEventListener("focus", state.onEnter);
    element.removeEventListener("blur", state.onLeave);
    element.removeEventListener("keydown", state.onKeydown);
    window.removeEventListener("scroll", state.onReposition, true);
    window.removeEventListener("resize", state.onReposition);
    states.delete(element);
  }
};

import { normalizeClass, normalizeStyle, type Directive, type DirectiveBinding } from "vue";
import { resolveWlPt, wlConfigForDirective, type WlConfigOptions } from "../config";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";

type TooltipValue = string | {
  value: string;
  showDelay?: number;
  hideDelay?: number;
  motion?: boolean;
  pt?: Record<string, unknown>;
};
interface TooltipState {
  node: HTMLSpanElement | null;
  timer: ReturnType<typeof setTimeout> | null;
  exitTimer: ReturnType<typeof setTimeout> | null;
  enterFrame: number | null;
  onTransitionEnd: ((event: TransitionEvent) => void) | null;
  phase: "enter" | "leave" | null;
  text: string;
  showDelay: number;
  hideDelay: number;
  motion: boolean | undefined;
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
  if (tooltipMotion(state)) state.node.classList.add("wl-tooltip-motion");
  if (state.phase) state.node.classList.add(`wl-tooltip-motion-${state.phase}`);
  if (state.phase === "leave") markOverlayLeaving(state.node);
  const textNode = state.node.querySelector<HTMLElement>(".wl-tooltip__text");
  const arrow = state.node.querySelector<HTMLElement>(".wl-tooltip__arrow");
  if (textNode) applySection(textNode, "wl-tooltip__text", resolveWlPt("tooltip", "text", state.config, state.pt));
  if (arrow) applySection(arrow, "wl-tooltip__arrow", resolveWlPt("tooltip", "arrow", state.config, state.pt));
}

function tooltipMotion(state: TooltipState): boolean {
  return (state.motion ?? state.config.motion ?? true)
    && !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function transitionDuration(element: HTMLElement): number {
  const style = getComputedStyle(element);
  const parse = (value: string): number => {
    const amount = Number.parseFloat(value);
    return Number.isFinite(amount) ? amount * (value.trim().endsWith("ms") ? 1 : 1000) : 0;
  };
  const durations = style.transitionDuration.split(",").map(parse);
  const delays = style.transitionDelay.split(",").map(parse);
  return Math.max(0, ...durations.map((duration, index) => duration + (delays[index % delays.length] ?? 0)));
}

function updateState(state: TooltipState, binding: DirectiveBinding<TooltipValue>): void {
  const value = binding.value;
  state.text = typeof value === "string" ? value : value?.value ?? "";
  state.showDelay = typeof value === "string" ? 0 : value?.showDelay ?? 0;
  state.hideDelay = typeof value === "string" ? 0 : value?.hideDelay ?? 0;
  state.motion = typeof value === "string" ? undefined : value?.motion;
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
      node: null, timer: null, exitTimer: null, enterFrame: null, onTransitionEnd: null,
      phase: null, text: "", showDelay: 0, hideDelay: 0, motion: undefined, placement: "top",
      previousDescription: element.getAttribute("aria-describedby"),
      config: wlConfigForDirective(binding.instance), pt: undefined,
      onEnter: () => {}, onLeave: () => {}, onKeydown: () => {}, onReposition: () => {}
    };
    const clear = (): void => { if (state.timer) clearTimeout(state.timer); state.timer = null; };
    const cancelTransition = (): void => {
      if (state.enterFrame !== null) cancelAnimationFrame(state.enterFrame);
      if (state.exitTimer) clearTimeout(state.exitTimer);
      if (state.node && state.onTransitionEnd) state.node.removeEventListener("transitionend", state.onTransitionEnd);
      state.enterFrame = null;
      state.exitTimer = null;
      state.onTransitionEnd = null;
      state.phase = null;
      state.node?.classList.remove("wl-tooltip-motion-enter", "wl-tooltip-motion-leave");
    };
    const remove = (): void => {
      cancelTransition();
      state.node?.remove();
      state.node = null;
      if (state.previousDescription === null) element.removeAttribute("aria-describedby");
      else element.setAttribute("aria-describedby", state.previousDescription);
    };
    state.onEnter = () => {
      clear();
      if (!state.text) return;
      if (state.node) {
        cancelTransition();
        restoreOverlayEntering(state.node);
        return;
      }
      state.timer = setTimeout(() => {
        state.timer = null;
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
        if (tooltipMotion(state)) {
          state.phase = "enter";
          node.classList.add("wl-tooltip-motion-enter");
          state.enterFrame = requestAnimationFrame(() => {
            state.enterFrame = null;
            state.phase = null;
            node.classList.remove("wl-tooltip-motion-enter");
          });
        }
      }, state.showDelay);
    };
    state.onLeave = () => {
      clear();
      state.timer = setTimeout(() => {
        state.timer = null;
        if (!state.node || !tooltipMotion(state)) { remove(); return; }
        cancelTransition();
        const node = state.node;
        const duration = transitionDuration(node);
        if (!duration) { remove(); return; }
        state.phase = "leave";
        markOverlayLeaving(node);
        node.classList.add("wl-tooltip-motion-leave");
        state.onTransitionEnd = (event) => { if (event.target === node && event.propertyName === "opacity") remove(); };
        node.addEventListener("transitionend", state.onTransitionEnd);
        state.exitTimer = setTimeout(remove, duration + 50);
      }, state.hideDelay);
    };
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
    if (state.enterFrame !== null) cancelAnimationFrame(state.enterFrame);
    if (state.exitTimer) clearTimeout(state.exitTimer);
    if (state.node && state.onTransitionEnd) state.node.removeEventListener("transitionend", state.onTransitionEnd);
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

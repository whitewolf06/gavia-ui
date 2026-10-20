<script setup lang="ts">
/** WlToolbar public component contract.
 * @slot default - Default component content.
 */
/* Native slotted controls receive events through the APG toolbar composite. */
/* eslint vuejs-accessibility/no-static-element-interactions: "off" */
import { computed, onBeforeUnmount, onMounted, onUpdated, ref, shallowRef, watchEffect } from "vue";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useWlPt } from "../config";
import { useWlRovingFocus } from "../utils/rovingFocus";
const props = withDefaults(defineProps<{
  /**
   * Layout direction and applicable arrow-key navigation direction.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
  /**
   * Wrap arrow-key focus navigation at the first and last items.
   * @default true
   */
  loop?: boolean;
  /**
   * Visual treatment within this component family.
   * @default "default"
   */
  variant?: "default";
  /**
   * Size within the component family's documented scale.
   * @default "md"
   */
  size?: WlSizeSm;
  /**
   * Spacing density for this component family.
   * @default "default"
   */
  density?: WlDensity;
  /**
   * Disable user interaction with this component.
   * @default false
   */
  disabled?: boolean;
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"toolbar">;
}>(), { orientation: "horizontal", loop: true, variant: "default", size: "md", density: "default", disabled: false });
defineSlots<{
  /** Toolbar controls participating in the shared arrow-key focus navigation. */
  default?(props: Record<never, never>): unknown; }>();
const section = useWlPt("toolbar", computed(() => props.pt));
const root = ref<HTMLElement | null>(null);
const items = shallowRef<HTMLElement[]>([]);
const originalTabindex = new Map<HTMLElement, string | null>();
let observer: MutationObserver | undefined;
function isDisabled(index: number): boolean {
  const element = items.value[index];
  return !element || props.disabled || element.matches(":disabled")
    || element.getAttribute("aria-disabled") === "true" || !!element.closest("[hidden], [inert]");
}
const roving = useWlRovingFocus({
  count: () => items.value.length, isDisabled, focus: (index) => items.value[index]?.focus(),
  orientation: () => props.orientation, loop: () => props.loop
});
function restore(element: HTMLElement): void {
  const original = originalTabindex.get(element);
  if (original === null) element.removeAttribute("tabindex");
  else if (original !== undefined) element.setAttribute("tabindex", original);
  originalTabindex.delete(element);
}
function refresh(): void {
  if (!root.value) return;
  const next = Array.from(root.value.querySelectorAll<HTMLElement>('button, a[href], input:not([type="hidden"]), select, textarea, [tabindex]')).filter((element) => element.closest('[role="toolbar"]') === root.value);
  for (const item of originalTabindex.keys()) if (!next.includes(item)) restore(item);
  for (const item of next) if (!originalTabindex.has(item)) originalTabindex.set(item, item.getAttribute("tabindex"));
  items.value = next;
}
watchEffect(() => {
  items.value.forEach((item, index) => item.setAttribute("tabindex", String(roving.tabIndex(index))));
});
function focusIn(event: FocusEvent): void {
  const index = items.value.indexOf(event.target as HTMLElement);
  if (index >= 0 && !isDisabled(index)) roving.active.value = index;
}
function onKeydown(event: KeyboardEvent): void {
  if (props.disabled || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const target = event.target as HTMLElement;
  if (target.matches('input:not([type="button"]):not([type="submit"]):not([type="reset"]), textarea, select, [contenteditable="true"]')) return;
  const index = items.value.findIndex((item) => item === target || item.contains(target));
  if (index < 0) return;
  roving.active.value = index;
  roving.onKeydown(event);
}
function onClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}
onMounted(() => {
  refresh();
  observer = new MutationObserver(refresh);
  observer.observe(root.value!, { subtree: true, childList: true, attributes: true, attributeFilter: ["disabled", "aria-disabled", "hidden", "inert"] });
});
onUpdated(refresh);
onBeforeUnmount(() => {
  observer?.disconnect();
  for (const item of originalTabindex.keys()) restore(item);
});
</script>

<template>
  <div
    ref="root"
    v-bind="section('root')"
    class="wl-toolbar"
    role="toolbar"
    data-wl="toolbar"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    :data-orientation="orientation"
    :aria-orientation="orientation"
    :aria-disabled="disabled || undefined"
    @focusin="focusIn"
    @keydown="onKeydown"
    @click.capture="onClick"
  ><slot></slot></div>
</template>

<script setup lang="ts">
/** WlTooltipComponent public component contract.
 * @slot default - Default component content.
 * @slot content - Custom content.
 */
/* Delegated triggers and hover persistence keep descriptive tooltip content non-interactive. */
/* eslint vuejs-accessibility/no-static-element-interactions: "off", vuejs-accessibility/mouse-events-have-key-events: "off" */
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs, watch } from "vue";
import type { WlPopoverPlacement } from "../overlay-types";
import type { WlPt } from "../pt-types";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";
defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Tooltip text when the content slot is not supplied. */
  content?: string;
  /**
   * Preferred overlay side relative to its anchor.
   * @default "top"
   */
  placement?: WlPopoverPlacement;
  /**
   * Delay in milliseconds before showing the tooltip.
   * @default 0
   */
  showDelay?: number;
  /**
   * Delay in milliseconds before hiding the tooltip.
   * @default 100
   */
  hideDelay?: number;
  /**
   * Disable user interaction with this component.
   * @default false
   */
  disabled?: boolean;
  /** Enable motion locally, with application defaults and reduced-motion preferences respected. */
  motion?: boolean;
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"tooltip">;
}>(), { placement: "top", showDelay: 0, hideDelay: 100, disabled: false, motion: undefined });
/** Whether the surface is open.
 * Paired with update:visible.
 * @default false
 */
const controlled = defineModel<boolean>("visible", { default: false });
const slots = defineSlots<{
  /** Tooltip trigger content with visibility and explicit show/hide actions. */
  default?(props: { visible: boolean; show: () => void; hide: () => void }): unknown;
  /** Formatted descriptive tooltip content; interactive controls belong in a popover. */
  content?(props: Record<never, never>): unknown;
}>();
const section = useWlPt("tooltip", computed(() => props.pt));
const attrs = useAttrs();
const motion = useWlMotion(computed(() => props.motion));
const wrapper = ref<HTMLElement | null>(null);
const wrapperTabindex = ref<0 | undefined>();
const id = `wl-tooltip-component-${useWlId()}`;
const { visible, anchor, panel, style, placement, arrowStyle, show: openOverlay, hide: closeOverlay } = useAnchoredOverlay({
  placement: () => props.placement, align: "center", offset: 7
});
let mounted = false;
let timer: ReturnType<typeof setTimeout> | undefined;
let descriptionTarget: HTMLElement | undefined;
let focused = false;
let hoveringTrigger = false;
let hoveringContent = false;
let dismissed = false;
const hasContent = computed(() => !!props.content || !!slots.content);
function clearTimer(): void {
  if (timer !== undefined) clearTimeout(timer);
  timer = undefined;
}
function removeDescription(): void {
  if (!descriptionTarget) return;
  const tokens = (descriptionTarget.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((token) => token && token !== id);
  if (tokens.length) descriptionTarget.setAttribute("aria-describedby", tokens.join(" "));
  else descriptionTarget.removeAttribute("aria-describedby");
  descriptionTarget = undefined;
}
function syncDescription(): void {
  if (!wrapper.value) return;
  const candidate = wrapper.value.querySelector<HTMLElement>("button, a[href], input, textarea, select, [tabindex]");
  const target = candidate && !candidate.matches(":disabled") && candidate.tabIndex >= 0 ? candidate : wrapper.value;
  wrapperTabindex.value = target === wrapper.value ? 0 : undefined;
  if (descriptionTarget !== target) removeDescription();
  if (!visible.value) {
    removeDescription();
    return;
  }
  descriptionTarget = target;
  const tokens = new Set((target.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean));
  tokens.add(id);
  target.setAttribute("aria-describedby", [...tokens].join(" "));
}
function show(): void {
  clearTimer();
  if (!mounted || props.disabled || !hasContent.value) return;
  dismissed = false;
  anchor.value = wrapper.value;
  openOverlay();
  void nextTick(syncDescription);
}
function hide(): void {
  clearTimer();
  dismissed = true;
  hoveringContent = false;
  closeOverlay();
  removeDescription();
}
function scheduleShow(): void {
  clearTimer();
  if (dismissed || props.disabled || !hasContent.value) return;
  if (props.showDelay <= 0) show();
  else timer = setTimeout(show, props.showDelay);
}
function scheduleHide(): void {
  clearTimer();
  if (focused || hoveringTrigger || hoveringContent) return;
  if (props.hideDelay <= 0) hide();
  else timer = setTimeout(hide, props.hideDelay);
}
function enterTrigger(): void {
  hoveringTrigger = true;
  dismissed = false;
  scheduleShow();
}
function leaveTrigger(): void {
  hoveringTrigger = false;
  scheduleHide();
}
function enterContent(): void {
  hoveringContent = true;
  clearTimer();
}
function leaveContent(): void {
  hoveringContent = false;
  scheduleHide();
}
function focusIn(): void {
  focused = true;
  dismissed = false;
  scheduleShow();
}
function focusOut(event: FocusEvent): void {
  if (event.relatedTarget instanceof Node && wrapper.value?.contains(event.relatedTarget)) return;
  focused = false;
  scheduleHide();
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && visible.value) {
    event.preventDefault();
    hide();
  }
}
watch(controlled, (value) => {
  if (mounted) {
    if (value) show();
    else hide();
  }
});
watch(visible, (value) => {
  if (controlled.value !== value) controlled.value = value;
  if (!value) {
    dismissed = true;
    hoveringContent = false;
    removeDescription();
  } else void nextTick(syncDescription);
}, { flush: "sync" });
watch(() => [props.disabled, hasContent.value], () => {
  if (props.disabled || !hasContent.value) hide();
});
onMounted(() => {
  mounted = true;
  anchor.value = wrapper.value;
  syncDescription();
  if (controlled.value) show();
});
onUpdated(syncDescription);
onBeforeUnmount(() => {
  mounted = false;
  clearTimer();
  removeDescription();
});
defineExpose({ show, hide });
</script>

<template>
  <span
    ref="wrapper"
    v-bind="mergeWlAttrs(attrs, section('trigger'))"
    class="wl-tooltip-component__trigger"
    :tabindex="wrapperTabindex"
    @mouseenter="enterTrigger"
    @mouseleave="leaveTrigger"
    @focusin="focusIn"
    @focusout="focusOut"
    @keydown="onKeydown"
  ><slot :visible="visible" :show="show" :hide="hide"></slot>
    <Teleport to="body">
      <Transition
        name="wl-tooltip-component-motion"
        :css="motion"
        @before-leave="markOverlayLeaving"
        @before-enter="restoreOverlayEntering"
        @leave-cancelled="restoreOverlayEntering"
      >
        <span
          v-if="visible"
          v-bind="section('root')"
          :id="id"
          ref="panel"
          class="wl-tooltip wl-tooltip-component"
          :style="[style, { minWidth: '0' }]"
          role="tooltip"
          data-wl="tooltip"
          :data-placement="placement"
          @mouseenter="enterContent"
          @mouseleave="leaveContent"
        ><span v-bind="section('text')" class="wl-tooltip__text"><slot name="content">{{ content }}</slot></span><span
          v-bind="section('arrow')"
          class="wl-tooltip__arrow"
          :style="arrowStyle"
          aria-hidden="true"
        ></span></span>
      </Transition>
    </Teleport>
  </span>
</template>

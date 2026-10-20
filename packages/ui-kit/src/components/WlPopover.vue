<script setup lang="ts">
/** WlPopover public component contract.
 * @since 0.1.0
 * @slot trigger - Custom trigger content.
 * @slot default - Popover content.
 */
import { computed, onBeforeUnmount, useAttrs } from "vue";
import type { WlPopoverAlign, WlPopoverExpose, WlPopoverPlacement, WlPopoverTrigger, WlPopoverTriggerSlotProps } from "../overlay-types";
import type { WlPt } from "../pt-types";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { useDismissible } from "../utils/overlayProps";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Close by clicking outside the popover.
   * @deprecated Use dismissible. */
  dismissable?: boolean;
  /** Allow the surface to close through its documented dismissal interactions. */
  dismissible?: boolean;
  /**
   * Preferred overlay side relative to its anchor.
   * @default "auto"
   */
  placement?: WlPopoverPlacement;
  /**
   * Alignment of the overlay along its anchor.
   * @default "start"
   */
  align?: WlPopoverAlign;
  /**
   * Show an arrow pointing to the overlay anchor.
   * @default false
   */
  arrow?: boolean;
  /**
   * Interaction that opens the popover; manual mode uses its exposed methods.
   * @default "manual"
   */
  trigger?: WlPopoverTrigger;
  /**
   * Close with Escape.
   * @default true
   */
  closeOnEscape?: boolean;
  /** Accessible popover name. */
  ariaLabel?: string;
  /** ID of the element labelling the popover. */
  ariaLabelledby?: string;
  /** Opening and closing animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"popover">;
}>(), {
  dismissable: true, dismissible: undefined, closeOnEscape: true, motion: undefined,
  placement: "auto", align: "start", arrow: false, trigger: "manual"
});
const emit = defineEmits<{
  /** Popover opened. */
  open: [];
  /** Popover closed. */
  close: [];
  /** Emitted after the closing transition has completed. */
  afterLeave: []; }>();
defineSlots<{
  /** Popover content. */
  default?(props: {}): unknown;
  /** Custom trigger; bind its supplied attributes and use the provided open/close actions. */
  trigger?(props: WlPopoverTriggerSlotProps): unknown; }>();
const attrs = useAttrs();
const section = useWlPt("popover", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const dismissible = useDismissible("WlPopover", computed(() => props.dismissible), computed(() => props.dismissable));
const { visible, anchor, panel, style, arrowStyle, placement: resolvedPlacement, toggle, show, hide } = useAnchoredOverlay({
  dismissible: () => dismissible.value,
  placement: () => props.placement,
  align: () => props.align,
  offset: () => props.arrow ? 8 : 4,
  closeOnEscape: () => props.closeOnEscape,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
const generatedId = `wl-popover-${useWlId()}`;
const rootAttrs = computed(() => mergeWlAttrs({ id: generatedId }, section("root"), attrs));
let closeTimer: ReturnType<typeof setTimeout> | undefined;
function cancelClose(): void {
  if (closeTimer !== undefined) clearTimeout(closeTimer);
  closeTimer = undefined;
}
function containsTarget(target: EventTarget | null): boolean {
  return target instanceof Node && (panel.value?.contains(target) === true || anchor.value?.contains(target) === true);
}
function enter(event: Event): void {
  cancelClose();
  show(event);
}
function leave(event: MouseEvent | FocusEvent): void {
  if ((props.trigger !== "hover" && props.trigger !== "focus") || containsTarget(event.relatedTarget)) return;
  cancelClose();
  closeTimer = setTimeout(() => {
    closeTimer = undefined;
    if (!containsTarget(document.activeElement)) hide();
  }, 120);
}
const triggerAttrs = computed<Record<string, unknown>>(() => ({
  "aria-haspopup": "dialog", "aria-expanded": visible.value,
  "aria-controls": visible.value ? String(rootAttrs.value.id) : undefined,
  ...(props.trigger === "click" ? { onClick: toggle } : {}),
  ...(props.trigger === "hover" ? { onMouseenter: enter, onMouseleave: leave } : {}),
  ...(props.trigger === "hover" || props.trigger === "focus" ? { onFocusin: enter, onFocusout: leave } : {})
}));
onBeforeUnmount(cancelClose);
defineExpose({ toggle, show, hide } satisfies WlPopoverExpose);
</script>

<template>
  <slot
    name="trigger"
    :attrs="triggerAttrs"
    :visible="visible"
    :show="show"
    :hide="hide"
    :toggle="toggle"
  ></slot>
  <Teleport to="body">
    <Transition
      name="wl-pop-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
      @after-leave="emit('afterLeave')"
    >
      <!-- Focus entry/exit mirrors hover so keyboard users retain the same panel visibility. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="visible"
        ref="panel"
        v-bind="rootAttrs"
        class="wl-popover"
        :style="style"
        role="dialog"
        :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby"
        data-wl="popover"
        :data-placement="resolvedPlacement"
        @mouseenter="cancelClose"
        @mouseleave="leave"
        @focusin="cancelClose"
        @focusout="leave"
      >
        <span
          v-if="arrow"
          v-bind="section('arrow')"
          class="wl-popover__arrow"
          :style="arrowStyle"
          :data-placement="resolvedPlacement"
          aria-hidden="true"
        ></span>
        <div v-bind="section('content')" class="wl-popover__content"><slot></slot></div>
      </div>
    </Transition>
  </Teleport>
</template>

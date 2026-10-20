<script setup lang="ts" generic="Item extends WlMenuItemBase = WlMenuItem">
/** WlContextMenu public component contract.
 * @slot trigger - Custom trigger content.
 * @slot default - Default component content.
 */
import { computed, ref, useAttrs, watch } from "vue";
import type { WlMenuCheckEvent, WlMenuExpose, WlMenuItem, WlMenuItemBase, WlMenuTriggerSlotProps } from "../navigation-types";
import type { WlPopoverAlign, WlPopoverPlacement } from "../overlay-types";
import type { WlPt } from "../pt-types";
import type { MenuPanelExpose } from "../utils/menu";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";
import MenuPanel from "./internal/MenuPanel.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /**
   * Readonly item descriptors rendered by this component.
   * @default []
   */
  items?: readonly (Item & WlMenuItem<NoInfer<Item>>)[];
  /**
   * Disable user interaction with this component.
   * @default false
   */
  disabled?: boolean;
  /**
   * Preferred overlay side relative to its anchor.
   * @default "bottom"
   */
  placement?: WlPopoverPlacement;
  /**
   * Alignment of the overlay along its anchor.
   * @default "start"
   */
  align?: WlPopoverAlign;
  /** Accessible name when an external label is not referenced. */
  ariaLabel?: string;
  /** ID or space-separated IDs of elements naming this component. */
  ariaLabelledby?: string;
  /** Enable motion locally, with application defaults and reduced-motion preferences respected. */
  motion?: boolean;
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"contextmenu">;
  /** Pass-through attributes for the context menu's menu panel. */
  menuPt?: WlPt<"menu">;
}>(), { items: () => [], disabled: false, placement: "bottom", align: "start", motion: undefined });
const emit = defineEmits<{
  /** Emitted when the surface opens. */
  open: [];
  /** Emitted when the surface closes. */
  close: [];
  /** Emitted when a menu checkbox or radio item changes its checked state. */
  check: [event: WlMenuCheckEvent<Item>]; }>();
defineSlots<{
  /** Content of the default focusable context-menu trigger. */
  default?(props: Record<never, never>): unknown;
  /** Custom trigger; bind its supplied attributes and use the provided open/close actions. */
  trigger?(props: WlMenuTriggerSlotProps): unknown; }>();
const attrs = useAttrs();
const locale = useWlLocale();
const section = useWlPt("contextmenu", computed(() => props.pt));
const menuSection = useWlPt("menu", computed(() => props.menuPt));
const motion = useWlMotion(computed(() => props.motion));
const root = ref<HTMLElement | null>(null);
const content = ref<MenuPanelExpose | null>(null);
const point = ref<{ x: number; y: number } | null>(null);
const listId = `wl-context-menu-list-${useWlId()}`;
const { visible, anchor, panel, style, show: showOverlay, hide: hideOverlay } = useAnchoredOverlay({
  placement: () => props.placement, align: () => props.align, offset: () => point.value ? 0 : 4,
  anchorRect: () => point.value
    ? { top: point.value.y, bottom: point.value.y, left: point.value.x, right: point.value.x, width: 0, height: 0 }
    : undefined,
  onOpen: () => {
    emit("open");
    content.value?.focusFirst();
  },
  onClose: () => emit("close")
});
function hide(event?: Event): void {
  content.value?.closeChildren();
  hideOverlay(event);
}
watch(() => props.disabled, (disabled) => {
  if (disabled) hide();
});
function show(event?: Event): void {
  if (props.disabled) return;
  event?.preventDefault();
  event?.stopPropagation();
  const target = event?.currentTarget ?? event?.target;
  if (target instanceof HTMLElement) anchor.value = target;
  else if (!anchor.value) anchor.value = root.value;
  anchor.value?.focus();
  point.value = event instanceof MouseEvent && event.type === "contextmenu" ? { x: event.clientX, y: event.clientY } : null;
  if (visible.value) content.value?.focusFirst();
  showOverlay();
}
function toggle(event?: Event): void {
  if (visible.value) hide();
  else show(event);
}
function dismiss(): void {
  anchor.value?.focus();
  hide();
}
function onKeydown(event: KeyboardEvent): void {
  if (event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey)) show(event);
}
const triggerAttrs = computed<Record<string, unknown>>(() => ({
  "aria-haspopup": "menu", "aria-expanded": visible.value,
  "aria-controls": visible.value ? listId : undefined, "aria-disabled": props.disabled || undefined,
  onContextmenu: show, onKeydown
}));
defineExpose({ show, hide, toggle } satisfies WlMenuExpose);
</script>

<template>
  <slot
    name="trigger"
    :attrs="mergeWlAttrs(section('root'), attrs, triggerAttrs)"
    :visible="visible"
    :show="show"
    :hide="hide"
    :toggle="toggle"
  >
    <div
      ref="root"
      v-bind="mergeWlAttrs(section('root'), attrs, triggerAttrs)"
      class="wl-context-menu"
      data-wl="context-menu"
      :tabindex="disabled ? -1 : 0"
    >
      <slot></slot>
    </div>
  </slot>
  <Teleport to="body">
    <Transition
      name="wl-pop-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
    >
      <div
        v-if="visible"
        ref="panel"
        v-bind="menuSection('root')"
        class="wl-menu wl-context-menu__panel"
        :style="style"
        data-wl-part="panel"
      >
        <MenuPanel
          :id="listId"
          ref="content"
          :items="items"
          :aria-label="ariaLabel ?? locale.options"
          :aria-labelledby="ariaLabelledby"
          :motion="motion"
          :pt="menuPt"
          @check="emit('check', $event)"
          @dismiss="dismiss"
        />
      </div>
    </Transition>
  </Teleport>
</template>

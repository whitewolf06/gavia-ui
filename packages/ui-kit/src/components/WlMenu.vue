<script setup lang="ts" generic="Item extends WlMenuItemBase = WlMenuItem">
/** WlMenu public component contract.
 * @since 0.1.0
 * @slot trigger - Custom trigger content.
 */
import { computed, ref, useAttrs } from "vue";
import type { WlMenuCheckEvent, WlMenuExpose, WlMenuItem, WlMenuItemBase, WlMenuTriggerSlotProps } from "../navigation-types";
import type { WlPopoverAlign, WlPopoverPlacement } from "../overlay-types";
import type { WlPt } from "../pt-types";
import type { MenuDismissReason, MenuPanelExpose } from "../utils/menu";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";
import MenuPanel from "./internal/MenuPanel.vue";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /**
   * WlMenuItem[]: { key?, label?, icon?, shortcut?, danger?, disabled?, separator?, header?, command? }.
   * @default []
   */
  items?: readonly (Item & WlMenuItem<NoInfer<Item>>)[];
  /**
   * Popup menu; opened through toggle/show.
   * @default false
   */
  popup?: boolean;
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
  /** Accessible menu name. */
  ariaLabel?: string;
  /** ID of the element labelling the menu. */
  ariaLabelledby?: string;
  /** Popup menu animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"menu">;
}>(), { items: () => [], popup: false, placement: "auto", align: "start", motion: undefined });
const emit = defineEmits<{
  /** Popup menu opened. */
  open: [];
  /** Popup menu closed. */
  close: [];
  /** Emitted when a menu checkbox or radio item changes its checked state. */
  check: [event: WlMenuCheckEvent<Item>]; }>();
defineSlots<{
  /** Custom trigger; bind its supplied attributes and use the provided open/close actions. */
  trigger?(props: WlMenuTriggerSlotProps): unknown; }>();
const attrs = useAttrs();
const section = useWlPt("menu", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const generatedId = `wl-menu-list-${useWlId()}`;
const listId = computed(() => String(section("list").id ?? generatedId));
const content = ref<MenuPanelExpose | null>(null);
let last = false;
const { visible, anchor, panel, style, show: showOverlay, hide: hideOverlay } = useAnchoredOverlay({
  placement: () => props.placement, align: () => props.align,
  onOpen: () => {
    emit("open");
    if (last) content.value?.focusLast();
    else content.value?.focusFirst();
  },
  onClose: () => emit("close")
});
function hide(event?: Event): void {
  content.value?.closeChildren();
  hideOverlay(event);
}
function show(event?: Event): void {
  last = event instanceof KeyboardEvent && event.key === "ArrowUp";
  const target = event?.currentTarget ?? event?.target;
  if (target instanceof HTMLElement) target.focus();
  showOverlay(event);
}
function toggle(event?: Event): void {
  if (visible.value) hide();
  else show(event);
}
function dismiss(reason: MenuDismissReason): void {
  const hadChildren = content.value?.closeChildren() ?? false;
  if (props.popup) {
    anchor.value?.focus();
    hide();
  } else if (hadChildren || reason === "tab") content.value?.focusActive();
}
function onTriggerKeydown(event: KeyboardEvent): void {
  if (!["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) return;
  event.preventDefault();
  show(event);
}
const triggerAttrs = computed<Record<string, unknown>>(() => ({
  "aria-haspopup": "menu", "aria-expanded": visible.value,
  "aria-controls": visible.value ? listId.value : undefined,
  onClick: toggle, onKeydown: onTriggerKeydown
}));
defineExpose({ toggle, show, hide } satisfies WlMenuExpose);
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
  <Teleport to="body" :disabled="!popup">
    <Transition
      name="wl-pop-motion"
      :css="popup && motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
    >
      <div
        v-if="!popup || visible"
        ref="panel"
        v-bind="mergeWlAttrs(section('root'), attrs)"
        class="wl-menu"
        :style="popup ? style : undefined"
        data-wl="menu"
      >
        <MenuPanel
          :id="listId"
          ref="content"
          :items="items"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby"
          :motion="motion"
          :pt="pt"
          @check="emit('check', $event)"
          @dismiss="dismiss"
        />
      </div>
    </Transition>
  </Teleport>
</template>

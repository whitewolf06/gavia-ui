<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { useWlId } from "../utils/useWlId";
import { computed, ref, useAttrs } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import type { WlDrawerPosition } from "../types";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });
defineSlots<{ default?(props: {}): unknown; header?(props: {}): unknown; footer?(props: {}): unknown }>();
const props = withDefaults(defineProps<{
  header?: string;
  visibleModifiers?: WlNoModelModifiers;
  position?: WlDrawerPosition;
  modal?: boolean;
  dismissable?: boolean;
  closeOnEscape?: boolean;
  blockScroll?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  motion?: boolean;
  pt?: WlPt<"drawer">;
}>(), {
  position: "right", modal: true, dismissable: true, closeOnEscape: true, blockScroll: true,
  motion: undefined
});
const emit = defineEmits<{ open: []; close: [] }>();
const visible = defineModel<boolean, never>("visible", { default: false });
const drawer = ref<HTMLElement | null>(null);
const titleId = useWlId();
const attrs = useAttrs();
const section = useWlPt("drawer", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
useOverlayLifecycle({
  visible, container: drawer,
  closeOnEscape: () => props.closeOnEscape,
  trapFocus: () => props.modal,
  lockScroll: () => props.modal && props.blockScroll,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
function onMask(event: MouseEvent): void {
  if (event.target === event.currentTarget && props.dismissable) visible.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition name="wl-drawer-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" v-bind="section('mask')" class="wl-drawer-mask"
      :class="{ 'wl-mask': modal, 'wl-drawer-host': !modal }" @mousedown="onMask">
      <aside ref="drawer" v-bind="mergeWlAttrs(section('root'), attrs)" class="wl-drawer" :class="`wl-drawer--${position}`"
        role="dialog" :aria-modal="modal || undefined" :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby ?? (!ariaLabel && header ? titleId : undefined)"
        tabindex="-1" data-wl="drawer">
        <header v-if="header || $slots.header" v-bind="section('header')" class="wl-drawer__header">
          <slot name="header">
            <span v-bind="section('title')" :id="titleId" class="wl-drawer__title">{{ header }}</span>
          </slot>
          <button v-bind="section('pcCloseButton.root')" type="button" class="wl-overlay-close"
            aria-label="Закрыть" @click="visible = false"><WlIcon v-bind="section('pcCloseButton.icon')" name="x" :size="14" /></button>
        </header>
        <div v-bind="section('content')" class="wl-drawer__content"><slot /></div>
        <footer v-if="$slots.footer" v-bind="section('footer')" class="wl-drawer__footer"><slot name="footer" /></footer>
      </aside>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlNoModelModifiers } from "../model-types";
import { useWlId } from "../utils/useWlId";
import { computed, ref, useAttrs } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt, useWlLocale } from "../config";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";
const locale = useWlLocale();

defineOptions({ inheritAttrs: false });
defineSlots<{ default?(props: {}): unknown; header?(props: {}): unknown; footer?(props: {}): unknown }>();
const props = withDefaults(defineProps<{
  header?: string;
  visibleModifiers?: WlNoModelModifiers;
  modal?: boolean;
  closable?: boolean;
  dismissable?: boolean;
  closeOnEscape?: boolean;
  blockScroll?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  width?: string;
  motion?: boolean;
  pt?: WlPt<"dialog">;
}>(), {
  modal: true, closable: true, dismissable: false, closeOnEscape: true, blockScroll: true,
  motion: undefined
});
const emit = defineEmits<{ open: []; close: []; afterLeave: [] }>();
const visible = defineModel<boolean, never>("visible", { default: false });
const dialog = ref<HTMLElement | null>(null);
const titleId = useWlId();
const attrs = useAttrs();
const section = useWlPt("dialog", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
useOverlayLifecycle({
  visible, container: dialog,
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
    <Transition name="wl-dialog-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering" @after-leave="emit('afterLeave')">
    <div v-if="visible" v-bind="section('mask')" class="wl-dialog-mask"
      :class="{ 'wl-mask': modal, 'wl-dialog-host': !modal }" @mousedown="onMask">
      <section ref="dialog" data-wl="dialog" v-bind="mergeWlAttrs(section('root'), attrs)" class="wl-dialog" role="dialog"
        :aria-modal="modal || undefined" :aria-label="ariaLabel"
        :aria-labelledby="ariaLabelledby ?? (!ariaLabel && header ? titleId : undefined)"
        :style="{ width }" tabindex="-1">
        <header v-if="header || $slots.header || closable" v-bind="section('header')" class="wl-dialog__header">
          <slot name="header">
            <span v-if="header" v-bind="section('title')" :id="titleId" class="wl-dialog__title">{{ header }}</span>
          </slot>
          <div v-if="closable" v-bind="section('headerActions')" class="wl-dialog__actions">
            <button v-bind="section('pcCloseButton.root')" type="button" class="wl-overlay-close" :aria-label="locale.close"
              @click="visible = false"><WlIcon v-bind="section('pcCloseButton.icon')" name="x" :size="14" /></button>
          </div>
        </header>
        <div v-bind="section('content')" class="wl-dialog__content"><slot /></div>
        <footer v-if="$slots.footer" v-bind="section('footer')" class="wl-dialog__footer"><slot name="footer" /></footer>
      </section>
    </div>
    </Transition>
  </Teleport>
</template>

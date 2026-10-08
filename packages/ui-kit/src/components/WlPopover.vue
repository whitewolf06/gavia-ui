<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlPopoverExpose } from "../overlay-types";
import { computed, useAttrs } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";

defineOptions({ inheritAttrs: false });
defineSlots<{ default?(props: {}): unknown }>();
const props = withDefaults(defineProps<{
  dismissable?: boolean;
  closeOnEscape?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  motion?: boolean;
  pt?: WlPt<"popover">;
}>(), { dismissable: true, closeOnEscape: true, motion: undefined });
const emit = defineEmits<{ open: []; close: [] }>();
const attrs = useAttrs();
const section = useWlPt("popover", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const { visible, panel, style, toggle, show, hide } = useAnchoredOverlay({
  dismissable: () => props.dismissable,
  closeOnEscape: () => props.closeOnEscape,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
defineExpose({ toggle, show, hide } satisfies WlPopoverExpose);
</script>

<template>
  <Teleport to="body">
    <Transition name="wl-pop-motion" :css="motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="visible" ref="panel" v-bind="mergeWlAttrs(section('root'), attrs)"
      class="wl-popover" :style="style" role="dialog"
      :aria-label="ariaLabel" :aria-labelledby="ariaLabelledby" data-wl="popover">
      <div v-bind="section('content')" class="wl-popover__content"><slot /></div>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";

const props = withDefaults(defineProps<{
  dismissable?: boolean;
  closeOnEscape?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  pt?: Record<string, unknown>;
}>(), { dismissable: true, closeOnEscape: true });
const emit = defineEmits<{ open: []; close: [] }>();
const section = useWlPt("popover", computed(() => props.pt));
const { visible, panel, style, toggle, show, hide } = useAnchoredOverlay({
  dismissable: () => props.dismissable,
  closeOnEscape: () => props.closeOnEscape,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
defineExpose({ toggle, show, hide });
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" ref="panel" v-bind="section('root')"
      class="wl-popover" :style="style" role="dialog"
      :aria-label="ariaLabel" :aria-labelledby="ariaLabelledby" data-wl="popover">
      <div v-bind="section('content')" class="wl-popover__content"><slot /></div>
    </div>
  </Teleport>
</template>

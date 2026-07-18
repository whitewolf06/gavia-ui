<script setup lang="ts">
import { computed } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlAlertVariant, WlIconName } from "../types";

const props = withDefaults(
  defineProps<{
    variant?: WlAlertVariant;
    title?: string;
    closable?: boolean;
    closeLabel?: string;
  }>(),
  {
    variant: "info",
    closable: false,
    closeLabel: "Закрыть"
  }
);

const emit = defineEmits<{
  (e: "close", event: MouseEvent): void;
}>();

const ICONS: Record<WlAlertVariant, WlIconName> = {
  info: "info",
  ok: "check",
  warn: "warn",
  err: "x"
};

const icon = computed(() => ICONS[props.variant]);
</script>

<template>
  <div class="wl-alert" :class="`wl-alert--${variant}`" role="alert" data-wl="alert" :data-variant="variant">
    <WlIcon :name="icon" :size="16" class="wl-alert__icon" />
    <div class="wl-alert__body">
      <div v-if="title" class="wl-alert__title">{{ title }}</div>
      <div class="wl-alert__text"><slot /></div>
    </div>
    <div v-if="$slots.action" class="wl-alert__action"><slot name="action" /></div>
    <button
      v-if="closable"
      type="button"
      class="wl-alert__close"
      :aria-label="closeLabel"
      @click="emit('close', $event)"
    >
      <WlIcon name="x" :size="13" />
    </button>
  </div>
</template>

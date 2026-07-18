<script setup lang="ts">
import { computed } from "vue";
import Button from "primevue/button";
import WlIcon from "./WlIcon.vue";
import type { WlIconButtonVariant, WlIconName } from "../types";

const props = withDefaults(
  defineProps<{
    variant?: WlIconButtonVariant;
    size?: "md" | "sm";
    icon?: WlIconName;
    active?: boolean;
    disabled?: boolean;
    count?: number;
    dot?: boolean;
    ariaLabel?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    variant: "ghost",
    size: "md",
    active: false,
    disabled: false,
    dot: false
  }
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const rootClass = computed(() => [
  "wl-iconbtn",
  `wl-iconbtn--${props.variant}`,
  props.size === "sm" && "wl-iconbtn--sm",
  props.active && "is-active",
  props.disabled && "is-disabled"
]);

function onClick(event: MouseEvent): void {
  if (props.disabled) return;
  emit("click", event);
}
</script>

<template>
  <Button
    :class="rootClass"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :pt="pt"
    data-wl="icon-button"
    :data-variant="variant"
    :data-size="size"
    @click="onClick"
  >
    <slot>
      <WlIcon v-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
    </slot>
    <span v-if="count !== undefined && count > 0" class="wl-iconbtn__count">{{ count }}</span>
    <span v-else-if="dot" class="wl-iconbtn__dot" aria-hidden="true" />
  </Button>
</template>

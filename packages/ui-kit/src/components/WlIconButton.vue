<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import type { WlIconButtonVariant } from "../types";
import type { WlIconInput } from "../iconNames";

const props = withDefaults(
  defineProps<{
    variant?: WlIconButtonVariant;
    size?: "md" | "sm";
    icon?: WlIconInput;
    active?: boolean;
    disabled?: boolean;
    count?: number;
    dot?: boolean;
    ariaLabel?: string;
    pt?: WlPt<"button">;
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
const section = useWlPt("button", computed(() => props.pt));

function onClick(event: MouseEvent): void {
  if (props.disabled) return;
  emit("click", event);
}
</script>

<template>
  <button
    v-bind="section('root')"
    type="button"
    :class="rootClass"
    :disabled="disabled"
    :aria-label="ariaLabel"
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
  </button>
</template>

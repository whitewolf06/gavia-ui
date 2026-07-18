<script setup lang="ts">
import { computed } from "vue";
import Tag from "primevue/tag";
import WlIcon from "./WlIcon.vue";
import type { WlTagVariant } from "../types";

const props = withDefaults(
  defineProps<{
    variant?: WlTagVariant;
    removable?: boolean;
    removeLabel?: string;
    pt?: Record<string, unknown>;
  }>(),
  {
    variant: "gray",
    removable: false,
    removeLabel: "Удалить"
  }
);

const emit = defineEmits<{
  (e: "remove", event: MouseEvent): void;
}>();

const rootClass = computed(() => ["wl-tag", `wl-tag--${props.variant}`]);
</script>

<template>
  <Tag :class="rootClass" :pt="pt" data-wl="tag" :data-variant="variant">
    <span class="wl-tag__text"><slot /></span>
    <button
      v-if="removable"
      type="button"
      class="wl-tag__remove"
      :aria-label="removeLabel"
      @click.stop="emit('remove', $event)"
    >
      <WlIcon name="x" :size="10" />
    </button>
  </Tag>
</template>

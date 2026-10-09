<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt, useWlLocaleText } from "../config";
import WlIcon from "./WlIcon.vue";
import type { WlTagVariant } from "../types";
const localeText = useWlLocaleText();

const props = withDefaults(
  defineProps<{
    variant?: WlTagVariant;
    removable?: boolean;
    removeLabel?: string;
    pt?: WlPt<"tag">;
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
const section = useWlPt("tag", computed(() => props.pt));
</script>

<template>
  <span v-bind="section('root')" :class="rootClass" data-wl="tag" :data-variant="variant">
    <span v-bind="section('label')" class="wl-tag__text"><slot /></span>
    <button
      v-if="removable"
      type="button"
      class="wl-tag__remove"
      :aria-label="localeText('removeLabel', removeLabel, 'remove')"
      @click.stop="emit('remove', $event)"
    >
      <WlIcon name="x" :size="10" />
    </button>
  </span>
</template>

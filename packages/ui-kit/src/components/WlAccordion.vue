<script setup lang="ts">
import { computed, ref } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlAccordionItem } from "../types";

const props = withDefaults(
  defineProps<{
    items?: WlAccordionItem[];
    single?: boolean;
    openKeys?: string[];
  }>(),
  {
    items: () => [],
    single: false,
    openKeys: undefined
  }
);

const emit = defineEmits<{
  (e: "update:openKeys", value: string[]): void;
}>();

/* Uncontrolled fallback when v-model:openKeys is not used. */
const inner = ref<string[]>([]);
const isControlled = computed(() => props.openKeys !== undefined);
const openSet = computed(() => new Set(isControlled.value ? (props.openKeys ?? []) : inner.value));

function toggle(item: WlAccordionItem): void {
  if (item.disabled) return;
  const next = openSet.value.has(item.key)
    ? [...openSet.value].filter((key) => key !== item.key)
    : props.single
      ? [item.key]
      : [...openSet.value, item.key];
  if (!isControlled.value) inner.value = next;
  emit("update:openKeys", next);
}
</script>

<template>
  <div class="wl-acc" data-wl="accordion">
    <details
      v-for="item in items"
      :key="item.key"
      class="wl-acc__item"
      :open="openSet.has(item.key)"
      :data-key="item.key"
    >
      <summary
        class="wl-acc__summary"
        :class="{ 'is-disabled': item.disabled }"
        :aria-disabled="item.disabled || undefined"
        @click.prevent="toggle(item)"
      >
        <span class="wl-acc__title">{{ item.title }}</span>
        <WlIcon name="chevron-down" :size="14" class="wl-acc__chevron" />
      </summary>
      <div class="wl-acc__body">
        <slot name="item" :item="item" :open="openSet.has(item.key)">{{ item.content }}</slot>
      </div>
    </details>
  </div>
</template>

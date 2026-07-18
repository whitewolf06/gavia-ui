<script setup lang="ts">
import { computed } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlIconName } from "../types";

const props = withDefaults(
  defineProps<{
    label?: string;
    icon?: WlIconName;
    badge?: number | string;
    active?: boolean;
    disabled?: boolean;
    href?: string;
  }>(),
  {
    active: false,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
}>();

const tag = computed(() => (props.href ? "a" : "button"));

function onClick(event: MouseEvent): void {
  if (props.disabled) {
    event.preventDefault();
    return;
  }
  emit("click", event);
}
</script>

<template>
  <component
    :is="tag"
    :href="href"
    :type="tag === 'button' ? 'button' : undefined"
    class="wl-nav-item"
    :class="{ 'is-active': active, 'is-disabled': disabled }"
    :disabled="tag === 'button' ? disabled : undefined"
    :aria-current="active ? 'page' : undefined"
    data-wl="nav-item"
    @click="onClick"
  >
    <WlIcon v-if="icon" :name="icon" :size="17" class="wl-nav-item__icon" />
    <span class="wl-nav-item__label"><slot>{{ label }}</slot></span>
    <span v-if="badge !== undefined" class="wl-nav-item__badge">{{ badge }}</span>
  </component>
</template>

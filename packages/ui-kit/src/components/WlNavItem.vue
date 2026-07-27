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
    collapsed?: boolean;
    ariaLabel?: string;
  }>(),
  {
    active: false,
    disabled: false,
    collapsed: false
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
    :aria-label="ariaLabel ?? (collapsed ? label : undefined)"
    :title="collapsed ? label : undefined"
    data-wl="nav-item"
    :data-collapsed="collapsed"
    @click="onClick"
  >
    <WlIcon v-if="icon" :name="icon" :size="17" class="wl-nav-item__icon" />
    <span v-show="!collapsed" class="wl-nav-item__label"><slot>{{ label }}</slot></span>
    <span v-if="badge !== undefined" v-show="!collapsed" class="wl-nav-item__badge">{{ badge }}</span>
  </component>
</template>

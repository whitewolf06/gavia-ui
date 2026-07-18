<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    active?: boolean;
    count?: number;
    disabled?: boolean;
  }>(),
  {
    active: false,
    disabled: false
  }
);

const emit = defineEmits<{
  (e: "click", event: MouseEvent): void;
  (e: "update:active", value: boolean): void;
}>();

function onClick(event: MouseEvent): void {
  if (props.disabled) return;
  emit("click", event);
  emit("update:active", !props.active);
}
</script>

<template>
  <button
    type="button"
    class="wl-chip"
    :class="{ 'is-active': active, 'is-disabled': disabled }"
    :disabled="disabled"
    :aria-pressed="active"
    data-wl="chip"
    @click="onClick"
  >
    <span class="wl-chip__label"><slot /></span>
    <span v-if="count !== undefined" class="wl-chip__count">{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
/** WlEmpty public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon or illustration.
 * @slot default - Custom description.
 * @slot action - Button or another action below the description.
 */
import type { WlIconInput } from "../types";
import WlIcon from "./WlIcon.vue";

withDefaults(
  defineProps<{
    /** Icon (when no icon slot is provided). */
    icon?: WlIconInput;
    /** Title. */
    title?: string;
    /** Description (when no slot is provided). */
    description?: string;
  }>(),
  {}
);
</script>

<template>
  <div class="wl-empty" data-wl="empty">
    <slot name="icon">
      <WlIcon
        v-if="icon"
        :name="icon"
        :size="26"
        class="wl-empty__icon"
      />
    </slot>
    <div v-if="title" class="wl-empty__title">{{ title }}</div>
    <div v-if="description || $slots.default" class="wl-empty__desc">
      <slot>{{ description }}</slot>
    </div>
    <div v-if="$slots.action" class="wl-empty__action">
      <slot name="action"></slot>
    </div>
  </div>
</template>

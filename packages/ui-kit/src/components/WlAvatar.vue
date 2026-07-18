<script setup lang="ts">
import { computed } from "vue";
import Avatar from "primevue/avatar";
import type { WlAvatarPresence, WlAvatarSize } from "../types";

const props = withDefaults(
  defineProps<{
    label?: string;
    image?: string;
    size?: WlAvatarSize;
    presence?: WlAvatarPresence;
    pt?: Record<string, unknown>;
  }>(),
  {
    size: 32
  }
);

const rootClass = computed(() => ["wl-avatar", `wl-avatar--${props.size}`]);
</script>

<template>
  <span class="wl-avatar-wrap" data-wl="avatar" :data-size="size">
    <Avatar :label="label" :image="image" shape="circle" :class="rootClass" :pt="pt">
      <slot />
    </Avatar>
    <span
      v-if="presence"
      class="wl-avatar__presence"
      :class="`wl-avatar__presence--${presence}`"
      aria-hidden="true"
    />
  </span>
</template>

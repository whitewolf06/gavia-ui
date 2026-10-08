<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt } from "../config";
import type { WlAvatarPresence, WlAvatarSize } from "../types";

const props = withDefaults(
  defineProps<{
    label?: string;
    image?: string;
    size?: WlAvatarSize;
    presence?: WlAvatarPresence;
    pt?: WlPt<"avatar">;
  }>(),
  {
    size: 32
  }
);

const rootClass = computed(() => ["wl-avatar", `wl-avatar--${props.size}`]);
const section = useWlPt("avatar", computed(() => props.pt));
</script>

<template>
  <span class="wl-avatar-wrap" data-wl="avatar" :data-size="size">
    <span v-bind="section('root')" :class="rootClass">
      <slot>
        <img v-if="image" v-bind="section('image')" class="wl-avatar__img" :src="image" :alt="label ?? ''" />
        <span v-else v-bind="section('label')">{{ label }}</span>
      </slot>
    </span>
    <span
      v-if="presence"
      class="wl-avatar__presence"
      :class="`wl-avatar__presence--${presence}`"
      aria-hidden="true"
    />
  </span>
</template>

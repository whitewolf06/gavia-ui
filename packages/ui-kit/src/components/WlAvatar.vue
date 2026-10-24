<script setup lang="ts">
/** WlAvatar public component contract.
 * @since 0.1.0
 * @slot default - Custom content instead of label/image.
 */
import { computed, ref, watch } from "vue";
import type { WlPt } from "../pt-types";
import type { WlAvatarPresence, WlAvatarSize } from "../types";
import { useWlLocale, useWlPt } from "../config";
import { getWlInitials } from "../utils/initials";

const props = withDefaults(
  defineProps<{
    /** Explicit fallback text, used instead of initials derived from name. */
    label?: string;
    /** Person's name, used for image alt text and fallback initials. */
    name?: string;
    /** Image URL; a failed image falls back to label or initials. */
    image?: string;
    /** Avatar size in pixels.
     * @default 32
     */
    size?: WlAvatarSize;
    /** Optional presence indicator. */
    presence?: WlAvatarPresence;
    /** Accessible presence text; otherwise the current locale supplies it. */
    presenceLabel?: string;
    /** Avatar outline shape.
     * @default "circle"
     */
    shape?: "circle" | "square";
    /** Attributes for the avatar root, image and fallback label sections. */
    pt?: WlPt<"avatar">;
  }>(),
  {
    size: 32,
    shape: "circle"
  }
);

const rootClass = computed(() => ["wl-avatar", `wl-avatar--${props.size}`]);
const section = useWlPt("avatar", computed(() => props.pt));
const locale = useWlLocale();
const imageFailed = ref(false);
const initials = computed(() => props.label ?? getWlInitials(props.name ?? ""));
const presenceText = computed(() => props.presenceLabel ?? (props.presence === "online"
  ? locale.value.presenceOnline
  : props.presence === "busy" ? locale.value.presenceBusy : locale.value.presenceOffline));
watch(() => props.image, () => {
  imageFailed.value = false;
});
</script>

<template>
  <span class="wl-avatar-wrap" data-wl="avatar" :data-size="size">
    <span v-bind="section('root')" :class="rootClass" :data-shape="shape">
      <slot>
        <img
          v-if="image && !imageFailed"
          v-bind="section('image')"
          class="wl-avatar__img"
          :src="image"
          :alt="name ?? label ?? ''"
          @error="imageFailed = true"
        />
        <span v-else v-bind="section('label')" :aria-label="name">{{ initials }}</span>
      </slot>
    </span>
    <span
      v-if="presence"
      class="wl-avatar__presence"
      :class="`wl-avatar__presence--${presence}`"
      role="img"
      :aria-label="presenceText"
    ></span>
  </span>
</template>

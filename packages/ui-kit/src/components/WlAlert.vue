<script setup lang="ts">
/** WlAlert public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon content.
 * @slot default - Notification text.
 * @slot action - Trailing action (button).
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlIconName, WlTone } from "../types";
import { useWlLocale, useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
const props = withDefaults(
  defineProps<{
    /**
     * Semantic notification color.
     * @default "info"
     */
    tone?: WlTone;
    /** Title. */
    title?: string;
    /**
     * Button that closes the surface.
     * @default false
     */
    closable?: boolean;
    /**
     * Close button aria-label; uses locale.close when omitted or undefined (English: Close).
     * @default undefined
     */
    closeLabel?: string;
    /** Override live announcements; off renders a static message. */
    live?: "assertive" | "polite" | "off";
    /** Attributes for internal DOM sections. */
    pt?: WlPt<"alert">;
  }>(),
  {
    tone: "info",
    closable: false
  }
);

const emit = defineEmits<{
  /** Close button click. */
  (e: "close", event: MouseEvent): void;
}>();

const locale = useWlLocale();
const closeLabel = computed(() => props.closeLabel ?? locale.value.close);
const section = useWlPt("alert", computed(() => props.pt));
const tone = computed(() => props.tone);
const visualVariant = computed(() => ({ neutral: "info", accent: "info", info: "info", success: "ok", warning: "warn", danger: "err" } as const)[tone.value]);

const ICONS: Record<"info" | "ok" | "warn" | "err", WlIconName> = {
  info: "info",
  ok: "check",
  warn: "warn",
  err: "x"
};

const icon = computed(() => ICONS[visualVariant.value]);
const liveRole = computed(() => {
  if (props.live === "off") return undefined;
  if (props.live) return props.live === "assertive" ? "alert" : "status";
  return tone.value === "warning" || tone.value === "danger" ? "alert" : "status";
});
</script>

<template>
  <div
    v-bind="section('root')"
    class="wl-alert"
    :class="`wl-alert--${visualVariant}`"
    :role="liveRole"
    data-wl="alert"
    :data-variant="visualVariant"
    :data-tone="tone"
  >
    <slot name="icon" :tone="tone"><WlIcon
      v-bind="section('icon')"
      :name="icon"
      :size="16"
      class="wl-alert__icon"
    /></slot>
    <div v-bind="section('body')" class="wl-alert__body">
      <div v-if="title" v-bind="section('title')" class="wl-alert__title">{{ title }}</div>
      <div v-bind="section('text')" class="wl-alert__text"><slot></slot></div>
    </div>
    <div v-if="$slots.action" v-bind="section('action')" class="wl-alert__action"><slot name="action"></slot></div>
    <button
      v-if="closable"
      v-bind="section('closeButton')"
      type="button"
      class="wl-alert__close"
      :aria-label="closeLabel"
      @click="emit('close', $event)"
    >
      <WlIcon v-bind="section('closeIcon')" name="x" :size="13" />
    </button>
  </div>
</template>

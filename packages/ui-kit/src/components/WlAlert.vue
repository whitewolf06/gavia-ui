<script setup lang="ts">
/** WlAlert public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon content.
 * @slot default - Notification text.
 * @slot action - Trailing action (button).
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlAlertVariant, WlIconName, WlTone } from "../types";
import { useWlLocaleText, useWlPt } from "../config";
import { useWlTone } from "../utils/tone";
import WlIcon from "./WlIcon.vue";
const props = withDefaults(
  defineProps<{
    /**
     * Notification type.
     * @default "info"
     */
    variant?: WlAlertVariant;
    /** Semantic color role; takes precedence over supported legacy color aliases. */
    tone?: WlTone;
    /** Title. */
    title?: string;
    /**
     * Button that closes the surface.
     * @default false
     */
    closable?: boolean;
    /**
     * Close button aria-label.
     * @default "Закрыть"
     */
    closeLabel?: string;
    /** Override live announcements; off renders a static message. */
    live?: "assertive" | "polite" | "off";
    /** Attributes for internal DOM sections. */
    pt?: WlPt<"alert">;
  }>(),
  {
    variant: "info",
    closable: false,
    closeLabel: "Закрыть"
  }
);

const emit = defineEmits<{
  /** Close button click. */
  (e: "close", event: MouseEvent): void;
}>();

const localeText = useWlLocaleText();
const section = useWlPt("alert", computed(() => props.pt));
const tone = useWlTone({ component: "WlAlert", tone: () => props.tone, variant: () => props.variant,
  aliases: { info: "info", ok: "success", warn: "warning", err: "danger" }, fallback: "info" });
const visualVariant = computed<WlAlertVariant>(() => ({ neutral: "info", accent: "info", info: "info", success: "ok", warning: "warn", danger: "err" } as const)[tone.value]);

const ICONS: Record<WlAlertVariant, WlIconName> = {
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
    :data-variant="variant"
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
      :aria-label="localeText('closeLabel', closeLabel, 'close')"
      @click="emit('close', $event)"
    >
      <WlIcon v-bind="section('closeIcon')" name="x" :size="13" />
    </button>
  </div>
</template>

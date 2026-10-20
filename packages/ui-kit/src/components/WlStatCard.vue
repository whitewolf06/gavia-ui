<script setup lang="ts">
/** WlStatCard public component contract.
 * @since 0.1.0
 * @slot default - Custom content instead of value.
 * @slot delta - Custom delta content.
 * @slot footer - Card footer.
 */
import { computed } from "vue";
import type { WlIconInput, WlStatCardTone } from "../types";
import { useWlLocale } from "../config";
import { formatWlNumber } from "../utils/format";
import WlCard from "./WlCard.vue";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    /** Label icon. */
    icon?: WlIconInput;
    /** Metric label. */
    label?: string;
    /** Value (when no slot is provided). */
    value?: string | number;
    /** Intl.NumberFormat options for the displayed numeric value. */
    numberFormat?: Intl.NumberFormatOptions;
    /** Locale override for numeric display formatting. */
    locale?: string;
    /** Numeric change displayed beside the primary statistic. */
    delta?: string;
    /** Description below the value. */
    description?: string;
    /** Progress from 0 to 100. Displays an indicator when set. */
    progress?: number;
    /**
     * Accent tone.
     * @default "accent"
     */
    tone?: WlStatCardTone;
  }>(),
  {
    tone: "accent"
  }
);
defineSlots<{
  /** Custom content instead of value. */
  default?(props: {}): unknown;
  /** Card footer. */
  footer?(props: {}): unknown;
  /** Custom statistic delta content; receives the displayed delta text. */
  delta?(props: { delta: string | undefined }): unknown; }>();
const appLocale = useWlLocale();
const displayValue = computed(() => typeof props.value === "number"
  ? formatWlNumber(props.locale ?? appLocale.value.localeCode ?? "en", props.value, props.numberFormat)
  : props.value);
const pct = computed(() => {
  const value = props.progress ?? 0;
  return Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
});
</script>

<template>
  <WlCard class="wl-stat-card" data-wl="stat-card" :data-tone="tone">
    <div v-if="icon || label" class="wl-stat-card__label">
      <WlIcon v-if="icon" :name="icon" :size="14" />
      <span>{{ label }}</span>
    </div>
    <div class="wl-stat-card__value"><slot>{{ displayValue }}</slot></div>
    <div v-if="delta !== undefined || $slots.delta" class="wl-stat-card__delta"><slot name="delta" :delta="delta">{{ delta }}</slot></div>
    <div v-if="description" class="wl-stat-card__desc">{{ description }}</div>
    <div
      v-if="progress !== undefined"
      class="wl-stat-card__bar"
      role="progressbar"
      :aria-valuenow="pct"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <i class="wl-stat-card__bar-fill" :style="{ width: `${pct}%` }"></i>
    </div>
    <div v-if="$slots.footer" class="wl-stat-card__footer">
      <slot name="footer"></slot>
    </div>
  </WlCard>
</template>

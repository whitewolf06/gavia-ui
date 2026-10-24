<script setup lang="ts">
/** WlChip public component contract.
 * @since 0.1.0
 * @slot default - Chip text.
 * @slot count - Custom count content.
 * @slot removeIcon - Custom removeIcon content.
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { useWlLocale, useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
const props = withDefaults(defineProps<{
  /** Trailing count. */
  count?: number;
  /**
   * Disables the chip.
   * @default false
   */
  disabled?: boolean;
  /**
   * Show a removal action for this chip.
   * @default false
   */
  removable?: boolean;
  /** Accessible name of the removal action. */
  removeLabel?: string;
  /**
   * Size within the component family's documented scale.
   * @default "md"
   */
  size?: WlSizeSm;
  /**
   * Spacing density for this component family.
   * @default "default"
   */
  density?: WlDensity;
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"chip">;
}>(), { disabled: false, removable: false, size: "md", density: "default" });
const emit = defineEmits<{
  /** Click (not emitted when disabled). */
  click: [event: MouseEvent];
  /** Emitted when the removal action is activated. */
  remove: [event: MouseEvent]; }>();
/** Whether the chip is active.
 * Paired with update:active.
 * @default false
 */
const active = defineModel<boolean, never>("active", { default: false });
defineSlots<{
  /** Chip text. */
  default?(props: Record<never, never>): unknown;
  /** Custom chip count; receives the numeric count. */
  count?(props: { count: number }): unknown;
  /** Custom graphic inside the named removal action. */
  removeIcon?(props: Record<never, never>): unknown;
}>();
const section = useWlPt("chip", computed(() => props.pt));
const locale = useWlLocale();
function onClick(event: MouseEvent): void {
  if (props.disabled) return;
  emit("click", event);
  if (!event.defaultPrevented) active.value = !active.value;
}
function remove(event: MouseEvent): void {
  if (!props.disabled) emit("remove", event);
}
</script>

<template>
  <component
    :is="removable ? 'span' : 'button'"
    v-bind="section('root')"
    :type="removable ? undefined : 'button'"
    class="wl-chip"
    :class="{ 'is-active': active, 'is-disabled': disabled, 'wl-chip--removable': removable }"
    :disabled="removable ? undefined : disabled"
    :aria-pressed="removable ? undefined : active"
    :aria-disabled="removable && disabled || undefined"
    data-wl="chip"
    :data-size="size"
    :data-density="density"
    @click="removable ? undefined : onClick($event)"
  >
    <component
      :is="removable ? 'button' : 'span'"
      v-bind="section('action')"
      class="wl-chip__action"
      :type="removable ? 'button' : undefined"
      :disabled="removable ? disabled : undefined"
      :aria-pressed="removable ? active : undefined"
      @click="removable ? onClick($event) : undefined"
    >
      <span v-bind="section('label')" class="wl-chip__label"><slot></slot></span>
      <span
        v-if="count !== undefined"
        v-bind="section('count')"
        class="wl-chip__count"
      ><slot name="count" :count="count">{{ count }}</slot></span>
    </component>
    <button
      v-if="removable"
      v-bind="section('removeButton')"
      type="button"
      class="wl-chip__remove"
      :disabled="disabled"
      :aria-label="removeLabel ?? locale.remove"
      @click.stop="remove"
    >
      <slot name="removeIcon"><WlIcon v-bind="section('removeIcon')" name="x" :size="12" /></slot>
    </button>
  </component>
</template>

<script setup lang="ts">
/** WlNavItem public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon content.
 * @slot default - Custom text instead of label.
 * @slot badge - Custom badge content.
 */
import { computed } from "vue";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlIconInput, WlSizeSm } from "../types";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import WlLink from "./WlLink.vue";

const props = withDefaults(
  defineProps<{
    /** Item text (when no slot is provided). */
    label?: string;
    /** Leading icon. */
    icon?: WlIconInput;
    /** Trailing badge: number | string. */
    badge?: number | string;
    /**
     * Current item (aria-current=page).
     * @default false
     */
    active?: boolean;
    /**
     * Disables the item.
     * @default false
     */
    disabled?: boolean;
    /** Uses <a> with href, otherwise <button>. */
    href?: string;
    /** Application router destination handled by the configured link adapter. */
    to?: unknown;
    /**
     * Hides the label and badge while preserving the item's accessible name.
     * @default false
     */
    collapsed?: boolean;
    /** Overrides the item's accessible name. */
    ariaLabel?: string;
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
    pt?: WlPt<"navitem">;
  }>(),
  {
    active: false,
    disabled: false,
    collapsed: false,
    size: "md", density: "default"
  }
);

const emit = defineEmits<{
  /** Click (not emitted when disabled). */
  (e: "click", event: MouseEvent): void;
}>();

defineSlots<{
  /** Custom text instead of label. */
  default?(props: Record<never, never>): unknown;
  /** Custom icon content. */
  icon?(props: { icon: WlIconInput | undefined }): unknown;
  /** Custom navigation badge content. */
  badge?(props: { badge: string | number | undefined; collapsed: boolean }): unknown;
}>();
const isLink = computed(() => props.href !== undefined || props.to !== undefined);
const tag = computed(() => isLink.value ? WlLink : "button");
const section = useWlPt("navitem", computed(() => props.pt));
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
    v-bind="section('root')"
    :href="isLink ? href : undefined"
    :to="isLink ? to : undefined"
    :type="!isLink ? 'button' : undefined"
    class="wl-nav-item"
    :class="{ 'is-active': active, 'is-disabled': disabled }"
    :disabled="disabled"
    :aria-disabled="isLink && disabled ? true : undefined"
    :tabindex="isLink && disabled ? -1 : undefined"
    :aria-current="active ? 'page' : undefined"
    :aria-label="ariaLabel ?? (collapsed ? label : undefined)"
    :title="collapsed ? label : undefined"
    data-wl="nav-item"
    :data-collapsed="collapsed"
    :data-size="size"
    :data-density="density"
    @click="onClick"
  >
    <span
      v-if="icon || $slots.icon"
      v-bind="section('icon')"
      class="wl-nav-item__icon"
      aria-hidden="true"
    ><slot name="icon" :icon="icon"><WlIcon v-if="icon" :name="icon" :size="17" /></slot></span>
    <span v-show="!collapsed" v-bind="section('label')" class="wl-nav-item__label"><slot>{{ label }}</slot></span>
    <span
      v-if="badge !== undefined || $slots.badge"
      v-show="!collapsed"
      v-bind="section('badge')"
      class="wl-nav-item__badge"
    ><slot name="badge" :badge="badge" :collapsed="collapsed">{{ badge }}</slot></span>
  </component>
</template>

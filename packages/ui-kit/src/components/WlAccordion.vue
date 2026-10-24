<script setup lang="ts" generic="Item extends WlAccordionItem = WlAccordionItem">
/** WlAccordion public component contract.
 * @since 0.1.0
 * @slot icon - Custom icon content.
 * @slot header - Custom heading content.
 * @slot item - Item body instead of item.content; scope: { item, open }.
 */
import { computed } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlAccordionItem, WlAccordionSlots } from "../navigation-types";
import type { WlPt } from "../pt-types";
import { useWlControllable } from "../composables/useWlControllable";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(
  defineProps<{
    /**
     * WlAccordionItem[]: { key, title, content?, disabled? }.
     * @default []
     */
    items?: readonly Item[];
    /**
     * Only one item is open.
     * @default false
     */
    single?: boolean;
    /** Open section keys; controlled through v-model:openKeys. */
    openKeys?: readonly NoInfer<Item["key"]>[];
    /** Initially expanded item keys for an uncontrolled accordion. */
    defaultOpenKeys?: readonly NoInfer<Item["key"]>[];
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"accordion">;
    /** Modifier contract for expanded keys; built-in modifiers are unsupported. */
    openKeysModifiers?: WlNoModelModifiers;
  }>(),
  {
    items: () => [],
    single: false,
    openKeys: undefined
  }
);

const emit = defineEmits<{
  /** New list of open keys. */
  (e: "update:openKeys", value: Item["key"][]): void;
}>();

/* Uncontrolled fallback when v-model:openKeys is not used. */
defineSlots<WlAccordionSlots<Item>>();
const openKeys = useWlControllable<readonly Item["key"][]>({ value: () => props.openKeys,
  defaultValue: [...(props.defaultOpenKeys ?? [])], onChange: (keys) => emit("update:openKeys", [...keys]) });
const openSet = computed(() => new Set(openKeys.value));
const section = useWlPt("accordion", computed(() => props.pt));

function toggle(item: Item): void {
  if (item.disabled) return;
  const next = openSet.value.has(item.key)
    ? [...openSet.value].filter((key) => key !== item.key)
    : props.single
      ? [item.key]
      : [...openSet.value, item.key];
  openKeys.value = next;
}
</script>

<template>
  <div v-bind="section('root')" class="wl-acc" data-wl="accordion">
    <details
      v-for="item in items"
      :key="item.key"
      v-bind="section('item')"
      class="wl-acc__item"
      :open="openSet.has(item.key)"
      :data-key="item.key"
    >
      <!-- Native summary already turns Enter and Space into this click action. -->
      <!-- eslint-disable-next-line vuejs-accessibility/click-events-have-key-events, vuejs-accessibility/no-static-element-interactions -->
      <summary
        v-bind="section('header')"
        class="wl-acc__summary"
        :class="{ 'is-disabled': item.disabled }"
        :aria-disabled="item.disabled || undefined"
        @click.prevent="toggle(item)"
      >
        <slot name="icon" :item="item" :open="openSet.has(item.key)"><WlIcon v-if="item.icon" :name="item.icon" :size="16" /></slot>
        <span class="wl-acc__title"><slot name="header" :item="item" :open="openSet.has(item.key)">{{ item.title }}</slot></span>
        <WlIcon name="chevron-down" :size="14" class="wl-acc__chevron" />
      </summary>
      <div v-bind="section('content')" class="wl-acc__body">
        <slot name="item" :item="item" :open="openSet.has(item.key)">{{ item.content }}</slot>
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import type { WlTabItem } from "../types";

const props = withDefaults(
  defineProps<{
    items?: WlTabItem[];
    pt?: Record<string, unknown>;
  }>(),
  {
    items: () => []
  }
);

const model = defineModel<string>({ default: "" });

watchEffect(() => {
  if (!model.value && props.items.length > 0) {
    model.value = props.items[0]!.key;
  }
});

function onUpdate(value: string | number): void {
  model.value = String(value);
}

const section = useWlPt("tablist", computed(() => props.pt));
const panelsSection = useWlPt("tabpanels", computed(() => props.pt?.tabpanels as Record<string, unknown> | undefined));
const panelSection = useWlPt("tabpanel", computed(() => props.pt?.tabpanel as Record<string, unknown> | undefined));
const buttons = ref<HTMLButtonElement[]>([]);
function onKeydown(event: KeyboardEvent, index: number): void {
  const count = props.items.length;
  if (!count) return;
  const next = event.key === "ArrowRight" ? (index + 1) % count
    : event.key === "ArrowLeft" ? (index + count - 1) % count
    : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : -1;
  if (next < 0) return;
  event.preventDefault();
  model.value = props.items[next]!.key;
  buttons.value[next]?.focus();
}
</script>

<template>
  <div class="wl-tabs" data-wl="tabs">
    <div v-bind="section('content')" class="wl-tabs__content">
      <div v-bind="section('tabList')" class="wl-tabs__list" role="tablist">
      <button
        v-for="(item, index) in items"
        :key="item.key"
        :ref="(element) => { if (element) buttons[index] = element as HTMLButtonElement; }"
        type="button"
        role="tab"
        :aria-selected="model === item.key"
        :tabindex="model === item.key ? 0 : -1"
        :id="`wl-tab-${item.key}`"
        class="wl-tab"
        :class="{ 'is-active': model === item.key }"
        @click="onUpdate(item.key)"
        @keydown="onKeydown($event, index)"
      >
        <WlIcon v-if="item.icon" :name="item.icon" :size="16" />
        <span class="wl-tab__label">{{ item.label }}</span>
        <span v-if="item.count !== undefined" class="wl-tab__count">{{ item.count }}</span>
      </button>
      <span v-bind="section('activeBar')" class="wl-tabs__active-bar" aria-hidden="true" />
      </div>
    </div>
    <div v-bind="panelsSection('root')" class="wl-tabs__panels">
      <template v-for="item in items" :key="item.key">
        <div v-if="model === item.key" v-bind="panelSection('root')" class="wl-tabs__panel" role="tabpanel" :aria-labelledby="`wl-tab-${item.key}`">
          <slot name="panel" :item="item" />
        </div>
      </template>
    </div>
  </div>
</template>

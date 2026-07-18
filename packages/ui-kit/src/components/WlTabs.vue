<script setup lang="ts">
import { watchEffect } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
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

const listPt = {
  content: { class: "wl-tabs__content" },
  tabList: { class: "wl-tabs__list" },
  activeBar: { class: "wl-tabs__active-bar" }
};
</script>

<template>
  <Tabs :value="model" @update:value="onUpdate" class="wl-tabs" :pt="pt" data-wl="tabs">
    <TabList :pt="listPt">
      <Tab
        v-for="item in items"
        :key="item.key"
        :value="item.key"
        class="wl-tab"
        :class="{ 'is-active': model === item.key }"
      >
        <WlIcon v-if="item.icon" :name="item.icon" :size="16" />
        <span class="wl-tab__label">{{ item.label }}</span>
        <span v-if="item.count !== undefined" class="wl-tab__count">{{ item.count }}</span>
      </Tab>
    </TabList>
    <TabPanels class="wl-tabs__panels">
      <TabPanel
        v-for="item in items"
        :key="item.key"
        :value="item.key"
        class="wl-tabs__panel"
      >
        <slot name="panel" :item="item" />
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

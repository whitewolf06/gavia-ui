<script setup lang="ts">
import { computed } from "vue";
import Breadcrumb from "primevue/breadcrumb";
import WlIcon from "./WlIcon.vue";
import type { WlBreadcrumbItem, WlIconName } from "../types";

const props = withDefaults(
  defineProps<{
    items?: WlBreadcrumbItem[];
    pt?: Record<string, unknown>;
  }>(),
  {
    items: () => []
  }
);

interface BreadcrumbModelItem {
  label: string;
  url?: string;
  icon?: string;
  current?: boolean;
}

const model = computed<BreadcrumbModelItem[]>(() =>
  props.items.map((item, index) => ({
    label: item.label,
    url: index === props.items.length - 1 ? undefined : (item.href ?? item.to),
    icon: item.icon,
    current: index === props.items.length - 1
  }))
);
</script>

<template>
  <Breadcrumb :model="model" :pt="pt" class="wl-breadcrumbs" data-wl="breadcrumbs">
    <template #item="{ item, props: itemProps }">
      <span v-if="item.current" class="wl-breadcrumbs__link is-current" aria-current="page">
        <WlIcon v-if="item.icon" :name="(item.icon as WlIconName)" :size="14" class="wl-breadcrumbs__icon" />
        <span class="wl-breadcrumbs__label">{{ item.label }}</span>
      </span>
      <a v-else v-bind="itemProps.action" :href="item.url" class="wl-breadcrumbs__link">
        <WlIcon v-if="item.icon" :name="(item.icon as WlIconName)" :size="14" class="wl-breadcrumbs__icon" />
        <span class="wl-breadcrumbs__label">{{ item.label }}</span>
      </a>
    </template>
    <template #separator>
      <span class="wl-breadcrumbs__sep" aria-hidden="true">/</span>
    </template>
  </Breadcrumb>
</template>

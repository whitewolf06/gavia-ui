<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed } from "vue";
import { useWlPt } from "../config";
import WlIcon from "./WlIcon.vue";
import type { WlBreadcrumbItem } from "../types";

const props = withDefaults(
  defineProps<{
    items?: readonly WlBreadcrumbItem[];
    pt?: WlPt<"breadcrumb">;
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
const section = useWlPt("breadcrumb", computed(() => props.pt));
</script>

<template>
  <nav v-bind="section('root')" class="wl-breadcrumbs" aria-label="Хлебные крошки" data-wl="breadcrumbs">
    <ol v-bind="section('list')" class="wl-breadcrumbs__list">
      <li v-for="(item, index) in model" :key="index" v-bind="section('item')" class="wl-breadcrumbs__item">
        <span v-if="item.current" class="wl-breadcrumbs__link is-current" aria-current="page">
          <WlIcon v-if="item.icon" :name="item.icon" :size="14" class="wl-breadcrumbs__icon" />
          <span class="wl-breadcrumbs__label">{{ item.label }}</span>
        </span>
        <a v-else :href="item.url" class="wl-breadcrumbs__link">
          <WlIcon v-if="item.icon" :name="item.icon" :size="14" class="wl-breadcrumbs__icon" />
          <span class="wl-breadcrumbs__label">{{ item.label }}</span>
        </a>
        <span v-if="index < model.length - 1" v-bind="section('separator')" class="wl-breadcrumbs__sep" aria-hidden="true">/</span>
      </li>
    </ol>
  </nav>
</template>

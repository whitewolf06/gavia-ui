<script setup lang="ts">
import { computed, inject } from "vue";
import WlBreadcrumbs from "../../../packages/ui-kit/src/components/WlBreadcrumbs.vue";
import WlPageHeader from "../../../packages/ui-kit/src/components/WlPageHeader.vue";
import type { WlBreadcrumbItem } from "../../../packages/ui-kit/src/types";
import { createPlaygroundUrl, parsePlaygroundRoute, type PlaygroundRoute } from "./navigation";
import { playgroundNavigationKey } from "./playground-navigation";

const props = defineProps<{
  title: string;
  description: string;
  titleId?: string;
  breadcrumbs: Array<{ label: string; route?: PlaygroundRoute }>;
}>();
const navigation = inject(playgroundNavigationKey, undefined);
const items = computed<WlBreadcrumbItem[]>(() => {
  const current = new URL(typeof window === "undefined" ? "http://localhost/" : window.location.href);
  if (navigation) current.searchParams.set("theme", navigation.theme.value);
  const routes = [{ label: "Главная", route: { view: "home" } as PlaygroundRoute }, ...props.breadcrumbs];
  return routes.map(({ label, route }, index) => {
    if (index === routes.length - 1 || !route) return { label };
    const target = createPlaygroundUrl(current, route);
    return { label, href: target.pathname + target.search };
  });
});
function followBreadcrumb(event: MouseEvent): void {
  if (!navigation || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
  if (!target) return;
  const url = new URL(target.href);
  if (url.origin !== window.location.origin) return;
  event.preventDefault();
  void navigation.navigate(parsePlaygroundRoute(url.search, url.hash));
}
</script>

<template>
  <!-- A new introduction can add named slots that the kit header reads on mount. -->
  <WlPageHeader :key="[title, !!$slots.meta, !!$slots.actions, !!$slots.navigation].join('|')" class="pg-page-header" :title="title" :description="description" data-testid="playground-page-header">
    <template #breadcrumbs><WlBreadcrumbs :items="items" @click="followBreadcrumb" /></template>
    <template #title><span :id="titleId">{{ title }}</span></template>
    <template v-if="$slots.meta" #meta><slot name="meta" /></template>
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    <template v-if="$slots.navigation" #navigation><slot name="navigation" /></template>
  </WlPageHeader>
</template>

<style scoped>
.pg-page-header { padding-block: 0; overflow-wrap: anywhere; }
.pg-page-header :deep(.wl-breadcrumbs__list) { flex-wrap: wrap; }
.pg-page-header :deep(.wl-breadcrumbs__item) { flex: none; max-width: 100%; }
</style>

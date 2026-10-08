<script setup lang="ts">
import { ref } from "vue";
import { WlMenu, WlAccordion, WlSidebar, WlCommandPalette, WlBreadcrumbs, WlSteps, WlCalendar,
  type WlMenuItem, type WlMenuExpose, type WlAccordionItem, type WlSidebarItem,
  type WlSidebarGroup, type WlCommandPaletteItem, type WlCommandPaletteGroup } from "../../src";
interface ProjectMenuItem extends WlMenuItem<ProjectMenuItem> { projectId: number; }
interface Section extends WlAccordionItem<"details" | "history"> { data: { count: number }; }
interface NavItem extends WlSidebarItem<{ route: string }> { key: "docs" | "font"; data: { route: string }; }
interface NavGroup extends WlSidebarGroup<NavItem> { permission: "read" | "write"; }
interface CommandItem extends WlCommandPaletteItem<{ entityId: number }> { data: { entityId: number }; }
interface CommandGroup extends WlCommandPaletteGroup<CommandItem> { categoryId: number; }
const menus: readonly ProjectMenuItem[] = [{ label: "Project", projectId: 1, command: (item) => { item.projectId.toFixed(); } }];
const menu = ref<WlMenuExpose | null>(null);
const sections: readonly Section[] = [{ key: "details", title: "Details", data: { count: 1 } }];
const openKeys = ref<Section["key"][]>([]);
const navGroups: readonly NavGroup[] = [{ id: "main", permission: "read", items: [{ key: "docs", label: "Docs", data: { route: "/docs" } }] }];
const active = ref<NavItem["key"]>("font");
const pinned = ref(false);
const mobileOpen = ref(false);
const commandGroups: readonly CommandGroup[] = [{ id: "main", label: "Projects", categoryId: 1, items: [{ id: "open", label: "Open", data: { entityId: 1 }, keywords: ["open"] }] }];
const visible = ref(false);
const query = ref("");
const day = ref("");
const month = ref("");
const crumbs = [{ label: "Home", href: "/" }] as const;
const steps = [{ label: "Done" }] as const;
const events = [{ date: "2026-10-08", label: "Release", tone: "blue" }] as const;
function emptyScope(scope: object): string { return Object.keys(scope).join(); }
function text(value: string): string { return value.toUpperCase(); }
function number(value: number): string { return value.toFixed(); }
function key(value: NavItem["key"]): string { return value; }
function onNav(item: NavItem, group?: NavGroup): void { text(item.data.route); group?.permission.toUpperCase(); }
function onCommand(item: CommandItem, group: CommandGroup): void { number(item.data.entityId); number(group.categoryId); }
</script>
<template>
  <WlMenu ref="menu" :items="menus" popup class="consumer-menu" data-consumer="menu" />
  <button @click="menu?.toggle($event)">Открыть</button>
  <WlAccordion v-model:open-keys="openKeys" :items="sections">
    <template #item="{ item, open }">
      <span>{{ number(item.data.count) }} {{ open }}</span>
      <!-- @vue-expect-error Accordion slots preserve concrete consumer data. -->
      <span :data-value="text(item.data.count)" />
      <!-- @vue-expect-error Unknown consumer fields are not invented. -->
      <span :data-value="item.missingField" />
    </template>
  </WlAccordion>
  <!-- @vue-expect-error Items determine the key domain; openKeys cannot widen it. -->
  <WlAccordion :items="sections" :open-keys="['missing']" />
  <!-- @vue-expect-error Array-valued domain models do not support trim. -->
  <WlAccordion v-model:open-keys.trim="openKeys" :items="sections" />
  <WlSidebar v-model="active" v-model:pinned="pinned" v-model:mobile-open="mobileOpen" :groups="navGroups" @select="onNav">
    <template #brand="scope"><span>{{ emptyScope(scope) }}</span></template>
    <template #brand-mark="scope"><span>{{ emptyScope(scope) }}</span></template>
    <template #item="{ key: itemKey, item, group, select }">
      <button @click="select()">{{ key(itemKey) }} {{ text(item.data.route) }} {{ text(group.permission) }}</button>
      <!-- @vue-expect-error Group metadata remains its declared string type. -->
      <span :data-value="number(group.permission)" />
      <!-- @vue-expect-error Group scopes preserve their declared field set. -->
      <span :data-value="group.missingField" />
    </template>
    <template #footer-item="{ key: itemKey, item }"><span>{{ key(itemKey) }} {{ text(item.data.route) }}</span></template>
  </WlSidebar>
  <WlSidebar :groups="navGroups"><template #item="{ item, group }"><span>{{ text(item.data.route) }} {{ text(group.permission) }}</span></template></WlSidebar>
  <!-- @vue-expect-error An outside key cannot widen the navigation domain. -->
  <WlSidebar model-value="settings" :groups="navGroups" />
  <!-- @vue-expect-error Key models have no number coercion. -->
  <WlSidebar v-model.number="active" :groups="navGroups" />
  <!-- @vue-expect-error Boolean pinned models have no lazy modifier. -->
  <WlSidebar v-model:pinned.lazy="pinned" :groups="navGroups" />
  <!-- @vue-expect-error Boolean mobileOpen models have no trim modifier. -->
  <WlSidebar v-model:mobile-open.trim="mobileOpen" :groups="navGroups" />
  <WlCommandPalette v-model:visible="visible" v-model:query.trim="query" :groups="commandGroups" @select="onCommand">
    <template #footer="scope"><span>{{ emptyScope(scope) }}</span></template>
    <template #item="{ item, group }"><span>{{ number(item.data.entityId) }} {{ number(group.categoryId) }}</span></template>
    <template #group="{ group }">
      <span>{{ number(group.categoryId) }}</span>
      <!-- @vue-expect-error Group metadata must not erase to any. -->
      <span :data-value="text(group.categoryId)" />
    </template>
  </WlCommandPalette>
  <WlCommandPalette :groups="commandGroups"><template #item="{ item, group }"><span>{{ number(item.data.entityId) }} {{ number(group.categoryId) }}</span></template></WlCommandPalette>
  <!-- @vue-expect-error Query remains string. -->
  <WlCommandPalette v-model:query.number="query" :groups="commandGroups" />
  <!-- @vue-expect-error Visible is boolean. -->
  <WlCommandPalette v-model:visible.trim="visible" :groups="commandGroups" />
  <WlBreadcrumbs :items="crumbs" />
  <WlSteps :items="steps" :current="steps.length" />
  <WlCalendar v-model="day" v-model:month="month" :events="events" />
  <!-- @vue-expect-error Serialized calendar models have no numeric coercion. -->
  <WlCalendar v-model.number="day" :events="events" />
  <!-- @vue-expect-error Serialized months have no lazy modifier. -->
  <WlCalendar v-model:month.lazy="month" :events="events" />
</template>

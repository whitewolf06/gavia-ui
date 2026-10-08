<script setup lang="ts">
import { ref } from "vue";
import {
  WlRadio, WlSegmented, WlTabs, WlSidebar, WlCommandPalette,
  type WlTabItem, type WlSegmentedOption, type WlSidebarItem, type WlSidebarGroup,
  type WlCommandPaletteItem, type WlCommandPaletteGroup,
  type WlSidebarExpose, type WlCommandPaletteExpose
} from "../../src";

type Choice = "team" | "private";
type TabKey = "overview" | "history";
interface TabItem extends WlTabItem<TabKey> { description: string; }
interface SidebarItem extends WlSidebarItem<{ route: string; priority: number }> {
  key: "docs" | "font";
  data: { route: string; priority: number };
  testId: string;
}
interface CommandItem extends WlCommandPaletteItem<{ entityId: number }> {
  data: { entityId: number };
  action: "open" | "edit";
}
const radio = ref<Choice>("team");
const nullableRadio = ref<Choice | null>(null);
const segmented = ref<Choice | null>(null);
const tab = ref<TabKey | "">("");
const options = [{ label: "Команда", value: "team" }, { label: "Лично", value: "private" }] as const satisfies readonly WlSegmentedOption<Choice>[];
const tabItems: readonly TabItem[] = [{ key: "overview", label: "Обзор", description: "Описание проекта" }, { key: "history", label: "История", description: "Изменения проекта" }];
const sidebarGroups: readonly WlSidebarGroup<SidebarItem>[] = [{ id: "main", items: [{ key: "docs", label: "Документация", data: { route: "/docs", priority: 1 }, testId: "docs-link" }] }] as const satisfies readonly WlSidebarGroup<SidebarItem>[];
const commandGroups = [{ id: "main", label: "Проекты", items: [{ id: "open", label: "Открыть", keywords: ["project", "open"], action: "open", data: { entityId: 1 } }] }] as const satisfies readonly WlCommandPaletteGroup<CommandItem>[];
const sidebar = ref<WlSidebarExpose | null>(null);
const palette = ref<WlCommandPaletteExpose | null>(null);
const activeSidebarKey = ref<SidebarItem["key"]>();
function text(value: string): string { return value.toUpperCase(); }
function count(value: number): string { return value.toFixed(); }
function onSidebar(item: SidebarItem, group?: WlSidebarGroup<SidebarItem>): void { text(item.data.route); count(item.data.priority); group?.items[0]?.testId.toUpperCase(); }
function onCommand(item: CommandItem, group: WlCommandPaletteGroup<CommandItem>): void { count(item.data.entityId); text(item.action); group.items[0]?.data.entityId.toFixed(); }
const legacyOptions: WlSegmentedOption[] = [{ value: "any-string", label: "Legacy" }];
const legacyTabs: WlTabItem[] = [{ key: "any-string", label: "Legacy" }];
const legacySidebar: WlSidebarGroup[] = [{ id: "legacy", items: [{ key: "docs", label: "Docs" }] }];
const legacyCommands: WlCommandPaletteGroup[] = [{ id: "legacy", label: "Legacy", items: [{ id: "open", label: "Open" }] }];
const legacyModel = ref<string | null>(null);
const legacyTab = ref("");
</script>

<template>
  <WlRadio v-model="radio" value="team">Команда</WlRadio>
  <WlRadio v-model="radio" value="private">Лично</WlRadio>
  <WlRadio v-model="nullableRadio" value="team">Первый выбор</WlRadio>
  <!-- @vue-expect-error Choice is inferred from the model; a mismatched value cannot widen it. -->
  <WlRadio v-model="radio" value="public" />
  <WlSegmented v-model="segmented" :options="options" />
  <!-- @vue-expect-error Options determine the accepted model domain. -->
  <WlSegmented model-value="public" :options="options" />
  <WlTabs v-model="tab" :items="tabItems">
    <template #panel="{ item }">
      <span>{{ text(item.description) }}</span>
      <!-- @vue-expect-error The panel item preserves its consumer shape. -->
      <span :data-value="item.missingField" />
    </template>
  </WlTabs>
  <!-- @vue-expect-error The selected tab must be an item key or the empty sentinel. -->
  <WlTabs model-value="settings" :items="tabItems" />
  <WlSidebar ref="sidebar" v-model="activeSidebarKey" :groups="sidebarGroups" @select="onSidebar">
    <template #item="{ key, item, group, active, expanded, select }">
      <button :aria-pressed="active" @click="select()">{{ text(item.data.route) }} {{ count(item.data.priority) }} {{ text(item.testId) }} {{ key }} {{ group.id }} {{ expanded }}</button>
      <!-- @vue-expect-error Custom item data stays numeric, not any. -->
      <span :data-value="text(item.data.priority)" />
      <!-- @vue-expect-error Item slots retain their declared field set. -->
      <span :data-value="item.missingField" />
    </template>
    <template #footer-item="{ key, item, active, expanded, select }"><button :aria-pressed="active" @click="select()">{{ key }} {{ text(item.data.route) }} {{ expanded }}</button></template>
    <template #footer="{ expanded }"><span>{{ expanded }}</span></template>
  </WlSidebar>
  <WlCommandPalette ref="palette" :groups="commandGroups" @select="onCommand">
    <template #item="{ item, group, active }">
      <span>{{ count(item.data.entityId) }} {{ text(item.action) }} {{ group.id }} {{ active }}</span>
      <!-- @vue-expect-error Command slot data retains its numeric contract. -->
      <span :data-value="text(item.data.entityId)" />
      <!-- @vue-expect-error Command slots do not invent arbitrary item fields. -->
      <span :data-value="item.missingField" />
    </template>
    <template #item-icon="{ item }"><span>{{ count(item.data.entityId) }}</span></template>
    <template #group="{ group }"><span>{{ group.label }}</span></template>
    <template #empty="{ query }"><span>{{ text(query) }}</span></template>
  </WlCommandPalette>
  <button @click="sidebar?.openMobile(); palette?.open()">Открыть</button>
  <button @click="sidebar?.closeMobile(); sidebar?.togglePinned(); palette?.focus(); palette?.close()">Управление</button>
  <WlSegmented v-model="legacyModel" :options="legacyOptions" />
  <WlTabs v-model="legacyTab" :items="legacyTabs"><template #panel="{ item }"><span>{{ item.label }}</span></template></WlTabs>
  <WlSidebar :groups="legacySidebar" />
  <WlCommandPalette :groups="legacyCommands" />
</template>

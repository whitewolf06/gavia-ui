<script setup lang="ts">
// Released 0.9.1 application: compile unchanged against the new public package.
import { ref, type App } from "vue";
import { WlButton, WlInput, WlSelect, WlCheckbox, WlDatePicker, WlCalendar, WlDialog, WlTable, WlTabs, WlFilePicker, WlPopover, WlConfig, createWlPt, type WlDateRange, type WlTableColumn, type WlTableRow, type WlTabItem, type WlPtCallbackOptions } from "gavia-ui";
const text = ref("");
const enabled = ref(false);
const selected = ref<number | null>(null);
const date = ref<string | null>(null);
const range = ref<WlDateRange | null>(null);
const day = ref("2026-10-07");
const month = ref("2026-10");
const dialog = ref(false);
const tab = ref("overview");
const options = [{ id: 1, name: "Материал" }];
const rows: WlTableRow[] = [{ id: 1, title: "Пример" }];
const columns: WlTableColumn[] = [{ key: "title", label: "Название" }];
const tabs: WlTabItem[] = [{ key: "overview", label: "Обзор", icon: "home" }];
const popover = ref<InstanceType<typeof WlPopover> | null>(null);
const filePicker = ref<InstanceType<typeof WlFilePicker> | null>(null);
const pt = createWlPt({ select: { option: (state: WlPtCallbackOptions) => ({ class: state.context.selected ? "chosen" : "" }) } });
function configure(app: App): void { app.use(WlConfig, { pt, motion: false }); }
const fileCount = ref(0);
function click(event: MouseEvent): void { event.preventDefault(); }
function selectFiles(files: File[]): void { fileCount.value = files.length; }
function open(event: MouseEvent): void { popover.value?.toggle(event); }
function clear(): void { filePicker.value?.clear(); }
</script>
<template>
  <div>
    <WlButton variant="soft-danger" size="sm" density="compact" :loading="false" @click="click">
      <template #icon>+</template>Сохранить
    </WlButton>
    <WlInput v-model="text" placeholder="Имя" :invalid="false" />
    <WlCheckbox v-model="enabled" />
    <WlSelect v-model="selected" :options="options" option-label="name" option-value="id" />
    <WlDatePicker v-model="date" selection-mode="single" min-date="2026-10-01" />
    <WlDatePicker v-model="range" selection-mode="range" start-label="От" end-label="До" />
    <WlCalendar v-model="day" v-model:month="month" />
    <WlTabs v-model="tab" :items="tabs"><template #panel="{ item }">{{ item.label }}</template></WlTabs>
    <WlTable :value="rows" :columns="columns">
      <template #cell-title="{ row, value }">{{ row.id }}: {{ value }}</template>
      <template #empty>Нет данных</template>
    </WlTable>
    <WlDialog v-model:visible="dialog" header="Подтверждение"><template #footer><WlButton @click="dialog = false">Закрыть</WlButton></template>Содержимое</WlDialog>
    <WlFilePicker ref="filePicker" accept="image/*" multiple @select="selectFiles" @cancel="clear" />
    <WlButton @click="open">Сведения</WlButton>
    <WlPopover ref="popover" aria-label="Сведения">{{ fileCount }}</WlPopover>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import {
  WlAutocomplete, WlButton, WlConfirmDialog, WlDatePicker, WlDialog, WlDrawer,
  WlMenu, WlMultiSelect, WlPopover, WlSelect, WlTable, WlToast,
  useWlConfirm, useWlToast
} from "../../../packages/ui-kit/src";

const choices = [{ label: "Альфа", value: "a" }, { label: "Бета", value: "b" }];
const select = ref<string | null>(null);
const multi = ref<string[]>([]);
const automatic = ref<unknown>("");
const automaticValue = computed(() => {
  const value = automatic.value;
  return value && typeof value === "object" && "value" in value ? String(value.value) : String(value ?? "");
});
const suggestions = ref<unknown[]>(choices);
const date = ref<string | null>(null);
const dialog = ref(false);
const drawer = ref(false);
const menu = ref<InstanceType<typeof WlMenu> | null>(null);
const popover = ref<InstanceType<typeof WlPopover> | null>(null);
const status = ref("Ожидание");
const toast = useWlToast();
const { confirmDanger } = useWlConfirm();
const items = [{ label: "Выполнить", command: () => { status.value = "Меню выполнено"; } }];
function ask(): void {
  confirmDanger({ message: "Удалить элемент?", acceptLabel: "Удалить", accept: () => { status.value = "Подтверждено"; } });
}
</script>

<template>
  <main class="fixture">
    <h1>WhiteUI regression</h1>
    <section class="fixture-grid">
      <div class="fixture-card">
        <h2>Формы</h2>
        <WlSelect v-model="select" :options="choices" option-label="label" option-value="value"
          aria-label="Выбор" placeholder="Выберите" />
        <output id="select-value">{{ select }}</output>
        <WlMultiSelect v-model="multi" :options="choices" option-label="label" option-value="value"
          display="chip" filter aria-label="Множественный выбор" placeholder="Несколько" />
        <output id="multi-value">{{ multi.join(',') }}</output>
        <WlAutocomplete v-model="automatic" :suggestions="suggestions" option-label="label"
          aria-label="Подсказки" placeholder="Поиск" @complete="suggestions = choices.filter((item) => item.label.toLowerCase().includes($event.query.toLowerCase()))" />
        <output id="auto-value">{{ automaticValue }}</output>
        <WlDatePicker v-model="date" show-icon aria-label="Дата" />
        <output id="date-value">{{ date }}</output>
      </div>
      <div class="fixture-card">
        <h2>Оверлеи</h2>
        <WlButton id="dialog-open" @click="dialog = true">Диалог</WlButton>
        <WlButton id="drawer-open" @click="drawer = true">Панель</WlButton>
        <WlButton id="menu-open" @click="menu?.toggle($event)">Меню</WlButton>
        <WlButton id="popover-open" @click="popover?.toggle($event)">Поповер</WlButton>
        <WlButton id="toast-open" @click="toast.ok('Сохранено')">Toast</WlButton>
        <WlButton id="confirm-open" @click="ask">Подтверждение</WlButton>
        <WlButton id="tooltip-anchor" v-wl-tooltip="'Подсказка'">Tooltip</WlButton>
        <output id="action-status">{{ status }}</output>
      </div>
      <div class="fixture-card fixture-card--wide">
        <h2>Таблица</h2>
        <WlTable :columns="[{ key: 'name', label: 'Имя' }, { key: 'value', label: 'Значение' }]"
          :value="[{ name: 'Первый', value: 1 }, { name: 'Второй', value: 2 }]" />
      </div>
    </section>
  </main>
  <WlDialog v-model:visible="dialog" header="Проверка диалога"><WlButton id="dialog-action">Действие</WlButton></WlDialog>
  <WlDrawer v-model:visible="drawer" header="Проверка панели">Содержимое панели</WlDrawer>
  <WlMenu ref="menu" popup aria-label="Действия" :items="items" />
  <WlPopover ref="popover" aria-label="Детали">Содержимое поповера</WlPopover>
  <WlToast />
  <WlConfirmDialog />
</template>

<style>
body { background: var(--wl-bg); color: var(--wl-text); }
.fixture { max-width: 1060px; margin: 0 auto; padding: 24px; }
.fixture h1 { font-size: 24px; margin-bottom: 20px; }
.fixture h2 { font-size: 16px; margin-bottom: 14px; }
.fixture-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; }
.fixture-card { display: flex; flex-direction: column; align-items: start; gap: 12px; padding: 20px;
  background: var(--wl-bg); border: 1px solid var(--wl-border); border-radius: var(--wl-radius-lg); }
.fixture-card--wide { grid-column: 1 / -1; width: 100%; }
.fixture-card output { min-height: 16px; font-size: 12px; color: var(--wl-text-3); }
@media (max-width: 640px) { .fixture-grid { grid-template-columns: 1fr; } .fixture-card--wide { grid-column: auto; } }
</style>

<script setup lang="ts">
import { ref } from "vue";
import { WlPopover, WlButton, WlDatePicker, WlDialog, WlSelect, type WlPopoverExpose } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const popover = ref<WlPopoverExpose | null>(null);
const dialogPopover = ref<WlPopoverExpose | null>(null);
const dialogVisible = ref(false);
const type = ref("all");
const dialogType = ref("all");
const dialogDate = ref<string | null>("2026-10-05");
const options = [
  { label: "Все материалы", value: "all" },
  { label: "Сроки задач", value: "task_deadline" }
];
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="popover?.toggle($event)">Сведения</WlButton>
    <WlPopover ref="popover" aria-label="Сведения о материале" v-bind="preview">
      <div class="wl-stack" data-space="md">
        <p class="wl-text-body">Панель открывается рядом с кнопкой.</p>
        <div class="wl-inline" data-space="md">
          <WlSelect v-model="type" :options="options" option-label="label" option-value="value" aria-label="Тип материала" />
          <WlButton size="sm" @click="popover?.hide()">Закрыть</WlButton>
        </div>
      </div>
    </WlPopover>
    <output role="status" aria-label="Выбранный тип" class="wl-text-body">{{ type }}</output>
    <WlButton @click="dialogVisible = true">Вложенные фильтры</WlButton>
    <WlDialog v-model:visible="dialogVisible" header="Вложенные фильтры">
      <div class="wl-stack" data-space="md">
        <div><WlButton @click="dialogPopover?.toggle($event)">Открыть фильтры</WlButton></div>
        <WlPopover ref="dialogPopover" aria-label="Фильтры в диалоге">
          <div class="wl-stack" data-space="md">
            <WlSelect v-model="dialogType" :options="options" option-label="label" option-value="value" aria-label="Тип в диалоге" />
            <WlDatePicker v-model="dialogDate" aria-label="Дата в диалоге" />
            <div><WlButton size="sm">Кнопка внутри фильтров</WlButton></div>
          </div>
        </WlPopover>
        <dl class="wl-inline" data-space="lg">
          <div class="wl-stack" data-space="xs">
            <dt class="wl-text-small wl-text-muted">Тип</dt>
            <dd><output role="status" aria-label="Выбранный тип в диалоге" class="wl-text-body">{{ dialogType }}</output></dd>
          </div>
          <div class="wl-stack" data-space="xs">
            <dt class="wl-text-small wl-text-muted">Дата</dt>
            <dd><output role="status" aria-label="Выбранная дата в диалоге" class="wl-text-body">{{ dialogDate }}</output></dd>
          </div>
        </dl>
      </div>
      <template #footer><WlButton @click="dialogVisible = false">Готово</WlButton></template>
    </WlDialog>
  </div>
</template>

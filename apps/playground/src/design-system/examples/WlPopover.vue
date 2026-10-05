<script setup lang="ts">
import { ref } from "vue";
import { WlPopover, WlButton, WlDatePicker, WlDialog, WlSelect } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const popover = ref<InstanceType<typeof WlPopover> | null>(null);
const dialogPopover = ref<InstanceType<typeof WlPopover> | null>(null);
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
      <p class="wl-text-body">Содержимое привязано к кнопке.</p>
      <WlSelect v-model="type" :options="options" option-label="label" option-value="value" aria-label="Тип материала" />
      <WlButton size="sm" @click="popover?.hide()">Закрыть</WlButton>
    </WlPopover>
    <output role="status" aria-label="Выбранный тип">{{ type }}</output>
    <WlButton @click="dialogVisible = true">Вложенные фильтры</WlButton>
    <WlDialog v-model:visible="dialogVisible" header="Вложенные фильтры">
      <WlButton @click="dialogPopover?.toggle($event)">Открыть фильтры</WlButton>
      <WlPopover ref="dialogPopover" aria-label="Фильтры в диалоге">
        <WlSelect v-model="dialogType" :options="options" option-label="label" option-value="value" aria-label="Тип в диалоге" />
        <WlDatePicker v-model="dialogDate" aria-label="Дата в диалоге" />
        <WlButton size="sm">Действие фильтра</WlButton>
      </WlPopover>
      <output role="status" aria-label="Выбранный тип в диалоге">{{ dialogType }}</output>
      <output role="status" aria-label="Выбранная дата в диалоге">{{ dialogDate }}</output>
      <template #footer><WlButton @click="dialogVisible = false">Готово</WlButton></template>
    </WlDialog>
  </div>
</template>

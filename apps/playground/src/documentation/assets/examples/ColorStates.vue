<script setup lang="ts">
import { computed, ref } from "vue";
import { WlAlert, WlButton, WlSegmented } from "../../../../../../packages/ui-kit/src";
const definitions = {
  info: { label: "Информация", title: "Материал в работе", text: "Добавьте описание перед отправкой на проверку." },
  ok: { label: "Успех", title: "Материал готов", text: "Все обязательные поля заполнены." },
  warn: { label: "Предупреждение", title: "Нужна проверка", text: "Проверьте дату перед сохранением." },
  err: { label: "Ошибка", title: "Не удалось сохранить", text: "Введённые данные остались в форме. Повторите сохранение." }
} as const;
type StatusName = keyof typeof definitions;
const selected = ref<string | null>("info");
const saved = ref(0);
const options = Object.entries(definitions).map(([value, definition]) => ({ value, label: definition.label }));
const status = computed<StatusName>(() => typeof selected.value === "string" && selected.value in definitions ? selected.value as StatusName : "info");
const current = computed(() => definitions[status.value]);
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <WlSegmented v-model="selected" :options="options" aria-label="Статус материала" />
    <WlAlert :variant="status" :title="current.title">{{ current.text }}</WlAlert>
    <div><WlButton variant="primary" @click="saved++">Сохранить пример</WlButton></div>
    <p class="wl-text-small" role="status">Сохранено материалов: {{ saved }} · Состояние: {{ current.label }}</p>
    <p class="wl-text-small wl-text-muted">Название состояния, текст и число понятны без цвета. Действия работают только в этом примере.</p>
  </section>
</template>

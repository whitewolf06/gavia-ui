<script setup lang="ts">
import { computed, ref } from "vue";
import { WlButton, WlCheckbox, WlField } from "../../../../../../packages/ui-kit/src";
const notifications = ref([{ id: "mail", label: "Письма", enabled: true }, { id: "push", label: "Push-уведомления", enabled: false }]);
const selectedCount = computed(() => notifications.value.filter((item) => item.enabled).length);
const allSelected = computed({ get: () => selectedCount.value === notifications.value.length, set: (checked: boolean) => { notifications.value.forEach((item) => { item.enabled = checked; }); } });
const mixed = computed(() => selectedCount.value > 0 && !allSelected.value);
const consent = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlCheckbox">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Связанный выбор и indeterminate</h4>
      <WlCheckbox v-model="allSelected" :indeterminate="mixed">Все доступные уведомления</WlCheckbox>
      <div class="wl-stack" data-space="sm"><WlCheckbox v-for="item in notifications" :key="item.id" v-model="item.enabled">{{ item.label }}</WlCheckbox></div>
      <p class="wl-text-small wl-text-muted">Промежуточное состояние вычисляет приложение: часть дочерних пунктов выбрана. Space переключает сфокусированный чекбокс.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Подпись, ошибка и disabled</h4>
      <WlField id="docs-checkbox-consent" :error="consent ? undefined : 'Подтвердите согласие.'" v-slot="{ id, ariaDescribedby, invalid }"><WlCheckbox :id="id" v-model="consent" :invalid="invalid" :aria-describedby="ariaDescribedby" required>Согласен с условиями</WlCheckbox></WlField>
      <WlCheckbox :model-value="true" disabled>Системные уведомления обязательны</WlCheckbox>
      <WlButton size="sm" @click="allSelected = false; consent = false">Снять доступные флажки</WlButton>
      <p class="wl-text-small" role="status">Выбрано уведомлений: {{ selectedCount }} из {{ notifications.length }}. Согласие: {{ consent ? 'подтверждено' : 'не подтверждено' }}.</p>
    </section>
  </div>
</template>
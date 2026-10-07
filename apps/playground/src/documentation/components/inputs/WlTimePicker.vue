<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlTimePicker } from "../../../../../../packages/ui-kit/src";
const appointment = ref<string | null>("09:30");
const night = ref<string | null>("23:30");
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlTimePicker">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры и дневной диапазон</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-time-${size}`" :label="`Время встречи, ${size}`" hint="От 08:00 до 18:00." v-slot="{ id, ariaDescribedby }"><WlTimePicker :id="id" v-model="appointment" :size="size" min-time="08:00" max-time="18:00" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-time-compact" label="Компактное время" v-slot="{ id }"><WlTimePicker :id="id" v-model="appointment" min-time="08:00" max-time="18:00" density="compact" /></WlField>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Ночной диапазон, ошибка и disabled</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-time-night" label="Ночная смена" hint="От 22:00 до 02:00: диапазон проходит через полночь." v-slot="{ id, ariaDescribedby }"><WlTimePicker :id="id" v-model="night" min-time="22:00" max-time="02:00" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-time-required" label="Обязательное время встречи" :error="appointment ? undefined : 'Укажите время встречи.'" required v-slot="{ id, ariaDescribedby, invalid, required }"><WlTimePicker :id="id" v-model="appointment" min-time="08:00" max-time="18:00" :invalid="invalid" :required="required" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-time-disabled" label="Недоступное время" v-slot="{ id }"><WlTimePicker :id="id" model-value="10:00" disabled /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">Модель — HH:mm или null, без даты и часового пояса. Пустое поле очищает модель; недопустимое время не заменяет последнее допустимое.</p>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="appointment = null; night = null">Очистить время</WlButton><WlButton size="sm" @click="appointment = '09:30'; night = '23:30'">Сбросить время</WlButton></div>
      <p class="wl-text-small" role="status">Встреча: {{ appointment ?? 'null' }}. Ночная смена: {{ night ?? 'null' }}.</p>
    </section>
  </div>
</template>
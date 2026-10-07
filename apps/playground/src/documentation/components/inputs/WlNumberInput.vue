<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlNumberInput } from "../../../../../../packages/ui-kit/src";
const quantity = ref(3);
const budget = ref(20);
const price = ref(12.5);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlNumberInput">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры и ограниченный диапазон</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-number-${size}`" :label="`Количество, ${size}`" v-slot="{ id }">
          <WlNumberInput :id="id" v-model="quantity" :size="size" :min="1" :max="10" :aria-label="`Количество, ${size}`" :decrement-label="`Уменьшить количество, ${size}`" :increment-label="`Увеличить количество, ${size}`" />
        </WlField>
        <WlField id="docs-number-compact" label="Шаг 5, компактное поле" v-slot="{ id }"><WlNumberInput :id="id" v-model="budget" :min="0" :max="50" :step="5" density="compact" aria-label="Бюджет" decrement-label="Уменьшить бюджет" increment-label="Увеличить бюджет" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">Кнопки и стрелки ↑/↓ применяют step. Ручной ввод фиксируется по Enter или потере фокуса и ограничивается min/max.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Дробный ввод и состояния</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-number-price" label="Цена, шаг 0.5" v-slot="{ id }"><WlNumberInput :id="id" v-model="price" :min="0" :max="100" :step="0.5" inputmode="decimal" aria-label="Цена" decrement-label="Уменьшить цену" increment-label="Увеличить цену" /></WlField>
        <WlField id="docs-number-invalid" label="Количество с ошибкой" error="Количество нужно согласовать." v-slot="{ id, ariaDescribedby, invalid }"><WlNumberInput :id="id" v-model="quantity" :min="1" :max="10" :invalid="invalid" :aria-describedby="ariaDescribedby" aria-label="Количество с ошибкой" /></WlField>
        <WlField id="docs-number-disabled" label="Отключённый степпер" v-slot="{ id }"><WlNumberInput :id="id" :model-value="5" disabled aria-label="Отключённое количество" /></WlField>
      </div>
      <WlButton size="sm" @click="quantity = 3; budget = 20; price = 12.5">Сбросить числа</WlButton>
      <p class="wl-text-small" role="status">Количество: {{ quantity }}; бюджет: {{ budget }}; цена: {{ price }}.</p>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlDatePicker, WlField, type WlDateRange } from "../../../../../../packages/ui-kit/src";
const date = ref<string | null>("2026-10-15");
const period = ref<WlDateRange | null>(["2026-10-15", "2026-10-20"]);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlDatePicker">
    <section class="wl-stack" data-space="md" aria-label="Дата: формат и границы">
      <h4 class="wl-heading-4">Размеры, формат и доступные даты</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-date-${size}`" :label="`Дата встречи, ${size}`" hint="Даты октября 2026 года." v-slot="{ id, ariaDescribedby }"><WlDatePicker :id="id" v-model="date" :size="size" show-icon min-date="2026-10-01" max-date="2026-10-31" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-date-iso" label="Ручной ввод в формате ISO" hint="YYYY-MM-DD; модель всегда остаётся ISO." v-slot="{ id, ariaDescribedby }"><WlDatePicker :id="id" v-model="date" display-format="yyyy-mm-dd" placeholder="YYYY-MM-DD" min-date="2026-10-01" max-date="2026-10-31" :aria-describedby="ariaDescribedby" /></WlField>
      </div>
      <p class="wl-body-sm wl-muted">ArrowDown открывает календарь и переводит фокус к дате. Стрелки перемещают по дням, Home/End — по неделе, PageUp/PageDown — по месяцам. Enter фиксирует ручной ввод; Escape закрывает панель.</p>
    </section>
    <section class="wl-stack" data-space="md" aria-label="Диапазон дат">
      <h4 class="wl-heading-4">Диапазон от начала до конца</h4>
      <WlField id="docs-date-range" label="Даты поездки" hint="Выберите начало и конец в одном календаре или введите даты. Обе границы включены, доступны даты октября 2026 года." :error="period && !period[1] ? 'Выберите дату окончания поездки.' : undefined" v-slot="{ id, ariaDescribedby, invalid }">
        <WlDatePicker :id="id" v-model="period" selection-mode="range" show-icon name="trip-date"
          start-label="От" end-label="До" min-date="2026-10-01" max-date="2026-10-31"
          :invalid="invalid" :aria-describedby="ariaDescribedby" data-testid="docs-date-range" />
      </WlField>
      <p class="wl-body-sm wl-muted">Первый выбор сохраняет [start, null] и оставляет календарь открытым. Второй завершает диапазон, сортирует даты и закрывает панель. После завершения новый выбор начинает новый диапазон. Очистка «До» оставляет начало; очистка «От» очищает всё.</p>
      <div class="wl-inline" data-space="sm">
        <WlButton size="sm" @click="period = null">Очистить диапазон</WlButton>
        <WlButton size="sm" @click="period = ['2026-10-15', '2026-10-20']">Вернуть 15–20 октября</WlButton>
      </div>
      <output class="wl-body-sm" aria-live="polite" data-testid="docs-date-range-model">Модель диапазона: {{ JSON.stringify(period) }}</output>
      <WlField id="docs-date-range-disabled" label="Недоступный диапазон" v-slot="{ id }"><WlDatePicker :id="id" :model-value="['2026-10-15', '2026-10-20']" selection-mode="range" show-icon disabled /></WlField>
    </section>
    <section class="wl-stack" data-space="md" aria-label="Дата: ошибка и очистка">
      <h4 class="wl-heading-4">Ошибка, disabled и очистка</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-date-required" label="Обязательная дата" :error="date ? undefined : 'Выберите дату встречи.'" v-slot="{ id, ariaDescribedby, invalid }"><WlDatePicker :id="id" v-model="date" show-icon min-date="2026-10-01" max-date="2026-10-31" :invalid="invalid" :aria-describedby="ariaDescribedby" /></WlField>
        <WlField id="docs-date-disabled" label="Недоступная дата" v-slot="{ id }"><WlDatePicker :id="id" model-value="2026-10-15" show-icon disabled /></WlField>
      </div>
      <div class="wl-inline" data-space="sm">
        <WlButton size="sm" @click="date = null">Очистить дату</WlButton>
        <WlButton size="sm" @click="date = '2026-10-15'">Вернуть 15 октября</WlButton>
      </div>
      <p class="wl-body-sm" role="status">ISO-модель: {{ date ?? 'null' }}</p>
    </section>
  </div>
</template>

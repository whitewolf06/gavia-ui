<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlMultiSelect } from "../../../../../../packages/ui-kit/src";
const selected = ref<unknown[]>(["design", "code"]);
const options = [{ id: "design", label: "Дизайн" }, { id: "code", label: "Разработка" }, { id: "docs", label: "Документация" }, { id: "qa", label: "Проверки" }];
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlMultiSelect">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Чипы, фильтр и счётчик</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-multi-chips" label="Направления с фильтром" hint="Наберите название в фильтре; выбранные чипы можно удалить отдельно." v-slot="{ id, ariaDescribedby }"><WlMultiSelect :id="id" v-model="selected" :options="options" option-label="label" option-value="id" display="chip" filter :aria-describedby="ariaDescribedby" placeholder="Выберите направления" /></WlField>
        <WlField id="docs-multi-counter" label="Сводка выбранных" v-slot="{ id }"><WlMultiSelect :id="id" v-model="selected" :options="options" option-label="label" option-value="id" display="comma" :max-selected-labels="1" placeholder="Выберите направления" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">Enter переключает выбранный пункт, список остаётся открытым для следующего выбора. Escape закрывает его.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры и состояния</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-multi-${size}`" :label="`Направления, ${size}`" v-slot="{ id }"><WlMultiSelect :id="id" v-model="selected" :size="size" :options="options" option-label="label" option-value="id" /></WlField>
        <WlField id="docs-multi-compact" label="Компактный мультивыбор" v-slot="{ id }"><WlMultiSelect :id="id" v-model="selected" density="compact" :options="options" option-label="label" option-value="id" /></WlField>
        <WlField id="docs-multi-invalid" label="Не менее одного направления" :error="selected.length ? undefined : 'Выберите хотя бы одно направление.'" v-slot="{ id, ariaDescribedby, invalid }"><WlMultiSelect :id="id" v-model="selected" :options="options" option-label="label" option-value="id" :invalid="invalid" :aria-describedby="ariaDescribedby" placeholder="Выберите направления" /></WlField>
        <WlField id="docs-multi-disabled" label="Недоступный мультивыбор" v-slot="{ id }"><WlMultiSelect :id="id" :model-value="['design']" :options="options" option-label="label" option-value="id" display="chip" disabled /></WlField>
      </div>
      <WlButton size="sm" @click="selected = []">Очистить направления</WlButton>
      <p class="wl-text-small" role="status">Выбрано: {{ selected.length }}. Значения: {{ selected.join(', ') || 'нет' }}.</p>
    </section>
  </div>
</template>
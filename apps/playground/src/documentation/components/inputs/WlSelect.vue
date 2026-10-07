<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlSelect } from "../../../../../../packages/ui-kit/src";
const area = ref<unknown>("team");
const options = [{ id: "personal", label: "Личное пространство" }, { id: "team", label: "Команда" }, { id: "public", label: "Открытые материалы" }];
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlSelect">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры, плотность и объектные options</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-select-${size}`" :label="`Пространство, ${size}`" v-slot="{ id }"><WlSelect :id="id" v-model="area" :size="size" :aria-label="`Пространство, ${size}`" :options="options" option-label="label" option-value="id" placeholder="Выберите пространство" /></WlField>
        <WlField id="docs-select-compact" label="Компактный список" v-slot="{ id }"><WlSelect :id="id" v-model="area" density="compact" aria-label="Компактный список" :options="options" option-label="label" option-value="id" placeholder="Выберите пространство" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">Модель хранит id, а список показывает label. Стрелки перемещают выделение, Enter выбирает, Escape закрывает список.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Ошибка, disabled и очистка приложением</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-select-required" label="Обязательное пространство" :error="area == null ? 'Выберите пространство.' : undefined" v-slot="{ id, ariaDescribedby, invalid }"><WlSelect :id="id" v-model="area" :options="options" option-label="label" option-value="id" :invalid="invalid" aria-label="Обязательное пространство" :aria-describedby="ariaDescribedby" placeholder="Выберите пространство" /></WlField>
        <WlField id="docs-select-disabled" label="Недоступный список" v-slot="{ id }"><WlSelect :id="id" model-value="team" :options="options" option-label="label" option-value="id" aria-label="Недоступный список" disabled /></WlField>
      </div>
      <WlButton size="sm" @click="area = null">Очистить выбор</WlButton>
      <p class="wl-text-small" role="status">Значение модели: {{ area ?? 'null' }}.</p>
    </section>
  </div>
</template>
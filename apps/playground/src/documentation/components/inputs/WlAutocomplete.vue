<script setup lang="ts">
import { computed, ref } from "vue";
import { WlAutocomplete, WlButton, WlField } from "../../../../../../packages/ui-kit/src";
const people = [{ id: "anna", label: "Анна" }, { id: "boris", label: "Борис" }, { id: "dmitry", label: "Дмитрий" }, { id: "elena", label: "Елена" }];
type Person = (typeof people)[number];
const person = ref<Person | string | null>(people[0]!);
const participants = ref<Person[] | null>([people[0]!]);
const singleSuggestions = ref([...people]);
const multipleSuggestions = ref([...people]);
function filter(query: string) { return people.filter((item) => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())); }
function searchSingle(event: { query: string }) { singleSuggestions.value = filter(event.query); }
function searchMultiple(event: { query: string }) { multipleSuggestions.value = filter(event.query); }
function label(value: unknown): string { return typeof value === "object" && value !== null && "label" in value ? String(value.label) : String(value ?? ""); }
const selectedNames = computed(() => Array.isArray(participants.value) ? participants.value.map(label).join(", ") : "");
function reset() { person.value = ""; participants.value = []; singleSuggestions.value = [...people]; multipleSuggestions.value = [...people]; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlAutocomplete">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Поиск по объектам и множественный выбор</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-auto-single" label="Ответственный" hint="Введите имя. Приложение обновит suggestions по событию complete." v-slot="{ id, ariaDescribedby }"><WlAutocomplete :id="id" v-model="person" :suggestions="singleSuggestions" :option-label="label" dropdown dropdown-label="Показать ответственных" :aria-describedby="ariaDescribedby" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-multiple" label="Участники" v-slot="{ id }"><WlAutocomplete :id="id" v-model="participants" :suggestions="multipleSuggestions" :option-label="label" multiple dropdown dropdown-label="Показать участников" :min-length="0" @complete="searchMultiple" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">Кнопка раскрывает текущие suggestions; начальный список заранее заполнен. Выбор подсказки возвращает объект, ввод в одиночном режиме — строку. Функция label поддерживает оба значения.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры, компактность и состояния</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-auto-${size}`" :label="`Ответственный, ${size}`" v-slot="{ id }"><WlAutocomplete :id="id" v-model="person" :size="size" :suggestions="singleSuggestions" :option-label="label" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-compact" label="Компактные подсказки" v-slot="{ id }"><WlAutocomplete :id="id" v-model="person" density="compact" :suggestions="singleSuggestions" :option-label="label" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-invalid" label="Подсказки с ошибкой" error="Уточните ответственного перед сохранением." v-slot="{ id, ariaDescribedby, invalid }"><WlAutocomplete :id="id" v-model="person" :suggestions="singleSuggestions" :option-label="label" :invalid="invalid" :aria-describedby="ariaDescribedby" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-disabled" label="Недоступные подсказки" v-slot="{ id }"><WlAutocomplete :id="id" :model-value="people[0]" :suggestions="people" :option-label="label" disabled dropdown /></WlField>
      </div>
      <WlButton size="sm" @click="reset">Очистить выбранные значения</WlButton>
      <p class="wl-text-small" role="status">Ответственный: {{ label(person) || 'не выбран' }}. Участники: {{ selectedNames || 'не выбраны' }}.</p>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import { WlAutocomplete, WlMultiSelect, WlSelect } from "../../src";
interface Item { id: number; label: string; }
const items: readonly Item[] = [{ id: 1, label: "One" }, { id: 2, label: "Two" }];
const strings: readonly string[] = ["One", "Two"];
const keyed = ref<number | null>(1);
const direct = ref<Item | null>(items[0] ?? null);
const text = ref<string | null>("One");
const selected = ref<number[]>([]);
const singleAuto = ref<Item | string | null>(null);
const multipleAuto = ref<Item[] | null>([]);
const dynamicMultiple = ref(false);
const dynamicAuto = ref<Item | string | Item[] | null>(null);
function label(item: Item | string): string { return typeof item === "string" ? item : item.label; }
function numeric(value: number | null): void { value?.toFixed(); }
function textual(value: string | null): void { value?.toUpperCase(); }
function numbers(values: number[]): void { values.map((value) => value.toFixed()); }
</script>

<template>
  <!-- No explicit @vue-generic: these must infer from options + resolver, never from the model. -->
  <WlSelect v-model="keyed" :options="items" option-value="id" option-label="label" @update:model-value="numeric" />
  <WlSelect v-model="keyed" :options="items" :option-value="(item) => item.id" @update:model-value="numeric" />
  <WlSelect v-model="text" :options="items" :option-value="(item) => item.label" @update:model-value="textual" />
  <WlSelect v-model="direct" :options="items" option-label="label" />
  <WlSelect v-model="text" :options="strings" @update:model-value="textual" />
  <WlMultiSelect v-model="selected" :options="items" option-value="id" @update:model-value="numbers" />
  <WlMultiSelect v-model="selected" :options="items" :option-value="(item) => item.id" @update:model-value="numbers" />
  <WlAutocomplete v-model="singleAuto" :suggestions="items" :option-label="label" />
  <WlAutocomplete v-model="multipleAuto" :suggestions="items" multiple :option-label="(item) => item.label" />
  <WlAutocomplete v-model="dynamicAuto" :suggestions="items" :multiple="dynamicMultiple" :option-label="label" />

  <!-- @vue-expect-error A string model cannot widen the numeric id from options. -->
  <WlSelect v-model="text" :options="items" option-value="id" />
  <!-- @vue-expect-error No resolver returns the object itself, not its id. -->
  <WlSelect v-model="keyed" :options="items" />
  <!-- @vue-expect-error Key resolvers must be known fields. -->
  <WlSelect v-model="keyed" :options="items" option-value="missing" />
  <!-- @vue-expect-error A callback returning number cannot emit a string model. -->
  <WlSelect v-model="text" :options="items" :option-value="(item) => item.id" />
  <!-- @vue-expect-error MultiSelect cannot accept scalar models. -->
  <WlMultiSelect v-model="keyed" :options="items" option-value="id" />
  <!-- @vue-expect-error A single autocomplete emits strings when the user types. -->
  <WlAutocomplete v-model="direct" :suggestions="items" :option-label="label" @update:model-value="(value: Item | null | undefined) => { void value; }" />
  <!-- @vue-expect-error Multiple autocomplete models contain complete suggestions, not scalar ids. -->
  <WlAutocomplete v-model="selected" :suggestions="items" multiple />
  <!-- @vue-expect-error Label callbacks in single mode must handle free text too. -->
  <WlAutocomplete v-model="singleAuto" :suggestions="items" :option-label="(item: Item) => item.label" />
</template>

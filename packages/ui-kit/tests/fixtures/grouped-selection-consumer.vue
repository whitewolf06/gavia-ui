<script setup lang="ts">
import { ref } from "vue";
import { WlMultiSelect, WlSelect } from "../../src";
interface Item { id: number; label: string; disabled: boolean }
interface Group { title: string; items: readonly Item[] }
const groups: readonly Group[] = [{ title: "Group", items: [{ id: 1, label: "One", disabled: false }] }];
const single = ref<number | null>(null);
const multi = ref<number[]>([]);
const wrong = ref<string | null>(null);
function numeric(value: number | null): void { value?.toFixed(); }
function numbers(values: number[]): void { values.map((value) => value.toFixed()); }
const children = (group: Group) => group.items;
</script>

<template>
  <WlSelect v-model="single" :options="groups" option-group-children="items" option-group-label="title" option-label="label" option-value="id" option-disabled="disabled" @update:model-value="numeric">
    <template #option="{ option }">{{ option.id.toFixed() }}</template>
    <template #optiongroup="{ group }">{{ group.title.toUpperCase() }}</template>
  </WlSelect>
  <WlMultiSelect v-model="multi" :options="groups" option-group-children="items" option-label="label" option-value="id" show-select-all @update:model-value="numbers" />
  <WlSelect v-model="single" :options="groups" :option-group-children="children" option-label="label" option-value="id" @update:model-value="numeric" />
  <WlSelect v-model="single" :options="groups" option-group-children="items" :option-value="(item) => item.id" @update:model-value="numeric" />
  <WlMultiSelect v-model="multi" :options="groups" option-group-children="items" :option-value="(item) => item.id" @update:model-value="numbers" />
  <!-- @vue-expect-error A grouped model is inferred from leaf ids, not the incoming model. -->
  <WlSelect v-model="wrong" :options="groups" option-group-children="items" option-value="id" />
  <!-- @vue-expect-error Leaf resolvers cannot name group fields. -->
  <WlSelect v-model="single" :options="groups" option-group-children="items" option-value="title" />
  <!-- @vue-expect-error A scalar model cannot widen grouped multiple selection. -->
  <WlMultiSelect v-model="single" :options="groups" option-group-children="items" option-value="id" />
  <!-- @vue-expect-error A children field must contain an array of options. -->
  <WlSelect :options="groups" option-group-children="title" />
</template>

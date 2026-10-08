<script setup lang="ts">
import { WlTable, type WlTableColumn, type WlTableRow } from "../../src";
interface Person { id: number; name: string; score: number; note?: string; }
const rows: readonly Person[] = [{ id: 1, name: "Дмитрий", score: 8 }];
const columns = [{ key: "name", label: "Имя" }, { key: "score", label: "Оценка" }, { key: "note", label: "Примечание" }] as const satisfies readonly WlTableColumn<Person>[];
const virtualColumns = [{ key: "actions", label: "Действия", kind: "virtual" }] as const satisfies readonly WlTableColumn<Person, "actions">[];
const typoColumns = [{ key: "naem", label: "Имя" }] as const;
const unmarkedVirtual = [{ key: "actions", label: "Действия" }] as const;
const legacyRows: WlTableRow[] = [{ name: "Дмитрий" }];
const legacyColumns: WlTableColumn[] = [{ key: "actions", label: "Действия" }];
function nameLabel(value: string): string { return value.toUpperCase(); }
function scoreLabel(value: number): string { return value.toFixed(1); }
function optionalLabel(value: string | undefined): string { return value ?? "—"; }
function personLabel(value: Person): string { return value.name; }
function emptyScope(scope: object): string { return Object.keys(scope).join(); }
</script>

<template>
  <WlTable :value="rows" :columns="columns">
    <template #cell-name="{ row, value }"><span>{{ personLabel(row) }}: {{ nameLabel(value) }}</span></template>
    <template #cell-score="{ value }"><span>{{ scoreLabel(value) }}</span></template>
    <template #cell-note="{ value }"><span>{{ optionalLabel(value) }}</span></template>
  </WlTable>
  <WlTable :value="rows" :columns="virtualColumns">
    <template #cell-actions="{ row, value }">
      <span>{{ personLabel(row) }}: {{ String(value) }}</span>
      <!-- @vue-expect-error Virtual values require narrowing. -->
      <span :data-value="nameLabel(value)" />
    </template>
  </WlTable>
  <!-- @vue-expect-error Columns cannot widen the row to hide a field typo. -->
  <WlTable :value="rows" :columns="typoColumns" />
  <!-- @vue-expect-error Missing row fields need an explicit virtual marker. -->
  <WlTable :value="rows" :columns="unmarkedVirtual" />
  <!-- @vue-expect-error Broad legacy fields cannot erase an interface row contract. -->
  <WlTable :value="rows" :columns="legacyColumns" />
  <WlTable :value="legacyRows" :columns="legacyColumns">
    <template #cell-actions="{ row, value }"><span>{{ String(row.name) }}: {{ String(value) }}</span></template>
    <template #empty="scope"><span>Пусто {{ emptyScope(scope) }}</span></template>
  </WlTable>
  <WlTable><template #default="scope"><span>Собственная таблица {{ emptyScope(scope) }}</span></template></WlTable>
  <WlTable :value="rows" :columns="columns">
    <template #cell-name="{ value }">
      <!-- @vue-expect-error Name slot values are strings. -->
      <span :data-value="scoreLabel(value)" />
    </template>
    <template #cell-score="{ row, value }">
      <!-- @vue-expect-error Score slot values are numbers. -->
      <span :data-value="nameLabel(value)" />
      <!-- @vue-expect-error Scoped rows keep the declared fields. -->
      <span :data-value="row.missingField" />
    </template>
  </WlTable>
</template>

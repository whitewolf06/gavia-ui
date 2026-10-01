<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { WlPageHeader, WlButton, WlFilterBar, WlInput, WlSelect, WlTag, WlTable, WlPill, WlPagination, WlEmpty, WlDrawer, WlField, useWlConfirm, useWlToast } from "../../../../../packages/ui-kit/src";
type Material = { id: number; title: string; status: string };
const materials = ref<Material[]>(Array.from({ length: 12 }, (_, index) => ({
  id: index + 1, title: ["Руководство команды", "План исследования", "Правила ревью", "Доступы и роли"][index % 4] + (index < 4 ? "" : ` · ${index + 1}`),
  status: index % 2 ? "progress" : "done"
})));
const search = ref("");
const status = ref<string | null>(null);
const order = ref<string | null>("asc");
const page = ref(1);
const confirm = useWlConfirm();
const toast = useWlToast();
const filtered = computed(() => materials.value.filter((item) =>
  item.title.toLocaleLowerCase("ru").includes(search.value.toLocaleLowerCase("ru")) && (!status.value || item.status === status.value))
  .sort((a, b) => a.title.localeCompare(b.title, "ru") * (order.value === "desc" ? -1 : 1)));
const pageCount = computed(() => Math.max(1, Math.ceil(filtered.value.length / 4)));
const visibleRows = computed(() => filtered.value.slice((page.value - 1) * 4, page.value * 4));
watch([search, status, order], () => { page.value = 1; });
watch(pageCount, (count) => { page.value = Math.min(page.value, count); });
const columns = [{ key: "title", label: "Материал" }, { key: "status", label: "Статус" }, { key: "actions", label: "Действия" }];
function clear(): void { search.value = ""; status.value = null; }
const editing = ref(false);
const editingId = ref<number | null>(null);
const title = ref("");
const titleError = ref("");
let nextId = 13;
function edit(item?: Material): void {
  editingId.value = item?.id ?? null; title.value = item?.title ?? ""; titleError.value = ""; editing.value = true;
}
async function save(): Promise<void> {
  titleError.value = title.value.trim() ? "" : "Введите название.";
  if (titleError.value) { await nextTick(); document.getElementById("recipe-material-title")?.focus(); return; }
  const current = materials.value.find((item) => item.id === editingId.value);
  if (current) current.title = title.value.trim();
  else materials.value.push({ id: nextId++, title: title.value.trim(), status: "progress" });
  editing.value = false; toast.ok("Материал сохранён");
}
function remove(id: number): void {
  const item = materials.value.find((entry) => entry.id === id);
  if (!item) return;
  confirm.confirmDanger({
    header: "Удалить материал?", message: `«${item.title}» будет удалён.`, acceptLabel: "Удалить", rejectLabel: "Отмена",
    accept: () => { materials.value = materials.value.filter((entry) => entry.id !== id); toast.ok("Материал удалён"); }
  });
}
</script>

<template>
  <section class="wl-stack" data-space="lg" aria-label="Список материалов">
    <WlPageHeader title="Материалы команды" description="Документы, договорённости и исследования." :heading-level="2" size="md">
      <template #meta><WlTag>{{ materials.length }} материалов</WlTag></template>
      <template #actions><WlButton variant="primary" @click="edit()">Создать материал</WlButton></template>
    </WlPageHeader>
    <WlInput v-model="search" type="search" placeholder="Найти материал" aria-label="Найти материал" />
    <WlFilterBar :active-count="Number(Boolean(status))" aria-label="Фильтры материалов" panel-title="Фильтры материалов" @clear="clear">
      <WlSelect v-model="status" :options="[{ label: 'Готово', value: 'done' }, { label: 'В работе', value: 'progress' }]" option-label="label" option-value="value" aria-label="Статус материалов" placeholder="Все статусы" />
      <WlSelect v-model="order" :options="[{ label: 'Название А–Я', value: 'asc' }, { label: 'Название Я–А', value: 'desc' }]" option-label="label" option-value="value" aria-label="Порядок материалов" />
      <template #summary><WlTag v-if="status" removable remove-label="Убрать фильтр статуса" @remove="status = null">{{ status === 'done' ? 'Готово' : 'В работе' }}</WlTag></template>
    </WlFilterBar>
    <div v-if="filtered.length" class="ds-material-table" role="region" aria-label="Материалы команды" tabindex="0"><WlTable :columns="columns" :value="visibleRows" :pt="{ root: { style: { minWidth: '640px' } } }">
      <template #cell-status="{ value }"><WlPill :variant="value === 'done' ? 'ok' : 'info'" :label="value === 'done' ? 'Готово' : 'В работе'" /></template>
      <template #cell-actions="{ row }"><div class="wl-inline" data-space="xs"><WlButton size="sm" variant="ghost" :aria-label="`Редактировать ${row.title}`" @click="edit(materials.find((item) => item.id === row.id))">Изменить</WlButton><WlButton size="sm" variant="danger-quiet" :aria-label="`Удалить ${row.title}`" @click="remove(Number(row.id))">Удалить</WlButton></div></template>
    </WlTable></div>
    <WlEmpty v-else icon="search" title="Материалы не найдены" description="Измените запрос или сбросьте фильтры."><template #action><WlButton @click="clear">Сбросить поиск</WlButton></template></WlEmpty>
    <div class="wl-inline" data-space="md"><WlPagination v-if="filtered.length" v-model:page="page" :page-count="pageCount" /><p class="wl-text-small wl-text-muted" role="status">Найдено: {{ filtered.length }} · страница {{ page }} из {{ pageCount }}</p></div>
    <WlDrawer v-model:visible="editing" :header="editingId ? 'Редактирование материала' : 'Новый материал'">
      <form id="recipe-material-form" class="wl-stack" data-space="lg" @submit.prevent="save">
        <WlField id="recipe-material-title" label="Название" required :error="titleError" v-slot="field"><WlInput :id="field.id" v-model="title" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" maxlength="120" /></WlField>
        <p class="wl-text-small wl-text-muted">Изменения сохранятся после нажатия «Сохранить».</p>
      </form>
      <template #footer><WlButton variant="ghost" @click="editing = false">Отмена</WlButton><WlButton variant="primary" type="submit" form="recipe-material-form">Сохранить</WlButton></template>
    </WlDrawer>
  </section>
</template>

<style scoped>
.ds-material-table { overflow: auto; max-width: 100%; }
</style>

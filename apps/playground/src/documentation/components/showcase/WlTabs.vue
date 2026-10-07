<script setup lang="ts">
import { computed, ref } from "vue";
import { WlTabs, WlButton, type WlTabItem } from "../../../../../../packages/ui-kit/src";
const active = ref("showcase-overview");
const count = ref(3);
const items = computed<WlTabItem[]>(() => [{ key: "showcase-overview", label: "Обзор", icon: "file" }, { key: "showcase-notes", label: "Заметки", icon: "edit", count: count.value }, { key: "showcase-history", label: "История", icon: "clock" }]);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlTabs v-model="active" :items="items" :pt="{ tabList: { 'aria-label': 'Разделы материала' } }"><template #panel="{ item }"><div class="wl-stack" data-space="md"><h3 class="wl-text-subheading">{{ item.label }}</h3><p class="wl-text-body">Панель {{ item.key }} получает содержимое из scoped-слота.</p><div v-if="item.key === 'showcase-notes'"><WlButton size="sm" @click="count++">Новая заметка</WlButton><p class="wl-text-small">Заметок в локальном примере: {{ count }}</p></div><p v-else class="wl-text-small wl-text-muted">{{ item.key === 'showcase-history' ? 'Сегодня — просмотрена документация.' : 'Стрелки ←/→, Home и End переключают вкладки.' }}</p></div></template></WlTabs>
    <p class="wl-text-small" role="status">Активная вкладка: {{ items.find(item => item.key === active)?.label }}.</p>
  </div>
</template>

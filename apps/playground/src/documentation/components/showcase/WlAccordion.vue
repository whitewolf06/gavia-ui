<script setup lang="ts">
import { ref, watch } from "vue";
import { WlAccordion, WlCheckbox, WlButton, type WlAccordionItem } from "../../../../../../packages/ui-kit/src";
const single = ref(false);
const open = ref(["guide"]);
const action = ref("");
watch(single, enabled => { if (enabled) open.value = open.value.slice(0, 1); });
const items: WlAccordionItem[] = [{ key: "guide", title: "Подключение", content: "Подключите CSS явно и импортируйте компоненты из gavia-ui." }, { key: "theme", title: "Темы", content: "Gavia, Gavia Dark, Classic, Classic Dark и Newspaper переключаются токенами." }, { key: "later", title: "Закрытый раздел", content: "Этот раздел недоступен.", disabled: true }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="single">Только один раскрытый пункт</WlCheckbox>
    <WlAccordion v-model:open-keys="open" :items="items" :single="single"><template #item="{ item, open: expanded }"><div class="wl-stack" data-space="sm"><p class="wl-text-body">{{ item.content }}</p><div><WlButton size="sm" @click="action = item.title">Проверить {{ item.title }}</WlButton></div><p class="wl-text-small wl-text-muted">Scoped-слот: open = {{ expanded }}</p></div></template></WlAccordion>
    <p class="wl-text-small" role="status">Открытые ключи: {{ open.join(', ') || 'нет' }}. {{ action ? 'Действие: ' + action : '' }}</p>
    <div class="wl-stack" data-space="sm"><h3 class="wl-text-label">Неконтролируемый вариант</h3><WlAccordion single :items="items" /></div>
  </div>
</template>

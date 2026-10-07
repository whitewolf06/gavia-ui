<script setup lang="ts">
import { ref } from "vue";
import { WlDrawer, WlButton, WlCheckbox, WlTag, type WlDrawerPosition } from "../../../../../../packages/ui-kit/src";
const visible = ref(false);
const position = ref<WlDrawerPosition>("right");
const motion = ref(true);
const saved = ref(false);
const positions = { right: "Справа", left: "Слева", top: "Сверху", bottom: "Снизу", full: "На весь экран" } satisfies Record<WlDrawerPosition, string>;
function open(value: WlDrawerPosition): void { position.value = value; visible.value = true; }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="motion">Анимация панели</WlCheckbox>
    <div class="wl-inline" data-space="sm"><WlButton v-for="(label, key) in positions" :key="key" size="sm" @click="open(key)">{{ label }}</WlButton></div>
    <WlDrawer v-model:visible="visible" header="Детали материала" :position="position" :motion="motion" :pt="{ footer: { style: { flexWrap: 'wrap' } } }"><div class="wl-stack" data-space="md"><WlTag variant="blue">Черновик</WlTag><h3 class="wl-text-subheading">План выпуска</h3><p class="wl-text-body">Панель {{ positions[position] }} содержит подробности, а footer — действия. Escape и кнопка закрытия возвращают к странице.</p></div><template #footer><WlButton @click="visible = false">Закрыть детали</WlButton><WlButton variant="primary" @click="saved = true; visible = false">Сохранить детали</WlButton></template></WlDrawer>
    <p class="wl-text-small" role="status">{{ saved ? 'Детали сохранены в локальном примере.' : 'Откройте панель с любой стороны.' }}</p>
  </div>
</template>

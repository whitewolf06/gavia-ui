<script setup lang="ts">
import { ref } from "vue";
import { WlPopover, WlButton, WlCheckbox, WlTag, type WlPopoverExpose } from "../../../../../../packages/ui-kit/src";
const panel = ref<WlPopoverExpose | null>(null);
const motion = ref(true);
const message = ref("Поповер закрыт.");
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="motion">Анимация поповера</WlCheckbox>
    <div><WlButton @click="panel?.toggle($event)">Сведения о материале</WlButton></div>
    <WlPopover ref="panel" aria-label="Сведения о материале" :motion="motion" :pt="{ root: { style: { width: 'min(320px, calc(100vw - 16px))', maxWidth: 'calc(100vw - 16px)' } } }" @open="message = 'Поповер открыт.'" @close="message = 'Поповер закрыт.'"><div class="showcase-popover wl-stack" data-space="md"><WlTag variant="green">Доступен команде</WlTag><h3 class="wl-text-subheading">План выпуска</h3><p class="wl-text-body">Лёгкая панель привязана к кнопке и закрывается кликом снаружи или Escape.</p><div><WlButton size="sm" @click="panel?.hide()">Готово</WlButton></div></div></WlPopover>
    <p class="wl-text-small" role="status">{{ message }}</p>
  </div>
</template>
<style scoped>
.showcase-popover { max-width: min(280px, calc(100vw - 40px)); }
</style>

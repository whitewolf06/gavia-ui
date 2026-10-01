<script setup lang="ts">
import { ref } from "vue";
import { WlSidebar, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref('materials');
const mobileOpen = ref(false);
const pinned = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="mobileOpen = true">Открыть навигацию</WlButton><WlSidebar v-model="active" v-model:mobile-open="mobileOpen" v-model:pinned="pinned" brand="Команда" brand-mark="К" :groups="[{ id: 'main', items: [{ key: 'materials', label: 'Материалы', icon: 'file' }, { key: 'settings', label: 'Настройки', icon: 'settings' }] }]" v-bind="preview" />
  </div>
</template>

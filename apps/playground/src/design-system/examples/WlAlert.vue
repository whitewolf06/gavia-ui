<script setup lang="ts">
import { ref } from "vue";
import { WlAlert, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const visible = ref(true);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAlert v-if="visible" title="Изменения сохранены" closable v-bind="preview" @close="visible = false">Можно продолжить работу.<template #action><WlButton size="sm" variant="ghost" @click="visible = false">Понятно</WlButton></template></WlAlert><WlButton v-else @click="visible = true">Показать уведомление</WlButton>
  </div>
</template>

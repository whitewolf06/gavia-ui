<script setup lang="ts">
import { WlButton, useWlToast } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const toast = useWlToast();
</script>

<template>
  <div class="wl-stack" data-space="md">
    <!-- WlToast монтируется один раз в App.vue; см. подключение ниже. -->
    <div class="wl-inline" data-space="sm"><WlButton @click="toast.ok('Материал сохранён')">Успех</WlButton><WlButton @click="toast.err('Не удалось сохранить', 'Повторите попытку.')">Ошибка</WlButton></div>
  </div>
</template>

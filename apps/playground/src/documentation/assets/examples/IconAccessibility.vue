<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlIcon, WlIconButton } from "../../../../../../packages/ui-kit/src";
const count = ref(0);
const message = ref("Уведомления ещё не открывали.");
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlIcon name="folder" :size="20" /><span class="wl-text-body">Материалы</span></div>
    <p class="wl-text-small wl-text-muted">Объект назван текстом. Иконка рядом декоративная и скрыта от вспомогательных технологий.</p>
    <div class="wl-inline" data-space="md"><span role="img" aria-label="Защищённое соединение"><WlIcon name="shield" :size="24" /></span><p class="wl-text-small">Имя контейнера описывает самостоятельное изображение.</p></div>
    <div class="wl-inline" data-space="sm">
      <WlButton variant="primary" @click="count++"><template #icon><WlIcon name="plus" :size="18" /></template>Добавить материал</WlButton>
      <WlIconButton icon="bell" aria-label="Открыть уведомления" @click="message = 'Уведомления открыты.'" />
    </div>
    <p class="wl-text-small" role="status">Добавлено материалов: {{ count }}. {{ message }}</p>
  </section>
</template>

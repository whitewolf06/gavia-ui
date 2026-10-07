<script setup lang="ts">
import { ref } from "vue";
import { WlIconButton, WlIcon, type WlIconButtonVariant } from "../../../../../../packages/ui-kit/src";
const variants = ["ghost", "secondary", "soft"] as const satisfies readonly WlIconButtonVariant[];
const active = ref(false);
const message = ref("Нажмите кнопку с иконкой.");
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlIconButton v-for="variant in variants" :key="variant" icon="search" :variant="variant" :aria-label="'Поиск — ' + variant" @click="message = 'Выбран поиск: ' + variant" /></div>
    <div class="wl-inline" data-space="md">
      <WlIconButton icon="bell" :count="4" aria-label="Уведомления: 4 непрочитанных" @click="message = 'Открыты уведомления'" />
      <WlIconButton icon="bell" dot variant="soft" aria-label="Есть новые уведомления" @click="message = 'Прочитаны новые уведомления'" />
      <WlIconButton icon="user" variant="secondary" size="sm" aria-label="Профиль — маленькая кнопка" @click="message = 'Открыт профиль'" />
      <WlIconButton icon="plus" :active="active" :aria-pressed="active" aria-label="Режим добавления" @click="active = !active" />
      <WlIconButton icon="trash" disabled aria-label="Удаление недоступно" />
      <WlIconButton aria-label="Избранное — свой слот" @click="message = 'Открыто избранное'"><WlIcon name="star" :size="18" /></WlIconButton>
    </div>
    <p class="wl-text-small" role="status">{{ message }} Режим добавления: {{ active ? 'включён' : 'выключен' }}.</p>
  </div>
</template>

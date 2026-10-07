<script setup lang="ts">
import { ref } from "vue";
import { WlAvatar, WlIcon, WlCheckbox, type WlAvatarSize } from "../../../../../../packages/ui-kit/src";
const sizes = [24, 28, 32, 36, 48] as const satisfies readonly WlAvatarSize[];
const imageEnabled = ref(true);
const image = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#2563eb"/><circle cx="24" cy="18" r="8" fill="#fff"/><path d="M10 44c0-18 28-18 28 0" fill="#fff"/></svg>');
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlAvatar v-for="size in sizes" :key="size" label="ДГ" :size="size" role="img" :aria-label="'Дмитрий — аватар ' + size + ' пикселей'" /></div>
    <div class="wl-inline" data-space="lg"><div class="wl-inline" data-space="xs"><WlAvatar label="МК" :size="36" presence="online" /><span class="wl-text-small">Мария — онлайн</span></div><div class="wl-inline" data-space="xs"><WlAvatar label="ДС" :size="36" presence="busy" /><span class="wl-text-small">Денис — занят</span></div><div class="wl-inline" data-space="xs"><WlAvatar label="ЕВ" :size="36" presence="offline" /><span class="wl-text-small">Елена — офлайн</span></div></div>
    <WlCheckbox v-model="imageEnabled">Использовать локальное изображение</WlCheckbox>
    <div class="wl-inline" data-space="md"><WlAvatar :image="imageEnabled ? image : undefined" :label="imageEnabled ? 'Аватар Дмитрия' : 'ДГ'" :size="48" role="img" aria-label="Дмитрий — изображение или инициалы" /><WlAvatar :size="48" role="img" aria-label="Пользователь без фотографии"><WlIcon name="user" :size="24" /></WlAvatar></div>
  </div>
</template>

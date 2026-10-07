<script setup lang="ts">
import { ref } from "vue";
import { WlNavItem, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const active = ref<"tasks" | "notes" | "profile">("tasks");
const collapsed = ref(false);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="collapsed">Свернуть подписи пунктов</WlCheckbox>
    <nav class="showcase-nav wl-stack" data-space="xs" aria-label="Разделы рабочего пространства">
      <WlNavItem label="Задачи" icon="check" :badge="12" :active="active === 'tasks'" :collapsed="collapsed" @click="active = 'tasks'" />
      <WlNavItem label="Заметки" icon="edit" :badge="4" :active="active === 'notes'" :collapsed="collapsed" @click="active = 'notes'" />
      <WlNavItem label="Профиль" icon="user" :active="active === 'profile'" :collapsed="collapsed" @click="active = 'profile'"><span>Мой профиль</span></WlNavItem>
      <WlNavItem label="Архив" icon="trash" disabled :collapsed="collapsed" />
      <WlNavItem label="Документация" icon="file" href="?view=docs" :collapsed="collapsed" />
    </nav>
    <p class="wl-text-small" role="status">Выбран раздел: {{ { tasks: 'Задачи', notes: 'Заметки', profile: 'Профиль' }[active] }}.</p>
  </div>
</template>
<style scoped>
.showcase-nav { max-width: 260px; }
</style>

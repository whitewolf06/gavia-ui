<script setup lang="ts">
import { ref } from "vue";
import { WlSidebar, WlButton, WlIcon, type WlSidebarGroup, type WlSidebarItem } from "../../../../../../packages/ui-kit/src";
const active = ref("materials");
const pinned = ref(true);
const mobileOpen = ref(false);
const groups: WlSidebarGroup[] = [{ id: "work", label: "Работа", items: [{ key: "materials", label: "Материалы", icon: "file", badge: 12 }, { key: "tasks", label: "Задачи", icon: "check", badge: 3 }] }, { id: "team", label: "Команда", separator: true, items: [{ key: "people", label: "Участники", icon: "user" }, { key: "archive", label: "Архив", icon: "folder", disabled: true }] }];
const footerItems: WlSidebarItem[] = [{ key: "settings", label: "Настройки", icon: "settings" }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="pinned = !pinned">{{ pinned ? 'Открепить панель' : 'Закрепить панель' }}</WlButton><WlButton class="showcase-sidebar-mobile" size="sm" @click="mobileOpen = true">Открыть мобильную панель</WlButton></div>
    <div class="showcase-sidebar-stage">
      <WlSidebar v-model="active" v-model:pinned="pinned" v-model:mobile-open="mobileOpen" :groups="groups" :footer-items="footerItems" brand="Команда" brand-mark="К" aria-label="Навигация примера команды"><template #brand-mark><span class="showcase-sidebar-mark"><WlIcon name="grid" :size="18" /></span></template><template #footer="{ expanded }"><p v-if="expanded" class="wl-text-small wl-text-muted">Локальный пример</p></template></WlSidebar>
      <div class="showcase-sidebar-content wl-stack" data-space="md"><h3 class="wl-text-subheading">Активный пункт: {{ active }}</h3><p class="wl-text-body">Hover раскрывает незакреплённую панель. На mobile кнопка открывает drawer; выбор пункта закрывает его.</p><p class="wl-text-small" role="status">Закреплена: {{ pinned ? 'да' : 'нет' }}. Мобильная панель: {{ mobileOpen ? 'открыта' : 'закрыта' }}.</p></div>
    </div>
  </div>
</template>
<style scoped>
.showcase-sidebar-stage { height: 380px; display: flex; min-width: 0; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); }
.showcase-sidebar-content { min-width: 0; flex: 1; padding: var(--wl-space-lg); overflow: auto; }
.showcase-sidebar-mark { display: inline-flex; align-items: center; justify-content: center; padding: var(--wl-space-xs); }
.showcase-sidebar-mobile { display: none; }
@media (max-width: 900px) { .showcase-sidebar-mobile { display: inline-flex; } }
</style>

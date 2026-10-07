<script setup lang="ts">
import { WlIcon, type WlIconName } from "../../../../../../packages/ui-kit/src";
const names = ["plus", "search", "check", "trash", "folder", "bell"] as const satisfies readonly WlIconName[];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="lg"><span v-for="name in names" :key="name" class="wl-stack" data-space="xs"><WlIcon :name="name" :size="24" /><code class="wl-text-small">{{ name }}</code></span></div>
    <div class="wl-inline" data-space="md"><span v-for="size in [14, 18, 24, 32]" :key="size" class="wl-inline" data-space="xs"><WlIcon name="search" :size="size" /><span class="wl-text-small">{{ size }}px</span></span><span class="wl-text-body"><WlIcon name="check" size="1em" /> размер 1em</span></div>
    <div class="wl-inline" data-space="md"><span class="wl-inline" data-space="xs"><WlIcon name="pi pi-search" /><span class="wl-text-small">Совместимое имя pi pi-search</span></span><span role="img" aria-label="Пользовательский знак подтверждения"><WlIcon :size="24"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m7 12 3 3 7-7" /></svg></WlIcon></span><span class="wl-text-small">SVG в default-слоте без name</span></div>
    <p class="wl-text-small wl-text-muted">Встроенные SVG декоративные. Значимую иконку подпишите на кнопке или на внешнем role="img". Полный каталог остаётся в разделе «Иконки» документации.</p>
  </div>
</template>

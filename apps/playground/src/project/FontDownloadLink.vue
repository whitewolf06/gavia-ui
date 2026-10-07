<script setup lang="ts">
import WlIcon from "../../../../packages/ui-kit/src/components/WlIcon.vue";
import { gaviaFontDownloadName, gaviaFontDownloadUrl } from "./font-download";

withDefaults(defineProps<{ variant?: "primary" | "secondary" }>(), { variant: "primary" });
</script>

<template>
  <a :href="gaviaFontDownloadUrl" :download="gaviaFontDownloadName"
    class="wl-btn wl-btn--md pg-font-download" :class="'wl-btn--' + variant"
    data-wl="font-download" :data-variant="variant" data-size="md">
    <WlIcon name="download" :size="16" />
    <span class="wl-btn__label"><slot>Скачать шрифт Gavia</slot></span>
  </a>
</template>

<style>
@layer wl.components {
  .pg-font-download { min-height: 44px; max-width: 100%; text-decoration: none; font-style: normal; }
}
</style>

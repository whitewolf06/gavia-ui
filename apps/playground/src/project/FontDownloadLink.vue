<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
withDefaults(defineProps<{ variant?: "primary" | "secondary" }>(), { variant: "primary" });
const { t } = usePlaygroundI18n();
import { WlIcon } from "gavia-ui";
import { gaviaFontDownloadName, gaviaFontDownloadUrl } from "./font-download";

</script>

<template>
  <a
    :href="gaviaFontDownloadUrl"
    :download="gaviaFontDownloadName"
    class="wl-btn wl-btn--md pg-font-download"
    :class="'wl-btn--' + variant"
    data-wl="font-download"
    :data-variant="variant"
    data-size="md"
  >
    <WlIcon name="download" :size="16" />
    <span class="wl-btn__label"><slot>{{ t('shell.project.FontDownloadLink.text495') }}</slot></span>
  </a>
</template>

<style>
@layer wl.components {
  .pg-font-download { min-height: 44px; max-width: 100%; text-decoration: none; font-style: normal; }
}
</style>

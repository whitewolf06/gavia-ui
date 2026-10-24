<script setup lang="ts">
import { {{name}} } from "gavia-ui";
import { usePlaygroundI18n } from "../../../i18n";

const { t } = usePlaygroundI18n();
</script>

<template>
  <div class="wl-stack" data-space="md">
    <{{name}}>{{ t("documentation.strings.{{textKey}}Label") }}</{{name}}>
    <p>{{ t("documentation.strings.{{textKey}}Description") }}</p>
  </div>
</template>

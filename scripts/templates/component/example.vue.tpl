<script setup lang="ts">
import { {{name}} } from "gavia-ui";
import { usePlaygroundI18n } from "../../i18n";

defineProps<{ preview?: Partial<InstanceType<typeof {{name}}>["$props"]> }>();
const { t } = usePlaygroundI18n();
</script>

<template>
  <{{name}} v-bind="preview">{{ t("documentation.strings.{{textKey}}Label") }}</{{name}}>
</template>

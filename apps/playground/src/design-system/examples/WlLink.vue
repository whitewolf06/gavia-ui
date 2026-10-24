<script setup lang="ts">
import { WlLink } from "gavia-ui";
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlLink href="?view=docs" v-bind="preview">{{ t('documentation.strings.review_link_internal') }}</WlLink>
    <WlLink href="https://github.com/whitewolf06/gavia-ui" external>{{ t('documentation.strings.review_link_external') }}</WlLink>
  </div>
</template>

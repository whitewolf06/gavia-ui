<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlBreadcrumbs } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlBreadcrumbs :items="[{ label: t('examples.materials_0015'), href: '#ds-components' }, { label: t('examples.team_guide_0016') }]" v-bind="preview" />
  </div>
</template>

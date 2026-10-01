<script setup lang="ts">
import { WlBreadcrumbs } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlBreadcrumbs :items="[{ label: 'Материалы', href: '#ds-components' }, { label: 'Руководство команды' }]" v-bind="preview" />
  </div>
</template>

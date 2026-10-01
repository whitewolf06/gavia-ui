<script setup lang="ts">
import { WlStatCard } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlStatCard icon="task" label="Завершено" value="24" description="Из 32 материалов" :progress="75" v-bind="preview"><template #footer>За последнюю неделю</template></WlStatCard>
  </div>
</template>

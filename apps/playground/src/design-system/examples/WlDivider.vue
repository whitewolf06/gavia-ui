<script setup lang="ts">
import { WlDivider } from "../../../../../packages/ui-kit/src";
type PreviewProps = Partial<InstanceType<typeof WlDivider>["$props"]>;
defineProps<{ preview?: PreviewProps }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlDivider v-bind="preview">Дополнительные сведения</WlDivider>
  </div>
</template>

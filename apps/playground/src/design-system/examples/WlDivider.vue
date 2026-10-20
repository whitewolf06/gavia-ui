<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: PreviewProps }>();
const { t } = usePlaygroundI18n();
import { WlDivider } from "gavia-ui";
type PreviewProps = Partial<InstanceType<typeof WlDivider>["$props"]>;
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlDivider v-bind="preview">{{ t("examples.additional_details_0048") }}</WlDivider>
  </div>
</template>

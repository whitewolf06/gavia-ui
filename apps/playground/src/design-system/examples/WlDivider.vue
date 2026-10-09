<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { WlDivider } from "../../../../../packages/ui-kit/src";
type PreviewProps = Partial<InstanceType<typeof WlDivider>["$props"]>;
defineProps<{ preview?: PreviewProps }>();

</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlDivider v-bind="preview">{{ t("examples.additional_details_0048") }}</WlDivider>
  </div>
</template>

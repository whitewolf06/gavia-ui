<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlCard, WlButton } from "../../../../../packages/ui-kit/src";
type PreviewProps = Partial<InstanceType<typeof WlCard>["$props"]>;
defineProps<{ preview?: PreviewProps }>();
const saved = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCard v-bind="preview"><template #title>{{ t("examples.team_guide_0016") }}</template><template #subtitle>{{ t("examples.updated_october_1_0023") }}</template><p class="wl-text-body">{{ t("examples.team_structure_roles_and_agreements_0024") }}</p><template #footer><WlButton size="sm" @click="saved = !saved">{{ saved ? t("examples.saved_0025") : t("examples.save_0026") }}</WlButton></template></WlCard>
  </div>
</template>

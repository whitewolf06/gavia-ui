<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: PreviewProps }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlCard } from "gavia-ui";
import { ref } from "vue";
type PreviewProps = Partial<InstanceType<typeof WlCard>["$props"]>;
const saved = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCard v-bind="preview">
      <template #title>{{ t("examples.team_guide_0016") }}</template>
      <template #subtitle>{{ t("examples.updated_october_1_0023") }}</template>
      <p class="wl-text-body">{{ t("examples.team_structure_roles_and_agreements_0024") }}</p>
      <template #footer>
        <WlButton size="sm" @click="saved = !saved">{{ saved ? t("examples.saved_0025") : t("examples.save_0026") }}</WlButton>
      </template>
    </WlCard>
  </div>
</template>

<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlEmpty, WlButton } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const added = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlEmpty v-if="!added" icon="file" :title="t('examples.no_materials_yet_0052')" :description="t('examples.create_the_first_material_0053')" v-bind="preview"><template #action><WlButton @click="added = true">{{ t("examples.add_material_0054") }}</WlButton></template></WlEmpty><p v-else role="status">{{ t("examples.material_added_0055") }}</p>
  </div>
</template>

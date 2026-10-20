<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlDrawer } from "gavia-ui";
import { ref } from "vue";
const visible = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="visible = true">{{ t("examples.open_drawer_0049") }}</WlButton><WlDrawer
      v-model:visible="visible"
      :header="t('examples.about_the_material_0050')"
      size="md"
      :dismissible="true"
      v-bind="preview"
    >
      <p class="wl-text-body">{{ t("examples.material_details_appear_over_the_page_0051") }}</p>
      <template #footer><WlButton @click="visible = false">{{ t("examples.done_0047") }}</WlButton></template>
    </WlDrawer>
  </div>
</template>

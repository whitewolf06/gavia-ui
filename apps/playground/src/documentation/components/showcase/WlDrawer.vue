<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlDrawer, WlButton, WlCheckbox, WlTag, type WlDrawerPosition } from "../../../../../../packages/ui-kit/src";
const visible = ref(false);
const position = ref<WlDrawerPosition>("right");
const motion = ref(true);
const saved = ref(false);
const positions = { right: t("examples.right_0417"), left: t("examples.left_0418"), top: t("examples.top_0419"), bottom: t("examples.bottom_0420"), full: t("examples.full_screen_0421") } satisfies Record<WlDrawerPosition, string>;
function open(value: WlDrawerPosition): void { position.value = value; visible.value = true; }
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="motion">{{ t("examples.drawer_animation_0422") }}</WlCheckbox>
    <div class="wl-inline" data-space="sm"><WlButton v-for="(label, key) in positions" :key="key" size="sm" @click="open(key)">{{ label }}</WlButton></div>
    <WlDrawer v-model:visible="visible" :header="t('examples.material_details_0423')" :position="position" :motion="motion" :pt="{ footer: { style: { flexWrap: 'wrap' } } }"><div class="wl-stack" data-space="md"><WlTag variant="blue">{{ t("examples.draft_0291") }}</WlTag><h3 class="wl-text-subheading">{{ t("examples.release_plan_0371") }}</h3><p class="wl-text-body">{{ t("examples.drawer_0424") }} {{ positions[position] }} {{ t("examples.contains_the_details_its_footer_holds_the_actions_escape_and_t_0425") }}</p></div><template #footer><WlButton @click="visible = false">{{ t("examples.close_details_0426") }}</WlButton><WlButton variant="primary" @click="saved = true; visible = false">{{ t("examples.save_details_0427") }}</WlButton></template></WlDrawer>
    <p class="wl-text-small" role="status">{{ saved ? t("examples.details_saved_in_the_local_example_0428") : t("examples.open_the_drawer_from_any_side_0429") }}</p>
  </div>
</template>

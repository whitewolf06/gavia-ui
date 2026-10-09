<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPopover, WlButton, WlCheckbox, WlTag, type WlPopoverExpose } from "../../../../../../packages/ui-kit/src";
const panel = ref<WlPopoverExpose | null>(null);
const motion = ref(true);
const message = ref(t("examples.popover_closed_0524"));
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="motion">{{ t("examples.popover_animation_0525") }}</WlCheckbox>
    <div><WlButton @click="panel?.toggle($event)">{{ t("examples.material_details_0045") }}</WlButton></div>
    <WlPopover ref="panel" :aria-label="t('examples.material_details_0045')" :motion="motion" :pt="{ root: { style: { width: 'min(320px, calc(100vw - 16px))', maxWidth: 'calc(100vw - 16px)' } } }" @open="message = t('examples.popover_opened_0526')" @close="message = t('examples.popover_closed_0524')"><div class="showcase-popover wl-stack" data-space="md"><WlTag variant="green">{{ t("examples.available_to_the_team_0527") }}</WlTag><h3 class="wl-text-subheading">{{ t("examples.release_plan_0371") }}</h3><p class="wl-text-body">{{ t("examples.the_panel_is_anchored_to_the_button_close_it_by_clicking_outsi_0528") }}</p><div><WlButton size="sm" @click="panel?.hide()">{{ t("examples.done_0047") }}</WlButton></div></div></WlPopover>
    <p class="wl-text-small" role="status">{{ message }}</p>
  </div>
</template>
<style scoped>
.showcase-popover { max-width: min(280px, calc(100vw - 40px)); }
</style>

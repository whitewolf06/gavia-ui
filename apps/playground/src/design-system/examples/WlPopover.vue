<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlPopover, WlButton, WlDatePicker, WlDialog, WlSelect, type WlPopoverExpose } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const popover = ref<WlPopoverExpose | null>(null);
const dialogPopover = ref<WlPopoverExpose | null>(null);
const dialogVisible = ref(false);
const type = ref("all");
const dialogType = ref("all");
const dialogDate = ref<string | null>("2026-10-05");
const options = [
  { label: t("examples.all_materials_0091"), value: "all" },
  { label: t("examples.task_deadlines_0092"), value: "task_deadline" }
];
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlButton @click="popover?.toggle($event)">{{ t("examples.details_0093") }}</WlButton>
    <WlPopover ref="popover" :aria-label="t('examples.material_details_0045')" v-bind="preview">
      <div class="wl-stack" data-space="md">
        <p class="wl-text-body">{{ t("examples.the_panel_opens_next_to_the_button_0094") }}</p>
        <div class="wl-inline" data-space="md">
          <WlSelect v-model="type" :options="options" option-label="label" option-value="value" :aria-label="t('examples.material_type_0095')" />
          <WlButton size="sm" @click="popover?.hide()">{{ t("examples.close_0096") }}</WlButton>
        </div>
      </div>
    </WlPopover>
    <output role="status" :aria-label="t('examples.selected_type_0097')" class="wl-text-body">{{ type }}</output>
    <WlButton @click="dialogVisible = true">{{ t("examples.nested_filters_0098") }}</WlButton>
    <WlDialog v-model:visible="dialogVisible" :header="t('examples.nested_filters_0098')">
      <div class="wl-stack" data-space="md">
        <div><WlButton @click="dialogPopover?.toggle($event)">{{ t("examples.open_filters_0099") }}</WlButton></div>
        <WlPopover ref="dialogPopover" :aria-label="t('examples.filters_in_a_dialog_0100')">
          <div class="wl-stack" data-space="md">
            <WlSelect v-model="dialogType" :options="options" option-label="label" option-value="value" :aria-label="t('examples.type_in_dialog_0101')" />
            <WlDatePicker v-model="dialogDate" :aria-label="t('examples.date_in_dialog_0102')" />
            <div><WlButton size="sm">{{ t("examples.button_inside_filters_0103") }}</WlButton></div>
          </div>
        </WlPopover>
        <dl class="wl-inline" data-space="lg">
          <div class="wl-stack" data-space="xs">
            <dt class="wl-text-small wl-text-muted">{{ t("examples.type_0104") }}</dt>
            <dd><output role="status" :aria-label="t('examples.selected_type_in_dialog_0105')" class="wl-text-body">{{ dialogType }}</output></dd>
          </div>
          <div class="wl-stack" data-space="xs">
            <dt class="wl-text-small wl-text-muted">{{ t("examples.date_0106") }}</dt>
            <dd><output role="status" :aria-label="t('examples.selected_date_in_dialog_0107')" class="wl-text-body">{{ dialogDate }}</output></dd>
          </div>
        </dl>
      </div>
      <template #footer><WlButton @click="dialogVisible = false">{{ t("examples.done_0047") }}</WlButton></template>
    </WlDialog>
  </div>
</template>

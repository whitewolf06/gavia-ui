<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const props = defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlCalendar } from "gavia-ui";
import { computed, ref } from "vue";
const value = ref("2026-10-15");
const selected = ref(["2026-10-15", "2026-10-17"]);
const month = ref("2026-10");
const multiple = computed(() => props.preview?.multiple !== false);
const forwardedPreview = computed(() => {
  const attributes = { ...props.preview };
  delete attributes.multiple;
  return attributes;
});
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCalendar
      v-if="multiple"
      v-model="selected"
      v-model:month="month"
      multiple
      :events="[{ date: '2026-10-15', label: t('examples.overview_0000'), tone: 'blue' }]"
      v-bind="forwardedPreview"
    >
      <template #day="{ day, events }">
        <span>{{ day }}</span><span v-if="events.length" aria-hidden="true"> · {{ events.length }}</span>
      </template>
    </WlCalendar>
    <WlCalendar
      v-else
      v-model="value"
      v-model:month="month"
      :events="[{ date: '2026-10-15', label: t('examples.overview_0000'), tone: 'blue' }]"
      v-bind="forwardedPreview"
    />
    <p class="wl-text-small" role="status">{{ t("examples.selected_0022") }} {{ multiple ? selected.join(', ') : value }}</p>
  </div>
</template>

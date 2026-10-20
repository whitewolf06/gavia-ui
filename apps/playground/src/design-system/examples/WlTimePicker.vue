<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlField, WlTimePicker } from "gavia-ui";
import { ref } from "vue";
const value = ref<string | null>("09:30");
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlField
      id="example-time"
      v-slot="field"
      :label="t('examples.meeting_time_0140')"
      :hint="t('examples.from_08_00_to_18_00_clearing_the_field_sets_the_model_to_null_0141')"
    >
      <WlTimePicker
        :id="field.id"
        v-model="value"
        :aria-describedby="field.ariaDescribedby"
        min-time="08:00"
        max-time="18:00"
        :hour-format="12"
        :step="900"
        :allowed-intervals="[{ start: '08:00', end: '12:00' }, { start: '13:00', end: '18:00' }]"
        v-bind="preview"
      />
    </WlField>
    <p class="wl-text-small" role="status">{{ t("examples.selected_0022") }} {{ value ?? t("examples.no_time_set_0142") }}</p>
  </div>
</template>

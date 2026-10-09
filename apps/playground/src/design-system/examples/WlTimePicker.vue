<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlTimePicker, WlField } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string | null>("09:30");
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlField :label="t('examples.meeting_time_0140')" id="example-time" :hint="t('examples.from_08_00_to_18_00_clearing_the_field_sets_the_model_to_null_0141')" v-slot="field">
      <WlTimePicker v-model="value" :id="field.id" :aria-describedby="field.ariaDescribedby"
        min-time="08:00" max-time="18:00" v-bind="preview" />
    </WlField>
    <p class="wl-text-small" role="status">{{ t("examples.selected_0022") }} {{ value ?? t("examples.no_time_set_0142") }}</p>
  </div>
</template>

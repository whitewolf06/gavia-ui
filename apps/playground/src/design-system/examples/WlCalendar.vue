<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const props = defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlCalendar, WlCheckbox } from "gavia-ui";
import { computed, ref } from "vue";
const value = ref("2026-10-15");
const selected = ref(["2026-10-15", "2026-10-17"]);
const month = ref("2026-10");
const availability = ref(false);
const activated = ref("");
const activationCount = ref(0);
const disabledDates = computed(() => availability.value ? ["2026-10-16", "2026-10-18"] : []);
function activate(iso: string): void {
  activated.value = iso;
  activationCount.value += 1;
}
const multiple = computed(() => props.preview?.multiple !== false);
const forwardedPreview = computed(() => {
  const attributes = { ...props.preview };
  delete attributes.multiple;
  return attributes;
});
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlCheckbox v-model="availability">{{ t("examples.calendarAvailability") }}</WlCheckbox>
    <WlCalendar
      v-if="multiple"
      v-model="selected"
      v-model:month="month"
      multiple
      :disabled-dates="disabledDates"
      :events="[{ date: '2026-10-15', label: t('examples.overview_0000'), tone: 'blue' }]"
      v-bind="forwardedPreview"
      @select="activate"
    >
      <template #day="{ day, events, disabled }">
        <span>{{ day }}</span><span v-if="events.length && !disabled" aria-hidden="true"> · {{ events.length }}</span>
      </template>
    </WlCalendar>
    <WlCalendar
      v-else
      v-model="value"
      v-model:month="month"
      :disabled-dates="disabledDates"
      :events="[{ date: '2026-10-15', label: t('examples.overview_0000'), tone: 'blue' }]"
      v-bind="forwardedPreview"
      @select="activate"
    />
    <p class="wl-text-small" role="status">{{ t("examples.selected_0022") }} {{ multiple ? selected.join(', ') : value }}</p>
    <p class="wl-text-small" data-testid="calendar-activation">
      {{ t("examples.calendarActivation") }} {{ activated }} · {{ activationCount }}
    </p>
  </div>
</template>

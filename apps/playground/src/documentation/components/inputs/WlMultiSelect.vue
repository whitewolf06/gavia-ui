<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, WlField, WlMultiSelect } from "gavia-ui";
import { ref } from "vue";
const selected = ref<string[]>(["design", "code"]);
const options = [{ id: "design", label: t("examples.design_0079") }, { id: "code", label: t("examples.development_0080") }, { id: "docs", label: t("examples.documentation_0340") }, { id: "qa", label: t("examples.checks_0757") }];
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlMultiSelect">
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.chips_filter_and_counter_0758") }}</h3>
      <div class="wl-grid" data-space="lg">
        <WlField
          id="docs-multi-chips"
          v-slot="{ id, ariaDescribedby }"
          :label="t('examples.areas_with_a_filter_0759')"
          :hint="t('examples.type_a_name_in_the_filter_selected_chips_can_be_removed_indivi_0760')"
        ><WlMultiSelect
          :id="id"
          v-model="selected"
          :options="options"
          option-label="label"
          option-value="id"
          display="chip"
          filter
          :aria-describedby="ariaDescribedby"
          :placeholder="t('examples.choose_areas_0761')"
        /></WlField>
        <WlField id="docs-multi-counter" v-slot="{ id }" :label="t('examples.selected_areas_0762')"><WlMultiSelect
          :id="id"
          v-model="selected"
          :options="options"
          option-label="label"
          option-value="id"
          display="comma"
          :max-selected-labels="1"
          :placeholder="t('examples.choose_areas_0761')"
        /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.enter_toggles_the_selected_item_the_list_stays_open_for_the_ne_0763") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.sizes_and_states_0764") }}</h3>
      <div class="wl-grid" data-space="lg">
        <WlField
          v-for="size in ['sm', 'md', 'lg'] as const"
          :id="`docs-multi-${size}`"
          :key="size"
          v-slot="{ id }"
          :label="`${t('examples.areas_0765')}${size}`"
        ><WlMultiSelect
          :id="id"
          v-model="selected"
          :size="size"
          :options="options"
          option-label="label"
          option-value="id"
        /></WlField>
        <WlField id="docs-multi-compact" v-slot="{ id }" :label="t('examples.compact_multiselect_0766')"><WlMultiSelect
          :id="id"
          v-model="selected"
          density="compact"
          :options="options"
          option-label="label"
          option-value="id"
        /></WlField>
        <WlField
          id="docs-multi-invalid"
          v-slot="{ id, ariaDescribedby, invalid }"
          :label="t('examples.at_least_one_area_0767')"
          :error="selected.length ? undefined : t('examples.choose_at_least_one_area_0768')"
        ><WlMultiSelect
          :id="id"
          v-model="selected"
          :options="options"
          option-label="label"
          option-value="id"
          :invalid="invalid"
          :aria-describedby="ariaDescribedby"
          :placeholder="t('examples.choose_areas_0761')"
        /></WlField>
        <WlField id="docs-multi-disabled" v-slot="{ id }" :label="t('examples.unavailable_multiselect_0769')"><WlMultiSelect
          :id="id"
          :model-value="['design']"
          :options="options"
          option-label="label"
          option-value="id"
          display="chip"
          disabled
        /></WlField>
      </div>
      <WlButton size="sm" @click="selected = []">{{ t("examples.clear_areas_0770") }}</WlButton>
      <p class="wl-text-small" role="status">{{ t("examples.selected_0022") }} {{
        selected.length
      }}{{ t("examples.values_0771") }} {{ selected.join(', ') || t("examples.none_0306") }}.</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, WlField, WlSelect } from "gavia-ui";
import { ref } from "vue";
const area = ref<string | null>("team");
const options = [{ id: "personal", label: t("examples.personal_space_0819") }, { id: "team", label: t("examples.team_0086") }, { id: "public", label: t("examples.public_materials_0820") }];
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlSelect">
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.sizes_density_and_object_options_0821") }}</h3>
      <div class="wl-grid" data-space="lg">
        <WlField
          v-for="size in ['sm', 'md', 'lg'] as const"
          :id="`docs-select-${size}`"
          :key="size"
          v-slot="{ id }"
          :label="`${t('examples.space_0822')}${size}`"
        ><WlSelect
          :id="id"
          v-model="area"
          :size="size"
          :aria-label="`${t('examples.space_0822')}${size}`"
          :options="options"
          option-label="label"
          option-value="id"
          :placeholder="t('examples.choose_a_space_0823')"
        /></WlField>
        <WlField id="docs-select-compact" v-slot="{ id }" :label="t('examples.compact_list_0824')"><WlSelect
          :id="id"
          v-model="area"
          density="compact"
          :aria-label="t('examples.compact_list_0824')"
          :options="options"
          option-label="label"
          option-value="id"
          :placeholder="t('examples.choose_a_space_0823')"
        /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_model_stores_id_the_list_shows_label_arrow_keys_move_the_h_0825") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.error_disabled_and_clearing_0704") }}</h3>
      <div class="wl-grid" data-space="lg">
        <WlField
          id="docs-select-required"
          v-slot="{ id, ariaDescribedby, invalid }"
          :label="t('examples.required_space_0826')"
          :error="area == null ? t('examples.choose_a_space_0827') : undefined"
        ><WlSelect
          :id="id"
          v-model="area"
          :options="options"
          option-label="label"
          option-value="id"
          :invalid="invalid"
          :aria-label="t('examples.required_space_0826')"
          :aria-describedby="ariaDescribedby"
          :placeholder="t('examples.choose_a_space_0823')"
        /></WlField>
        <WlField id="docs-select-disabled" v-slot="{ id }" :label="t('examples.unavailable_list_0828')"><WlSelect
          :id="id"
          model-value="team"
          :options="options"
          option-label="label"
          option-value="id"
          :aria-label="t('examples.unavailable_list_0828')"
          disabled
        /></WlField>
      </div>
      <WlButton size="sm" @click="area = null">{{ t("examples.clear_selection_0829") }}</WlButton>
      <p class="wl-text-small" role="status">{{ t("examples.model_value_0683") }} {{ area ?? 'null' }}.</p>
    </section>
  </div>
</template>

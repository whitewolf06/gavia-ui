<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlIcon, WlInput } from "../../../../../../packages/ui-kit/src";
const title = ref(t("examples.team_plan_0740"));
const amount = ref("1200");
const login = ref("");
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlInput">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.sizes_and_density_0741") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-input-${size}`" :label="`${t('examples.title_0742')}${size}`" v-slot="{ id }">
          <WlInput :id="id" v-model="title" :size="size" />
        </WlField>
        <WlField id="docs-input-compact" :label="t('examples.compact_field_0743')" v-slot="{ id }"><WlInput :id="id" v-model="title" density="compact" /></WlField>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.slots_and_states_0744") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-input-cost" :label="t('examples.cost_0745')" :hint="t('examples.the_icon_and_unit_of_measurement_supplement_the_label_0746')" v-slot="{ id, ariaDescribedby }">
          <WlInput :id="id" v-model="amount" inputmode="decimal" :aria-describedby="ariaDescribedby"><template #prefix><WlIcon name="file" :size="16" /></template><template #suffix><span class="wl-text-small">₽</span></template></WlInput>
        </WlField>
        <WlField id="docs-input-login" :label="t('examples.username_0747')" :error="login.trim() ? undefined : t('examples.enter_a_username_0748')" required v-slot="{ id, ariaDescribedby, invalid, required }">
          <WlInput :id="id" v-model="login" :invalid="invalid" :required="required" :aria-describedby="ariaDescribedby" :placeholder="t('examples.for_example_dmitry_0749')" />
        </WlField>
        <WlField id="docs-input-disabled" :label="t('examples.unavailable_field_0750')" v-slot="{ id }"><WlInput :id="id" :model-value="t('examples.the_title_is_set_by_an_administrator_0751')" disabled /></WlField>
      </div>
      <WlButton size="sm" @click="title = ''; amount = ''; login = ''">{{ t("examples.clear_fields_0752") }}</WlButton>
      <p class="wl-text-small" role="status">{{ t("examples.title_0753") }} {{ title || t("examples.not_set_0754") }}{{ t("examples.cost_0755") }} {{ amount || t("examples.not_set_0756") }}.</p>
    </section>
  </div>
</template>
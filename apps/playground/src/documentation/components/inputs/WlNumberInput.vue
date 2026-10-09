<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlNumberInput } from "../../../../../../packages/ui-kit/src";
const quantity = ref(3);
const budget = ref(20);
const price = ref(12.5);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlNumberInput">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.sizes_and_a_bounded_range_0772") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-number-${size}`" :label="`${t('examples.quantity_0773')}${size}`" v-slot="{ id }">
          <WlNumberInput :id="id" v-model="quantity" :size="size" :min="1" :max="10" :aria-label="`${t('examples.quantity_0773')}${size}`" :decrement-label="`${t('examples.decrease_quantity_0774')}${size}`" :increment-label="`${t('examples.increase_quantity_0775')}${size}`" />
        </WlField>
        <WlField id="docs-number-compact" :label="t('examples.step_5_compact_field_0776')" v-slot="{ id }"><WlNumberInput :id="id" v-model="budget" :min="0" :max="50" :step="5" density="compact" :aria-label="t('examples.budget_0777')" :decrement-label="t('examples.decrease_budget_0778')" :increment-label="t('examples.increase_budget_0779')" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.buttons_and_apply_step_manual_input_commits_on_enter_or_blur_a_0780") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.decimal_input_and_states_0781") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-number-price" :label="t('examples.price_step_0_5_0782')" v-slot="{ id }"><WlNumberInput :id="id" v-model="price" :min="0" :max="100" :step="0.5" inputmode="decimal" :aria-label="t('examples.price_0783')" :decrement-label="t('examples.decrease_price_0784')" :increment-label="t('examples.increase_price_0785')" /></WlField>
        <WlField id="docs-number-invalid" :label="t('examples.quantity_with_an_error_0786')" :error="t('examples.the_quantity_needs_approval_0787')" v-slot="{ id, ariaDescribedby, invalid }"><WlNumberInput :id="id" v-model="quantity" :min="1" :max="10" :invalid="invalid" :aria-describedby="ariaDescribedby" :aria-label="t('examples.quantity_with_an_error_0786')" /></WlField>
        <WlField id="docs-number-disabled" :label="t('examples.disabled_number_input_0788')" v-slot="{ id }"><WlNumberInput :id="id" :model-value="5" disabled :aria-label="t('examples.disabled_quantity_0789')" /></WlField>
      </div>
      <WlButton size="sm" @click="quantity = 3; budget = 20; price = 12.5">{{ t("examples.reset_numbers_0790") }}</WlButton>
      <p class="wl-text-small" role="status">{{ t("examples.quantity_0791") }} {{ quantity }}{{ t("examples.budget_0792") }} {{ budget }}{{ t("examples.price_0793") }} {{ price }}.</p>
    </section>
  </div>
</template>
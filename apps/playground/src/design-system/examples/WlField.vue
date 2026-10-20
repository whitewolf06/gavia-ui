<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlField, WlInput, WlSelect } from "gavia-ui";
import { computed, ref } from "vue";
const value = ref("");
const status = ref<string | null>(null);
const error = ref("");
const options = computed(() => [
  { label: t("examples.draft_0291"), value: "draft" },
  { label: t("examples.published_0165"), value: "published" }
]);
function validate(): void {
  error.value = value.value.trim() ? "" : t("examples.reviewFieldError");
}
</script>

<template>
  <form
    class="wl-stack"
    data-space="lg"
    novalidate
    @submit.prevent="validate"
  >
    <WlField
      v-slot="field"
      :label="t('examples.material_title_0056')"
      required
      :hint="t('examples.up_to_80_characters_0057')"
      :error="error"
      announce-error
      v-bind="preview"
    ><WlInput
      :id="field.id"
      v-model="value"
      :invalid="field.invalid"
      :required="field.required"
      :aria-labelledby="field.labelId"
      :aria-describedby="field.ariaDescribedby"
      maxlength="80"
    /></WlField>
    <WlField
      v-slot="field"
      :label="t('examples.status_0067')"
      :hint="t('examples.reviewFieldSelectHint')"
      optional
      orientation="horizontal"
    >
      <WlSelect
        :id="field.id"
        v-model="status"
        :options="options"
        option-label="label"
        option-value="value"
        clearable
        :aria-labelledby="field.labelId"
        :aria-describedby="field.ariaDescribedby"
      />
    </WlField>
    <div class="wl-inline" data-space="sm">
      <WlButton type="submit" size="sm">{{ t("examples.validate_fields_0451") }}</WlButton>
      <WlButton size="sm" variant="ghost" @click="value = ''; status = null; error = ''">{{ t("examples.start_over_0582") }}</WlButton>
    </div>
  </form>
</template>

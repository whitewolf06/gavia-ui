<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlField, WlInput, WlTextarea, WlButton } from "../../../../../../packages/ui-kit/src";
const email = ref("");
const note = ref("");
const error = ref(t("examples.enter_an_email_for_notifications_0443"));
const saved = ref(false);
function validate(): void { saved.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value); error.value = saved.value ? "" : t("examples.this_example_requires_an_email_such_as_name_example_org_0444"); }
</script>
<template>
  <form class="wl-stack" data-space="lg" novalidate @submit.prevent="validate">
    <WlField :label="t('examples.notification_email_0445')" required :hint="t('examples.the_address_is_used_only_in_the_local_example_0446')" :error="error"><template #default="{ id, ariaDescribedby, ariaInvalid, invalid, required }"><WlInput :id="id" v-model="email" type="email" :required="required" :invalid="invalid" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" /></template></WlField>
    <WlField :label="t('examples.material_id_0447')" :hint="t('examples.the_field_is_readable_but_cannot_be_changed_0448')"><template #default="{ id, ariaDescribedby }"><WlInput :id="id" model-value="GAV-24" readonly :aria-describedby="ariaDescribedby" /></template></WlField>
    <WlField :label="t('examples.comment_0449')" :hint="t('examples.the_label_and_hint_are_associated_with_the_textarea_through_sc_0450')"><template #default="{ id, ariaDescribedby }"><WlTextarea :id="id" v-model="note" :aria-describedby="ariaDescribedby" /></template></WlField>
    <div class="wl-inline" data-space="sm"><WlButton type="submit" size="sm" variant="primary">{{ t("examples.validate_fields_0451") }}</WlButton><WlButton size="sm" variant="ghost" @click="email = ''; error = t('examples.enter_an_email_for_notifications_0443'); saved = false">{{ t("examples.restore_field_error_0452") }}</WlButton></div>
    <p class="wl-text-small" role="status">{{ saved ? t("examples.fields_passed_local_validation_0453") : t("examples.check_the_message_below_email_0454") }}</p>
  </form>
</template>

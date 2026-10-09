<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { WlPageHeader, WlField, WlInput, WlTextarea, WlButton, WlAlert, WlSwitch } from "../../../../../packages/ui-kit/src";
const name = ref("");
const email = ref("");
const description = ref("");
const submitted = ref(false);
const pending = ref(false);
const failure = ref(false);
const outcome = ref<"idle" | "success" | "error">("idle");
const nameError = computed(() => submitted.value && !name.value.trim() ? t("examples.enter_a_name_0223") : "");
const emailError = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? t("examples.check_the_email_address_0224") : "");
watch([name, email, description], () => { outcome.value = "idle"; });
let disposed = false;
onBeforeUnmount(() => { disposed = true; });
async function save(): Promise<void> {
  if (pending.value) return;
  submitted.value = true; outcome.value = "idle";
  if (nameError.value || emailError.value) {
    await nextTick(); document.getElementById(nameError.value ? "recipe-profile-name" : "recipe-profile-email")?.focus(); return;
  }
  pending.value = true;
  // Replace this local demonstration with your application request.
  const shouldFail = failure.value;
  await new Promise<void>((resolve) => setTimeout(resolve, 400));
  if (disposed) return;
  pending.value = false; outcome.value = shouldFail ? "error" : "success";
}
</script>

<template>
  <form class="wl-stack" data-space="lg" novalidate :aria-label="t('examples.profile_form_0225')" @submit.prevent="save">
    <WlPageHeader :title="t('examples.member_profile_0226')" :description="t('examples.contact_details_and_a_short_description_0227')" :heading-level="2" size="md" />
    <WlField id="recipe-profile-name" :label="t('examples.member_name_0228')" required :error="nameError" v-slot="field"><WlInput :id="field.id" v-model="name" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" :disabled="pending" autocomplete="name" maxlength="80" required /></WlField>
    <WlField id="recipe-profile-email" :label="t('examples.member_email_0229')" required :error="emailError" :hint="t('examples.for_material_notifications_0230')" v-slot="field"><WlInput :id="field.id" v-model="email" type="email" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" :disabled="pending" autocomplete="email" required /></WlField>
    <WlField id="recipe-profile-description" :label="t('examples.about_me_0231')" :hint="t('examples.up_to_240_characters_0232')" v-slot="field"><WlTextarea :id="field.id" v-model="description" :aria-describedby="field.ariaDescribedby" :disabled="pending" maxlength="240" /><span class="wl-text-small wl-text-muted">{{ description.length }}/240</span></WlField>
    <WlSwitch v-model="failure" :disabled="pending" :aria-label="t('examples.simulate_save_failure_0233')">{{ t("examples.simulate_save_failure_0233") }}</WlSwitch>
    <WlAlert v-if="outcome === 'error'" variant="err" :title="t('examples.could_not_save_0145')">{{ t("examples.your_entries_remain_in_the_form_try_again_0234") }}<template #action><WlButton size="sm" @click="failure = false; save()">{{ t("examples.retry_saving_0235") }}</WlButton></template></WlAlert>
    <WlAlert v-if="outcome === 'success'" variant="ok" :title="t('examples.profile_saved_0236')">{{ t("examples.contact_details_updated_0237") }}</WlAlert>
    <div><WlButton variant="primary" type="submit" :loading="pending">{{ t("examples.save_profile_0238") }}</WlButton></div>
  </form>
</template>

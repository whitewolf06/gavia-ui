<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlPageHeader, WlField, WlSelect, WlSwitch, WlRadio, WlButton, WlAlert } from "../../../../../packages/ui-kit/src";
type Preferences = { frequency: string | null; email: boolean; push: boolean; access: unknown };
const saved = ref<Preferences>({ frequency: "daily", email: true, push: false, access: "team" });
const draft = ref<Preferences>({ ...saved.value });
const changed = computed(() => JSON.stringify(draft.value) !== JSON.stringify(saved.value));
const success = ref(false);
function save(): void { saved.value = { ...draft.value }; success.value = true; }
function cancel(): void { draft.value = { ...saved.value }; success.value = false; }
</script>

<template>
  <form class="wl-stack" data-space="lg" :aria-label="t('examples.notification_settings_0205')" @submit.prevent="save">
    <WlPageHeader :title="t('examples.notifications_and_access_0206')" :description="t('examples.changes_take_effect_after_saving_0207')" :heading-level="2" size="md" />
    <fieldset class="ds-recipe-fieldset wl-stack" data-space="md"><legend class="wl-text-label">{{ t("examples.notification_channels_0208") }}</legend><WlSwitch v-model="draft.email" :aria-label="t('examples.email_notifications_0209')">Email</WlSwitch><WlSwitch v-model="draft.push" :aria-label="t('examples.push_notifications_0210')">Push</WlSwitch></fieldset>
    <WlField :label="t('examples.frequency_0211')" id="recipe-frequency" :hint="t('examples.enable_email_or_push_to_choose_a_frequency_0212')"><WlSelect id="recipe-frequency" v-model="draft.frequency" :aria-label="t('examples.notification_frequency_0213')" aria-describedby="recipe-frequency-desc" :disabled="!draft.email && !draft.push" :options="[{ label: t('examples.every_day_0214'), value: 'daily' }, { label: t('examples.once_a_week_0215'), value: 'weekly' }]" option-label="label" option-value="value" /></WlField>
    <fieldset class="ds-recipe-fieldset wl-stack" data-space="md"><legend class="wl-text-label">{{ t("examples.who_can_see_materials_0216") }}</legend><WlRadio v-model="draft.access" value="team" name="recipe-access">{{ t("examples.entire_team_0109") }}</WlRadio><WlRadio v-model="draft.access" value="private" name="recipe-access">{{ t("examples.only_me_0110") }}</WlRadio></fieldset>
    <p class="wl-text-small wl-text-muted" role="status">{{ changed ? t("examples.there_are_unsaved_changes_0217") : t("examples.no_changes_0218") }}</p>
    <WlAlert v-if="success && !changed" variant="ok" :title="t('examples.settings_saved_0219')">{{ t("examples.changes_applied_0220") }}</WlAlert>
    <div class="wl-inline" data-space="sm"><WlButton variant="primary" type="submit" :disabled="!changed">{{ t("examples.save_settings_0221") }}</WlButton><WlButton variant="ghost" :disabled="!changed" @click="cancel">{{ t("examples.discard_changes_0222") }}</WlButton></div>
  </form>
</template>

<style scoped>
.ds-recipe-fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
.ds-recipe-fieldset legend { margin-bottom: var(--wl-space-md); }
</style>

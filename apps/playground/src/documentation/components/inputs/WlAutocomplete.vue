<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { computed, ref } from "vue";
import { WlAutocomplete, WlButton, WlField } from "../../../../../../packages/ui-kit/src";
const people = [{ id: "anna", label: t("examples.anna_0009") }, { id: "boris", label: t("examples.boris_0621") }, { id: "dmitry", label: t("examples.dmitry_0559") }, { id: "elena", label: t("examples.elena_0622") }];
type Person = (typeof people)[number];
const person = ref<Person | string | null>(people[0]!);
const participants = ref<Person[] | null>([people[0]!]);
const singleSuggestions = ref([...people]);
const multipleSuggestions = ref([...people]);
function filter(query: string) { return people.filter((item) => item.label.toLocaleLowerCase().includes(query.toLocaleLowerCase())); }
function searchSingle(event: { query: string }) { singleSuggestions.value = filter(event.query); }
function searchMultiple(event: { query: string }) { multipleSuggestions.value = filter(event.query); }
function label(value: unknown): string { return typeof value === "object" && value !== null && "label" in value ? String(value.label) : String(value ?? ""); }
const selectedNames = computed(() => Array.isArray(participants.value) ? participants.value.map(label).join(", ") : "");
function reset() { person.value = ""; participants.value = []; singleSuggestions.value = [...people]; multipleSuggestions.value = [...people]; }
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlAutocomplete">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.find_an_owner_and_select_members_0623") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-auto-single" :label="t('examples.owner_0624')" :hint="t('examples.enter_a_name_the_application_updates_suggestions_on_the_comple_0625')" v-slot="{ id, ariaDescribedby }"><WlAutocomplete :id="id" v-model="person" :suggestions="singleSuggestions" :option-label="label" dropdown :dropdown-label="t('examples.show_owners_0626')" :aria-describedby="ariaDescribedby" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-multiple" :label="t('examples.members_0543')" v-slot="{ id }"><WlAutocomplete :id="id" v-model="participants" :suggestions="multipleSuggestions" :option-label="label" multiple dropdown :dropdown-label="t('examples.show_members_0627')" :min-length="0" @complete="searchMultiple" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_button_opens_the_current_suggestions_the_initial_list_is_p_0628") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.sizes_compact_density_and_states_0629") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-auto-${size}`" :label="`${t('examples.owner_0630')}${size}`" v-slot="{ id }"><WlAutocomplete :id="id" v-model="person" :size="size" :suggestions="singleSuggestions" :option-label="label" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-compact" :label="t('examples.compact_suggestions_0631')" v-slot="{ id }"><WlAutocomplete :id="id" v-model="person" density="compact" :suggestions="singleSuggestions" :option-label="label" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-invalid" :label="t('examples.suggestions_with_an_error_0632')" :error="t('examples.confirm_the_owner_before_saving_0633')" v-slot="{ id, ariaDescribedby, invalid }"><WlAutocomplete :id="id" v-model="person" :suggestions="singleSuggestions" :option-label="label" :invalid="invalid" :aria-describedby="ariaDescribedby" @complete="searchSingle" /></WlField>
        <WlField id="docs-auto-disabled" :label="t('examples.unavailable_suggestions_0634')" v-slot="{ id }"><WlAutocomplete :id="id" :model-value="people[0]" :suggestions="people" :option-label="label" disabled dropdown /></WlField>
      </div>
      <WlButton size="sm" @click="reset">{{ t("examples.clear_selected_values_0635") }}</WlButton>
      <p class="wl-text-small" role="status">{{ t("examples.owner_0636") }} {{ label(person) || t("examples.not_selected_0637") }}{{ t("examples.members_0638") }} {{ selectedNames || t("examples.none_selected_0368") }}.</p>
    </section>
  </div>
</template>
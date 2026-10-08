<script setup lang="ts">
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
  <form class="wl-stack" data-space="lg" aria-label="Настройки уведомлений" @submit.prevent="save">
    <WlPageHeader title="Уведомления и доступ" description="Изменения применяются после сохранения." :heading-level="2" size="md" />
    <fieldset class="ds-recipe-fieldset wl-stack" data-space="md"><legend class="wl-text-label">Каналы уведомлений</legend><WlSwitch v-model="draft.email" aria-label="Email-уведомления">Email</WlSwitch><WlSwitch v-model="draft.push" aria-label="Push-уведомления">Push</WlSwitch></fieldset>
    <WlField label="Частота" id="recipe-frequency" hint="Чтобы выбрать частоту, включите Email или Push."><WlSelect id="recipe-frequency" v-model="draft.frequency" aria-label="Частота уведомлений" aria-describedby="recipe-frequency-desc" :disabled="!draft.email && !draft.push" :options="[{ label: 'Каждый день', value: 'daily' }, { label: 'Раз в неделю', value: 'weekly' }]" option-label="label" option-value="value" /></WlField>
    <fieldset class="ds-recipe-fieldset wl-stack" data-space="md"><legend class="wl-text-label">Кто видит материалы</legend><WlRadio v-model="draft.access" value="team" name="recipe-access">Вся команда</WlRadio><WlRadio v-model="draft.access" value="private" name="recipe-access">Только я</WlRadio></fieldset>
    <p class="wl-text-small wl-text-muted" role="status">{{ changed ? 'Есть несохранённые изменения.' : 'Изменений нет.' }}</p>
    <WlAlert v-if="success && !changed" variant="ok" title="Настройки сохранены">Изменения применены.</WlAlert>
    <div class="wl-inline" data-space="sm"><WlButton variant="primary" type="submit" :disabled="!changed">Сохранить настройки</WlButton><WlButton variant="ghost" :disabled="!changed" @click="cancel">Отменить изменения</WlButton></div>
  </form>
</template>

<style scoped>
.ds-recipe-fieldset { border: 0; margin: 0; padding: 0; min-width: 0; }
.ds-recipe-fieldset legend { margin-bottom: var(--wl-space-md); }
</style>

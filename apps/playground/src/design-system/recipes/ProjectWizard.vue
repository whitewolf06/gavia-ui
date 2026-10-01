<script setup lang="ts">
import { computed, nextTick, ref } from "vue";
import { WlPageHeader, WlSteps, WlField, WlInput, WlRadio, WlButton, WlAlert } from "../../../../../packages/ui-kit/src";
const step = ref(0);
const title = ref("");
const access = ref<unknown>("team");
const checked = ref(false);
const complete = ref(false);
const error = computed(() => checked.value && !title.value.trim() ? "Введите название проекта." : "");
const heading = ref<HTMLHeadingElement | null>(null);
async function move(target: number): Promise<void> {
  if (target > step.value && step.value === 0) {
    checked.value = true;
    if (error.value) { await nextTick(); document.getElementById("recipe-project-title")?.focus(); return; }
  }
  step.value = target; await nextTick(); heading.value?.focus();
}
async function submit(): Promise<void> {
  if (step.value < 2) await move(step.value + 1);
  else complete.value = true;
}
</script>

<template>
  <form class="wl-stack" data-space="lg" novalidate aria-label="Создание проекта" @submit.prevent="submit">
    <WlPageHeader title="Новый проект" description="Три шага: данные, доступ, проверка." :heading-level="2" size="md" />
    <WlSteps :items="[{ label: 'Данные' }, { label: 'Доступ' }, { label: 'Проверка' }]" :current="step" />
    <WlAlert v-if="complete" variant="ok" title="Проект создан">{{ title }} · {{ access === 'team' ? 'для всей команды' : 'личный' }}</WlAlert>
    <template v-else>
      <h3 ref="heading" tabindex="-1" class="wl-text-subheading">Шаг {{ step + 1 }}: {{ ['Данные проекта', 'Доступ к проекту', 'Проверка данных'][step] }}</h3>
      <WlField v-if="step === 0" label="Название проекта" id="recipe-project-title" required :error="error" v-slot="field"><WlInput :id="field.id" v-model="title" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" maxlength="80" /></WlField>
      <fieldset v-if="step === 1" class="ds-wizard-access wl-stack" data-space="md"><legend class="wl-text-label">Кто может видеть проект</legend><WlRadio v-model="access" name="recipe-project-access" value="team">Вся команда</WlRadio><WlRadio v-model="access" name="recipe-project-access" value="private">Только я</WlRadio></fieldset>
      <dl v-if="step === 2" class="wl-stack wl-text-body" data-space="sm"><dt class="wl-text-label">Название</dt><dd>{{ title }}</dd><dt class="wl-text-label">Доступ</dt><dd>{{ access === 'team' ? 'Вся команда' : 'Только я' }}</dd></dl>
      <div class="wl-inline" data-space="sm"><WlButton v-if="step > 0" variant="ghost" @click="move(step - 1)">Назад</WlButton><WlButton variant="primary" type="submit">{{ step < 2 ? 'Продолжить' : 'Создать проект' }}</WlButton></div>
    </template>
    <WlButton v-if="complete" @click="complete = false; step = 0; checked = false; title = ''">Создать ещё проект</WlButton>
  </form>
</template>

<style scoped>
.ds-wizard-access { padding: 0; margin: 0; border: 0; }
.ds-wizard-access legend { margin-bottom: var(--wl-space-md); }
dd { margin: 0; overflow-wrap: anywhere; }
</style>

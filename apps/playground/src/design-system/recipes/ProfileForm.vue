<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { WlPageHeader, WlField, WlInput, WlTextarea, WlButton, WlAlert, WlSwitch } from "../../../../../packages/ui-kit/src";
const name = ref("");
const email = ref("");
const description = ref("");
const submitted = ref(false);
const pending = ref(false);
const failure = ref(false);
const outcome = ref<"idle" | "success" | "error">("idle");
const nameError = computed(() => submitted.value && !name.value.trim() ? "Введите имя." : "");
const emailError = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? "Проверьте адрес email." : "");
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
  <form class="wl-stack" data-space="lg" novalidate aria-label="Форма профиля" @submit.prevent="save">
    <WlPageHeader title="Профиль участника" description="Контактные данные и короткое описание." :heading-level="2" size="md" />
    <WlField id="recipe-profile-name" label="Имя участника" required :error="nameError" v-slot="field"><WlInput :id="field.id" v-model="name" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" :disabled="pending" autocomplete="name" maxlength="80" required /></WlField>
    <WlField id="recipe-profile-email" label="Email участника" required :error="emailError" hint="Для уведомлений о материалах." v-slot="field"><WlInput :id="field.id" v-model="email" type="email" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" :disabled="pending" autocomplete="email" required /></WlField>
    <WlField id="recipe-profile-description" label="О себе" hint="До 240 символов." v-slot="field"><WlTextarea :id="field.id" v-model="description" :aria-describedby="field.ariaDescribedby" :disabled="pending" maxlength="240" /><span class="wl-text-small wl-text-muted">{{ description.length }}/240</span></WlField>
    <WlSwitch v-model="failure" :disabled="pending" aria-label="Имитировать ошибку сохранения">Имитировать ошибку сохранения</WlSwitch>
    <WlAlert v-if="outcome === 'error'" variant="err" title="Не удалось сохранить">Введённые данные остались в форме. Попробуйте ещё раз.<template #action><WlButton size="sm" @click="failure = false; save()">Повторить сохранение</WlButton></template></WlAlert>
    <WlAlert v-if="outcome === 'success'" variant="ok" title="Профиль сохранён">Контактные данные обновлены.</WlAlert>
    <div><WlButton variant="primary" type="submit" :loading="pending">Сохранить профиль</WlButton></div>
  </form>
</template>

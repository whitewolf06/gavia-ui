<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlInput } from "../../../../../../packages/ui-kit/src";
const name = ref("");
const error = ref("");
const message = ref("");
function save(): void {
  error.value = name.value.trim() ? "" : "Укажите название материала, чтобы продолжить.";
  message.value = error.value ? "" : "Локально сохранено: " + name.value.trim();
}
function cancel(): void {
  name.value = ""; error.value = ""; message.value = "Изменения отменены.";
}
</script>

<template>
  <div class="wl-stack" data-space="xl">
    <section class="wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">Перед сохранением</h3>
      <ol class="content-writing-list wl-text-body"><li>Введите понятное название.</li><li>Проверьте его в контексте списка материалов.</li><li>Сохраните или отмените изменения.</li></ol>
    </section>
    <form class="wl-stack" data-space="lg" novalidate @submit.prevent="save">
      <WlField id="content-material-name" label="Название материала" hint="Назовите тему материала, например «План запуска»." :error="error" required v-slot="field">
        <WlInput :id="field.id" v-model="name" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" required placeholder="План запуска" />
      </WlField>
      <div class="wl-inline" data-space="sm"><WlButton variant="primary" type="submit">Сохранить материал</WlButton><WlButton @click="cancel">Отменить изменения</WlButton></div>
      <p class="wl-text-small wl-text-muted" role="status">{{ message }}</p>
    </form>
    <section class="wl-stack" data-space="sm">
      <h3 class="wl-text-subheading">Как назвать материал</h3>
      <ul class="content-writing-list wl-text-body"><li>Короткая тема вместо внутреннего идентификатора.</li><li>Понятные названия вместо «Документ 1» и «Разное».</li></ul>
    </section>
  </div>
</template>

<style scoped>
.content-writing-list { display: grid; gap: var(--wl-space-sm); margin: 0; padding-left: var(--wl-space-lg); }
</style>

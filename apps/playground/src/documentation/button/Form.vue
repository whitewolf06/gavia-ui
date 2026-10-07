<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlCheckbox, WlInput } from "../../../../../packages/ui-kit/src";
const name = ref("");
const block = ref(true);
const submitted = ref(0);
const drafts = ref(0);
const message = ref("Форма ещё не отправлена.");
function submit(): void {
  submitted.value++;
  message.value = "Создан проект «" + name.value.trim() + "».";
}
function reset(): void {
  name.value = "";
  message.value = "Форма очищена.";
}
</script>

<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="block">Кнопка отправки на всю ширину</WlCheckbox>
    <form class="button-form-example wl-stack" data-space="md" aria-label="Создание проекта" @submit.prevent="submit" @reset.prevent="reset">
      <div class="wl-stack" data-space="xs">
        <label for="button-form-name" class="wl-text-label">Название проекта</label>
        <WlInput id="button-form-name" v-model="name" name="projectName" required minlength="3" pattern=".*\S.*" aria-describedby="button-form-hint" />
        <p id="button-form-hint" class="wl-text-small wl-text-muted">Не менее трёх символов. Нативная проверка выполняется до submit.</p>
      </div>
      <div data-button-form-submit>
        <WlButton type="submit" variant="primary" :block="block">Создать проект</WlButton>
      </div>
      <div class="wl-inline" data-space="sm">
        <WlButton @click="drafts++">Проверить черновик</WlButton>
        <WlButton type="reset" variant="ghost">Сбросить форму</WlButton>
      </div>
    </form>
    <p class="wl-text-small" role="status">{{ message }} Отправок: {{ submitted }}. Проверок черновика: {{ drafts }}.</p>
    <p class="wl-text-small wl-text-muted">Обычная WlButton имеет type="button" и не отправляет форму. Submit и reset задаются явно. Этот пример хранит результат локально.</p>
  </div>
</template>

<style scoped>
.button-form-example { width: 100%; max-width: 28rem; }
</style>

<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlPasswordInput } from "../../../../../../packages/ui-kit/src";
const password = ref("");
const touched = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlPasswordInput">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры и показ пароля</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-password-${size}`" :label="`Пароль, ${size}`" v-slot="{ id }">
          <WlPasswordInput :id="id" v-model="password" :size="size" autocomplete="new-password" />
        </WlField>
        <WlField id="docs-password-compact" label="Компактное поле пароля" v-slot="{ id }"><WlPasswordInput :id="id" v-model="password" density="compact" autocomplete="new-password" /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">Кнопка «Показать пароль» меняет только отображение. Значение модели остаётся прежним.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Проверка приложением и disabled</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-password-validation" label="Пароль с проверкой" :error="touched && password.length < 8 ? 'Нужно не менее 8 символов.' : undefined" hint="Это правило примера, а не встроенная проверка сложности." v-slot="{ id, ariaDescribedby, invalid }">
          <WlPasswordInput :id="id" v-model="password" :invalid="invalid" :aria-describedby="ariaDescribedby" autocomplete="new-password" @blur="touched = true" />
        </WlField>
        <WlField id="docs-password-disabled" label="Отключённый пароль" v-slot="{ id }"><WlPasswordInput :id="id" model-value="Example-secret" disabled /></WlField>
      </div>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="touched = true">Проверить длину</WlButton><WlButton size="sm" @click="password = ''; touched = false">Очистить пароль</WlButton></div>
      <p class="wl-text-small" role="status">Введено символов: {{ password.length }}. Сам пароль не выводится в сообщениях.</p>
    </section>
  </div>
</template>
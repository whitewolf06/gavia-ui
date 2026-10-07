<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlTextarea } from "../../../../../../packages/ui-kit/src";
const text = ref("Кратко опишите задачу.\nДобавьте следующий шаг.");
const comment = ref("");
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlTextarea">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Фиксированные строки и автовысота</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-textarea-fixed" label="Описание, 4 строки" v-slot="{ id }"><WlTextarea :id="id" v-model="text" :rows="4" /></WlField>
        <WlField id="docs-textarea-grow" label="Описание с автовысотой" hint="Добавьте строки: высота увеличится вместе с текстом." v-slot="{ id, ariaDescribedby }"><WlTextarea :id="id" v-model="text" :rows="2" auto-resize :aria-describedby="ariaDescribedby" /></WlField>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Ошибка и недоступное поле</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-textarea-comment" label="Комментарий" :error="comment.trim() ? undefined : 'Добавьте комментарий.'" required v-slot="{ id, ariaDescribedby, invalid, required }"><WlTextarea :id="id" v-model="comment" :invalid="invalid" :required="required" :aria-describedby="ariaDescribedby" placeholder="Что нужно уточнить?" /></WlField>
        <WlField id="docs-textarea-disabled" label="Закрытый комментарий" v-slot="{ id }"><WlTextarea :id="id" model-value="Обсуждение завершено." disabled /></WlField>
      </div>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="text += '\nЕщё один пункт.'">Добавить строку</WlButton><WlButton size="sm" @click="text = ''; comment = ''">Очистить текст</WlButton></div>
      <p class="wl-text-small" role="status">Длина описания: {{ text.length }} символов.</p>
    </section>
  </div>
</template>
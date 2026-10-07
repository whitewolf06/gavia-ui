<script setup lang="ts">
import { ref } from "vue";
import { WlField, WlInput, WlTextarea, WlButton } from "../../../../../../packages/ui-kit/src";
const email = ref("");
const note = ref("");
const error = ref("Укажите email для уведомлений.");
const saved = ref(false);
function validate(): void { saved.value = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value); error.value = saved.value ? "" : "Для этого примера нужен email вида name@example.org."; }
</script>
<template>
  <form class="wl-stack" data-space="lg" novalidate @submit.prevent="validate">
    <WlField label="Email для уведомлений" required hint="Адрес используется только в локальном примере." :error="error"><template #default="{ id, ariaDescribedby, ariaInvalid, invalid, required }"><WlInput :id="id" v-model="email" type="email" :required="required" :invalid="invalid" :aria-invalid="ariaInvalid" :aria-describedby="ariaDescribedby" /></template></WlField>
    <WlField label="ID материала" hint="Поле доступно для чтения, но не для изменения."><template #default="{ id, ariaDescribedby }"><WlInput :id="id" model-value="GAV-24" readonly :aria-describedby="ariaDescribedby" /></template></WlField>
    <WlField label="Комментарий" hint="Label и подсказка связаны с textarea через scope."><template #default="{ id, ariaDescribedby }"><WlTextarea :id="id" v-model="note" :aria-describedby="ariaDescribedby" /></template></WlField>
    <div class="wl-inline" data-space="sm"><WlButton type="submit" size="sm" variant="primary">Проверить поля</WlButton><WlButton size="sm" variant="ghost" @click="email = ''; error = 'Укажите email для уведомлений.'; saved = false">Вернуть ошибку поля</WlButton></div>
    <p class="wl-text-small" role="status">{{ saved ? 'Поля прошли локальную проверку.' : 'Проверьте сообщение под Email.' }}</p>
  </form>
</template>

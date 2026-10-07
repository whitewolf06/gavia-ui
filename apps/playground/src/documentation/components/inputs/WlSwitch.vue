<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlSwitch } from "../../../../../../packages/ui-kit/src";
const notifications = ref(true);
const compactNotifications = ref(false);
const protectedMode = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlSwitch">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Два размера и подпись в слоте</h4>
      <WlSwitch v-model="notifications" size="md">Уведомления, md</WlSwitch>
      <WlSwitch v-model="compactNotifications" size="sm">Краткие уведомления, sm</WlSwitch>
      <p class="wl-text-small wl-text-muted">Space переключает сфокусированный switch. Подпись называет настройку; состояние передаётся через aria-checked.</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Ошибка и недоступная настройка</h4>
      <WlField id="docs-switch-protected" :error="protectedMode ? undefined : 'Включите защиту перед продолжением.'" v-slot="{ id, ariaDescribedby, invalid }"><WlSwitch :id="id" v-model="protectedMode" :invalid="invalid" :aria-describedby="ariaDescribedby">Защищённый режим</WlSwitch></WlField>
      <WlSwitch :model-value="true" disabled>Архивирование включено администратором</WlSwitch>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="notifications = true; compactNotifications = false; protectedMode = false">Сбросить настройки</WlButton></div>
      <p class="wl-text-small" role="status">Уведомления: {{ notifications ? 'включены' : 'выключены' }}. Краткие: {{ compactNotifications ? 'включены' : 'выключены' }}. Защита: {{ protectedMode ? 'включена' : 'выключена' }}.</p>
    </section>
  </div>
</template>
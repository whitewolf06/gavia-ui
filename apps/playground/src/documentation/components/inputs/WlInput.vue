<script setup lang="ts">
import { ref } from "vue";
import { WlButton, WlField, WlIcon, WlInput } from "../../../../../../packages/ui-kit/src";
const title = ref("План команды");
const amount = ref("1200");
const login = ref("");
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlInput">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Размеры и плотность</h4>
      <div class="wl-grid" data-space="lg">
        <WlField v-for="size in ['sm', 'md', 'lg'] as const" :key="size" :id="`docs-input-${size}`" :label="`Название, ${size}`" v-slot="{ id }">
          <WlInput :id="id" v-model="title" :size="size" />
        </WlField>
        <WlField id="docs-input-compact" label="Компактное поле" v-slot="{ id }"><WlInput :id="id" v-model="title" density="compact" /></WlField>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">Слоты и состояния</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-input-cost" label="Стоимость" hint="Иконка и единица измерения дополняют подпись." v-slot="{ id, ariaDescribedby }">
          <WlInput :id="id" v-model="amount" inputmode="decimal" :aria-describedby="ariaDescribedby"><template #prefix><WlIcon name="file" :size="16" /></template><template #suffix><span class="wl-text-small">₽</span></template></WlInput>
        </WlField>
        <WlField id="docs-input-login" label="Логин" :error="login.trim() ? undefined : 'Укажите логин.'" required v-slot="{ id, ariaDescribedby, invalid, required }">
          <WlInput :id="id" v-model="login" :invalid="invalid" :required="required" :aria-describedby="ariaDescribedby" placeholder="Например, dmitry" />
        </WlField>
        <WlField id="docs-input-disabled" label="Недоступное поле" v-slot="{ id }"><WlInput :id="id" model-value="Название задано администратором" disabled /></WlField>
      </div>
      <WlButton size="sm" @click="title = ''; amount = ''; login = ''">Очистить поля</WlButton>
      <p class="wl-text-small" role="status">Название: {{ title || 'не задано' }}. Стоимость: {{ amount || 'не задана' }}.</p>
    </section>
  </div>
</template>
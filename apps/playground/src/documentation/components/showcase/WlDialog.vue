<script setup lang="ts">
import { ref } from "vue";
import { WlDialog, WlButton, WlField, WlInput, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const visible = ref(false);
const motion = ref(true);
const dismissable = ref(false);
const title = ref("План выпуска");
const saved = ref("");
const left = ref(0);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlCheckbox v-model="motion">Анимация диалога</WlCheckbox><WlCheckbox v-model="dismissable">Закрывать по подложке</WlCheckbox></div>
    <div><WlButton variant="primary" @click="visible = true">Редактировать название</WlButton></div>
    <WlDialog v-model:visible="visible" header="Редактирование материала" width="min(480px, calc(100vw - 32px))" :motion="motion" :dismissable="dismissable" :pt="{ footer: { style: { flexWrap: 'wrap' } } }" @after-leave="left++"><WlField label="Название" hint="Результат сохраняется только в этом примере."><template #default="{ id, ariaDescribedby }"><WlInput :id="id" v-model="title" :aria-describedby="ariaDescribedby" /></template></WlField><template #footer><WlButton variant="ghost" @click="visible = false">Отмена редактирования</WlButton><WlButton variant="primary" :disabled="!title.trim()" @click="saved = title; visible = false">Сохранить название</WlButton></template></WlDialog>
    <p class="wl-text-small" role="status">{{ saved ? 'Сохранено: ' + saved : 'Изменения ещё не сохранены.' }} Завершённых закрытий: {{ left }}.</p>
  </div>
</template>

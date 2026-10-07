<script setup lang="ts">
import { WlPill, WlIcon, type WlPillVariant } from "../../../../../../packages/ui-kit/src";
const labels = { neutral: "Черновик", info: "В работе", ok: "Готово", warn: "Нужна проверка", err: "Ошибка" } satisfies Record<WlPillVariant, string>;
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlPill v-for="(label, variant) in labels" :key="variant" :label="label" :variant="variant" /></div>
    <div class="wl-inline" data-space="sm"><span class="wl-text-body">Содержимое default-слота:</span><WlPill variant="ok"><WlIcon name="check" :size="12" />Проверено командой</WlPill></div>
    <p class="wl-text-small wl-text-muted">Статусы дополняют данные; они не являются кнопками. Текст сообщает смысл независимо от цвета.</p>
  </div>
</template>

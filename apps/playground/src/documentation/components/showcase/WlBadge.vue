<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlBadge, WlButton, type WlBadgeVariant } from "../../../../../../packages/ui-kit/src";
const values = { gray: "12", accent: "3", success: "OK", warn: "5", danger: "9" } satisfies Record<WlBadgeVariant, string>;
const unread = ref(3);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><span v-for="(value, variant) in values" :key="variant" class="wl-inline" data-space="xs"><WlBadge :value="value" :variant="variant" /><span class="wl-text-small">{{ variant }}</span></span></div>
    <div class="wl-inline" data-space="md"><span v-for="(value, variant) in values" :key="variant" class="wl-inline" data-space="xs"><WlBadge dot :variant="variant" aria-hidden="true" /><span class="wl-text-small">{{ t("examples.status_0067") }} {{ variant }}</span></span></div>
    <div class="wl-inline" data-space="sm"><span class="wl-text-body">{{ t("examples.unread_0336") }} <WlBadge :value="unread" /></span><WlButton size="sm" :disabled="unread === 0" @click="unread = 0">{{ t("examples.mark_as_read_0337") }}</WlButton><WlButton size="sm" variant="ghost" @click="unread = 3">{{ t("examples.restore_counter_0338") }}</WlButton></div>
  </div>
</template>

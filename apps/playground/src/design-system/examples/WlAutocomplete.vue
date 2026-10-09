<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlAutocomplete } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string | null>(t("examples.anna_0009"));
const suggestions = ref([t("examples.anna_0009"), t("examples.andrey_0010"), t("examples.maria_0011")]);
function complete(event: { query: string }): void {
  suggestions.value = [t("examples.anna_0009"), t("examples.andrey_0010"), t("examples.maria_0011")].filter((name) => name.toLowerCase().includes(event.query.toLowerCase()));
}
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAutocomplete v-model="value" :suggestions="suggestions" dropdown :aria-label="t('examples.member_0012')" v-bind="preview" @complete="complete" />
  </div>
</template>

<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlAutocomplete, WlButton } from "gavia-ui";
import { onBeforeUnmount, ref } from "vue";
const value = ref<string | null>(t("examples.anna_0009"));
const suggestions = ref([t("examples.anna_0009"), t("examples.andrey_0010"), t("examples.maria_0011")]);
const loading = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
function cancel(): void {
  clearTimeout(timer);
  loading.value = false;
}
function complete(event: { query: string }): void {
  cancel();
  loading.value = true;
  // Simulate application-owned work; typing again replaces this local request.
  timer = setTimeout(() => {
    suggestions.value = [t("examples.anna_0009"), t("examples.andrey_0010"), t("examples.maria_0011")]
      .filter((name) => name.toLowerCase().includes(event.query.toLowerCase()));
    loading.value = false;
  }, 600);
}
onBeforeUnmount(cancel);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAutocomplete
      v-model="value"
      :suggestions="suggestions"
      :loading="loading"
      :debounce="250"
      clearable
      dropdown
      :aria-label="t('examples.member_0012')"
      v-bind="preview"
      @complete="complete"
    />
    <WlButton v-if="loading" variant="ghost" @click="cancel">{{ t("examples.cancel_0038") }}</WlButton>
  </div>
</template>

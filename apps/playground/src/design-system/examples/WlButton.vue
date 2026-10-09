<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlIcon } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const count = ref(0);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <div>
      <WlButton v-bind="preview" @click="count++"><template #icon><WlIcon name="plus" /></template>{{ t("examples.add_0017") }}</WlButton>
    </div>
    <p role="status" class="wl-text-small">{{ t("examples.clicks_0018") }} {{ count }}</p>
  </div>
</template>

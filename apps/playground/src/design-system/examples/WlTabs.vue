<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlTabs } from "gavia-ui";
import { useWlId } from "gavia-ui/composables";
import { computed, ref } from "vue";
const active = ref("example-overview");
const prefix = `example-tabs-${useWlId()}`;
const items = computed(() => [
  { key: "example-overview", label: t("examples.overview_0000"), href: `#${prefix}-example-overview` },
  { key: "example-history", label: t("examples.history_0133"), href: `#${prefix}-example-history`, count: 3 }
]);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlTabs v-model="active" :items="items" v-bind="preview">
      <template #panel="{ item }">
        <p :id="`${prefix}-${item.key}`" class="wl-text-body">
          {{ item.key === 'example-overview' ? t("examples.material_description_0134") : t("examples.material_updated_october_1_0135") }}
        </p>
      </template>
    </WlTabs>
  </div>
</template>

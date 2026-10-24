<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlIcon, WlNavItem } from "gavia-ui";
import { ref } from "vue";
const active = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlNavItem
      :label="t('examples.team_materials_0083')"
      icon="folder"
      :badge="12"
      :active="active"
      v-bind="preview"
      @click="active = !active"
    >
      <template #icon="{ icon }"><WlIcon v-if="icon" :name="icon" :size="17" /></template>
      <template #badge="{ badge }"><strong>{{ badge }}</strong></template>
    </WlNavItem>
  </div>
</template>

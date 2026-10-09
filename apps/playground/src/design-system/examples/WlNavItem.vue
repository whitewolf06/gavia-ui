<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlNavItem } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const active = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlNavItem :label="t('examples.team_materials_0083')" icon="folder" :badge="12" :active="active" v-bind="preview" @click="active = !active" />
  </div>
</template>

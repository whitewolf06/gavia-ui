<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlRadio } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string>('team');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlRadio v-model="value" value="team" name="example-access" v-bind="preview">{{ t("examples.entire_team_0109") }}</WlRadio><WlRadio v-model="value" value="private" name="example-access" v-bind="preview">{{ t("examples.only_me_0110") }}</WlRadio>
  </div>
</template>

<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlRadio } from "gavia-ui";
import { useWlId } from "gavia-ui/composables";
import { ref } from "vue";
const value = ref<string>("team");
const name = `example-access-${useWlId()}`;
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlRadio
      v-model="value"
      value="team"
      :name="name"
      size="sm"
      v-bind="preview"
    >{{ t("examples.entire_team_0109") }}</WlRadio><WlRadio
      v-model="value"
      value="private"
      :name="name"
      size="sm"
      v-bind="preview"
    >{{ t("examples.only_me_0110") }}</WlRadio>
  </div>
</template>

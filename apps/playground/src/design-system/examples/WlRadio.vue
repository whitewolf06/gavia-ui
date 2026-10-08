<script setup lang="ts">
import { ref } from "vue";
import { WlRadio } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref<string>('team');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlRadio v-model="value" value="team" name="example-access" v-bind="preview">Вся команда</WlRadio><WlRadio v-model="value" value="private" name="example-access" v-bind="preview">Только я</WlRadio>
  </div>
</template>

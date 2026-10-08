<script setup lang="ts">
import { ref } from "vue";
import { WlDialog, WlDrawer, WlFilterBar, WlTabs } from "../../src";
const visible = ref(false);
const open = ref(false);
const key = ref<"overview" | "">("");
const items = [{ key: "overview", label: "Overview" }] as const;
</script>
<template>
  <WlDialog v-model:visible="visible" />
  <WlDrawer v-model:visible="visible" />
  <WlFilterBar v-model:open="open" />
  <WlTabs v-model="key" :items="items" />
  <!-- @vue-expect-error Boolean visibility models do not support trim. -->
  <WlDialog v-model:visible.trim="visible" />
  <!-- @vue-expect-error Boolean visibility models do not support numeric coercion. -->
  <WlDrawer v-model:visible.number="visible" />
  <!-- @vue-expect-error Open is an immediate boolean state, without lazy semantics. -->
  <WlFilterBar v-model:open.lazy="open" />
  <!-- @vue-expect-error Tab keys must not be trimmed. -->
  <WlTabs v-model.trim="key" :items="items" />
</template>

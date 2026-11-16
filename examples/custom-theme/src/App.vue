<script setup lang="ts">
import { WlButton, WlCard, WlCheckbox, WlTabs } from "gavia-ui";
import { ref } from "vue";

const enabled = ref(true);
const tab = ref("overview");
const tabs = [{ key: "overview", label: "Overview" }, { key: "details", label: "Details" }];
</script>

<template>
  <main class="brand-page">
    <h1>A brand layer over Gavia</h1>
    <WlCard :pt="{ content: { class: 'brand-content' } }">
      <template #title>Shared components, application-owned colors</template>
      <p>The same palette colors actions, links, focus and selected states.</p>
      <div class="brand-actions">
        <WlButton variant="primary">Primary action</WlButton>
        <WlButton variant="soft">Soft action</WlButton>
        <WlButton variant="link" href="https://whitewolf06.github.io/gavia-ui/docs/">Documentation</WlButton>
      </div>
      <WlCheckbox v-model="enabled">Enable notifications</WlCheckbox>
      <WlTabs v-model="tab" :items="tabs">
        <template #panel="{ item }">
          <p>{{ item.key === 'overview' ? 'A selected tab uses the brand accent.' : 'Keyboard focus uses the same palette.' }}</p>
        </template>
      </WlTabs>
      <template #footer>The brand layer keeps the shared component structure and states.</template>
    </WlCard>
  </main>
</template>

<style>
.brand-page {
  max-inline-size: 42rem;
  margin-inline: auto;
  padding: var(--wl-space-lg);
}

.brand-content {
  display: grid;
  gap: var(--wl-space-md);
}

.brand-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--wl-space-sm);
}
</style>

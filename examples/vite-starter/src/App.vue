<script setup lang="ts">
import { WlButton, WlField, WlInput } from "gavia-ui";
import { ref } from "vue";
const name = ref("");
const saved = ref(false);
</script>

<template>
  <main class="wl-container wl-stack" data-space="lg">
    <h1>Gavia UI starter</h1>
    <form class="wl-stack" data-space="md" @submit.prevent="saved = true">
      <WlField
        v-slot="field"
        label="Project name"
        hint="Use a clear, short name."
        required
      >
        <WlInput
          :id="field.inputId"
          v-model="name"
          :aria-describedby="field.ariaDescribedby"
          required
          @input="saved = false"
        />
      </WlField>
      <div class="wl-inline" data-space="sm">
        <WlButton type="submit" variant="primary">Save</WlButton>
        <WlButton @click="name = ''; saved = false">Reset</WlButton>
      </div>
    </form>
    <p role="status">{{ saved ? `Saved: ${name}` : '' }}</p>
  </main>
</template>

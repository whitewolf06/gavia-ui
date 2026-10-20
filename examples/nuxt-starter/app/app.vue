<script setup lang="ts">
import { WlButton, WlField, WlInput } from "gavia-ui";
import { ref } from "vue";
const title = ref("");
</script>

<template>
  <main>
    <h1>Gavia UI with Nuxt</h1>
    <WlField v-slot="field" label="Title" hint="Rendered on the server and hydrated in the browser.">
      <WlInput :id="field.inputId" v-model="title" :aria-describedby="field.ariaDescribedby" />
    </WlField>
    <WlButton @click="title = ''">Clear</WlButton>
  </main>
</template>

<script setup lang="ts">
import { WlButton, WlIconButton } from "../src";

const route = { name: "guide" };
function onClick(event: MouseEvent): void {
  event.preventDefault();
}
function wrongClick(_event: KeyboardEvent): void {}
</script>

<template>
  <WlButton
    href="/guide.pdf"
    target="_blank"
    download="guide.pdf"
    rel="noopener"
    @click="onClick"
  >Guide</WlButton>
  <WlButton :to="route" target="_blank" referrerpolicy="no-referrer">Route</WlButton>
  <WlButton as="a" target="_blank">Anchor</WlButton>
  <WlButton type="submit" form="settings" formaction="/save">Save</WlButton>
  <WlIconButton
    aria-label="Guide"
    href="/guide.pdf"
    target="_blank"
    download
    @click="onClick"
  />
  <WlIconButton aria-label="Route" :to="route" rel="nofollow" />
  <!-- @vue-expect-error native buttons reject link-only attributes. -->
  <WlButton target="_blank">Button</WlButton>
  <!-- @vue-expect-error click remains MouseEvent. -->
  <WlIconButton aria-label="Guide" href="/guide" @click="wrongClick" />
</template>

<template>
  <span class="legato-wordmark" aria-hidden="true"></span>
</template>

<style>
.legato-wordmark {
  display: block;
  aspect-ratio: 740 / 250;
  background: linear-gradient(to right, var(--wl-text) 78%, var(--wl-text-accent) 78%);
  mask: url("./assets/brand/duetto/legato-wordmark.svg") center / contain no-repeat;
}
@media (forced-colors: active) {
  .legato-wordmark { forced-color-adjust: none; background: CanvasText; }
}
</style>

<script setup lang="ts">
import { usePlaygroundI18n } from "./i18n";

defineProps<{ error?: Error }>();
const { t } = usePlaygroundI18n();
function reload(): void {
  window.location.reload();
}
</script>

<template>
  <div class="pg-content-loading" :role="error ? 'alert' : 'status'">
    <template v-if="error">
      <p class="pg-content-loading-label">{{ t('shell.catalog.error') }}</p>
      <button class="pg-content-loading-retry" type="button" @click="reload">{{ t('shell.page.reload') }}</button>
    </template>
    <template v-else>
      <span class="pg-content-loading-label">{{ t('shell.page.loading') }}</span>
      <div class="pg-content-loading-skeleton" aria-hidden="true">
        <span class="pg-content-loading-line pg-content-loading-line--title" />
        <span class="pg-content-loading-line" />
        <span class="pg-content-loading-line pg-content-loading-line--short" />
        <div class="pg-content-loading-panel">
          <span class="pg-content-loading-line pg-content-loading-line--short" />
          <span class="pg-content-loading-line" />
          <span class="pg-content-loading-line" />
        </div>
      </div>
    </template>
  </div>
</template>

<style>
.pg-content-loading { min-height: 320px; padding: 24px 0; color: var(--wl-text-2); }
.pg-content-loading-label { margin: 0 0 24px; font-size: var(--wl-type-small-size); }
.pg-content-loading-skeleton { display: grid; gap: 14px; max-width: 760px; }
.pg-content-loading-line { display: block; height: 12px; border-radius: 6px; background: var(--wl-bg-soft); }
.pg-content-loading-line--title { width: 42%; height: 24px; margin-bottom: 10px; }
.pg-content-loading-line--short { width: 68%; }
.pg-content-loading-panel {
  display: grid;
  gap: 18px;
  padding: 28px;
  margin-top: 20px;
  border: 1px solid var(--wl-border);
  border-radius: 16px;
}
.pg-content-loading-retry {
  padding: 10px 16px;
  border: 1px solid var(--wl-border);
  border-radius: 8px;
  background: var(--wl-bg-raised);
  color: var(--wl-text);
  font: inherit;
  cursor: pointer;
}
.pg-content-loading-retry:hover { background: var(--wl-bg-hover); }
.pg-content-loading-retry:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 3px; }
</style>

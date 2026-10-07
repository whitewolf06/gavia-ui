<script setup lang="ts">
import { computed } from "vue";
import { detectCodeLanguage, highlightCode, type CodeLanguage } from "./highlighting/tokenizer";
const props = withDefaults(defineProps<{ source: string; language?: CodeLanguage }>(), { language: "auto" });
const resolvedLanguage = computed(() => props.language === "auto" ? detectCodeLanguage(props.source) : props.language);
const tokens = computed(() => highlightCode(props.source, props.language));
</script>

<template>
  <code class="ds-code-highlight" :data-language="resolvedLanguage"><span v-for="(token, index) in tokens" :key="index" class="ds-code-token" :class="'ds-code-token--' + token.kind">{{ token.text }}</span></code>
</template>

<style>
/* Override playground inline-code decoration only inside this highlighted block. */
.ds-code-highlight { display: block; color: inherit; background: transparent; border: 0; border-radius: 0; padding: 0; font: inherit; white-space: inherit; }
.ds-code-token { background: transparent; border: 0; border-radius: 0; padding: 0; }
.ds-code-token--comment, .ds-code-token--punctuation { color: var(--wl-text-muted); }
.ds-code-token--tag, .ds-code-token--keyword, .ds-code-token--selector, .ds-code-token--function { color: var(--wl-info-text); }
.ds-code-token--tag, .ds-code-token--keyword { font-weight: 600; }
.ds-code-token--attribute, .ds-code-token--number { color: var(--wl-warn-text); }
.ds-code-token--directive, .ds-code-token--property { color: var(--wl-err-text); }
.ds-code-token--string, .ds-code-token--value { color: var(--wl-ok-text); }
.ds-code-token--unit { color: var(--wl-info-text); }
</style>

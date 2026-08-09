<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { WlDensity, WlSizeSm } from "../types";

const props = withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    eyebrow?: string;
    headingLevel?: 1 | 2;
    size?: WlSizeSm;
    density?: WlDensity;
  }>(),
  {
    title: "",
    description: "",
    eyebrow: "",
    headingLevel: 1,
    size: "lg",
    density: "default"
  }
);

const slots = useSlots();
const headingTag = computed(() => `h${props.headingLevel}` as "h1" | "h2");
const hasLead = computed(() => Boolean(props.eyebrow || slots.eyebrow));
const hasDescription = computed(() => Boolean(props.description || slots.description));
const hasMeta = computed(() => Boolean(slots.meta));
const hasActions = computed(() => Boolean(slots.actions));
</script>

<template>
  <header
    class="wl-page-header"
    :class="[
      `wl-page-header--${size}`,
      density === 'compact' && 'wl-page-header--compact'
    ]"
    data-wl="page-header"
    :data-size="size"
    :data-density="density"
  >
    <div v-if="$slots.breadcrumbs" class="wl-page-header__breadcrumbs">
      <slot name="breadcrumbs" />
    </div>

    <div class="wl-page-header__main">
      <div class="wl-page-header__content">
        <div v-if="hasLead" class="wl-page-header__eyebrow">
          <slot name="eyebrow">{{ eyebrow }}</slot>
        </div>

        <component
          :is="headingTag"
          class="wl-page-header__title"
          :class="`wl-page-header__title--${size}`"
        >
          <slot name="title">{{ title }}</slot>
        </component>

        <div v-if="hasDescription" class="wl-page-header__description">
          <slot name="description">{{ description }}</slot>
        </div>

        <div v-if="hasMeta" class="wl-page-header__meta">
          <slot name="meta" />
        </div>
      </div>

      <div v-if="hasActions" class="wl-page-header__actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="$slots.navigation" class="wl-page-header__navigation">
      <slot name="navigation" />
    </div>
  </header>
</template>

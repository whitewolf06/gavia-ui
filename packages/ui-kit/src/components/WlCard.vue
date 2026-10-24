<script setup lang="ts">
/** WlCard public component contract.
 * @since 0.1.0
 * @slot header - Header for an image or banner.
 * @slot title - Title.
 * @slot subtitle - Subtitle.
 * @slot default - Main content.
 * @slot footer - Footer.
 */
import { computed, type Slots, useSlots } from "vue";
import type { WlPt } from "../pt-types";
import { useWlPt } from "../config";
import WlLink from "./WlLink.vue";

const props = withDefaults(
  defineProps<{
    /** Add the theme's hover treatment.
     * @default false
     */
    hoverable?: boolean;
    /** Root element when no link destination is supplied.
     * @default "section"
     */
    as?: "section" | "article" | "div" | "a";
    /** Link destination; selects WlLink as the root. */
    href?: string;
    /** Router destination handled by the configured WlLink adapter. */
    to?: unknown;
    /** Outline or elevation treatment; omission uses the theme default. */
    variant?: "outlined" | "elevated";
    /** Content padding; omission uses the theme default. */
    padding?: "none" | "sm" | "md" | "lg";
    /** Attributes for the card root and its content sections. */
    pt?: WlPt<"card">;
  }>(),
  {
    hoverable: false
  }
);

const slots: Slots = useSlots();

const rootClass = computed(() => ["wl-card", props.hoverable && "wl-card--hoverable"]);
const section = useWlPt("card", computed(() => props.pt));
</script>

<template>
  <component
    :is="href !== undefined || to !== undefined ? WlLink : as ?? 'section'"
    v-bind="section('root')"
    :href="href"
    :to="to"
    :class="rootClass"
    data-wl="card"
    :data-variant="variant"
    :data-padding="padding"
  >
    <div v-if="slots.header" v-bind="section('header')" class="wl-card__header"><slot name="header"></slot></div>
    <div v-bind="section('body')" class="wl-card__body">
      <div v-if="slots.title || slots.subtitle" v-bind="section('caption')" class="wl-card__caption">
        <div v-if="slots.title" v-bind="section('title')" class="wl-card__title"><slot name="title"></slot></div>
        <div v-if="slots.subtitle" v-bind="section('subtitle')" class="wl-card__subtitle"><slot name="subtitle"></slot></div>
      </div>
      <div v-bind="section('content')" class="wl-card__content"><slot></slot></div>
      <div v-if="slots.footer" v-bind="section('footer')" class="wl-card__footer"><slot name="footer"></slot></div>
    </div>
  </component>
</template>

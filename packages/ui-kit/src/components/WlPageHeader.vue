<script setup lang="ts">
/** WlPageHeader public component contract.
 * @since 0.3.0
 * @slot breadcrumbs - Breadcrumb path above the heading.
 * @slot eyebrow - Custom eyebrow.
 * @slot title - Custom heading content.
 * @slot description - Extended page description.
 * @slot meta - Statuses, dates and other metadata.
 * @slot actions - Primary and secondary page actions.
 * @slot navigation - Tabs or a mode control below the heading.
 */
import { computed, useAttrs, useSlots } from "vue";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";
import { mergeWlAttrs, useWlPt } from "../config";
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /**
     * Main page heading.
     * @default ""
     */
    title?: string;
    /**
     * Short page description.
     * @default ""
     */
    description?: string;
    /**
     * Eyebrow or section context.
     * @default ""
     */
    eyebrow?: string;
    /**
     * Semantic heading level for the page title.
     * @default 1
     */
    headingLevel?: 1 | 2;
    /**
     * Size within the component family's documented scale.
     * @default "lg"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"pageheader">;
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
const attrs = useAttrs();
const section = useWlPt("pageheader", computed(() => props.pt));
const headingTag = computed(() => `h${props.headingLevel}` as "h1" | "h2");
const hasLead = computed(() => Boolean(props.eyebrow || slots.eyebrow));
const hasDescription = computed(() => Boolean(props.description || slots.description));
const hasMeta = computed(() => Boolean(slots.meta));
const hasActions = computed(() => Boolean(slots.actions));
</script>

<template>
  <header
    v-bind="mergeWlAttrs(section('root'), attrs)"
    class="wl-page-header"
    :class="[
      `wl-page-header--${size}`,
      density === 'compact' && 'wl-page-header--compact'
    ]"
    data-wl="page-header"
    :data-size="size"
    :data-density="density"
  >
    <div v-if="$slots.breadcrumbs" v-bind="section('breadcrumbs')" class="wl-page-header__breadcrumbs">
      <slot name="breadcrumbs"></slot>
    </div>

    <div v-bind="section('main')" class="wl-page-header__main">
      <div v-bind="section('content')" class="wl-page-header__content">
        <div v-if="hasLead" v-bind="section('eyebrow')" class="wl-page-header__eyebrow">
          <slot name="eyebrow">{{ eyebrow }}</slot>
        </div>

        <component
          :is="headingTag"
          v-bind="section('title')"
          class="wl-page-header__title"
          :class="`wl-page-header__title--${size}`"
        >
          <slot name="title">{{ title }}</slot>
        </component>

        <div v-if="hasDescription" v-bind="section('description')" class="wl-page-header__description">
          <slot name="description">{{ description }}</slot>
        </div>

        <div v-if="hasMeta" v-bind="section('meta')" class="wl-page-header__meta">
          <slot name="meta"></slot>
        </div>
      </div>

      <div v-if="hasActions" v-bind="section('actions')" class="wl-page-header__actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div v-if="$slots.navigation" v-bind="section('navigation')" class="wl-page-header__navigation">
      <slot name="navigation"></slot>
    </div>
  </header>
</template>

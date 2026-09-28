<script setup lang="ts">
import { computed, useSlots, type Slots } from "vue";
import { useWlPt } from "../config";

const props = withDefaults(
  defineProps<{
    hoverable?: boolean;
    pt?: Record<string, unknown>;
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
  <section v-bind="section('root')" :class="rootClass" data-wl="card">
    <div v-if="slots.header" v-bind="section('header')" class="wl-card__header"><slot name="header" /></div>
    <div v-bind="section('body')" class="wl-card__body">
      <div v-if="slots.title || slots.subtitle" v-bind="section('caption')" class="wl-card__caption">
        <div v-if="slots.title" v-bind="section('title')" class="wl-card__title"><slot name="title" /></div>
        <div v-if="slots.subtitle" v-bind="section('subtitle')" class="wl-card__subtitle"><slot name="subtitle" /></div>
      </div>
      <div v-bind="section('content')" class="wl-card__content"><slot /></div>
      <div v-if="slots.footer" v-bind="section('footer')" class="wl-card__footer"><slot name="footer" /></div>
    </div>
  </section>
</template>

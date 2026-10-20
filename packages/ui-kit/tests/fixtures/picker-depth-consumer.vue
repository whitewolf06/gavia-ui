<script setup lang="ts">
import { ref } from "vue";
import { WlCalendar, WlDatePicker, WlTimePicker } from "../../src";
const single = ref("");
const selected = ref<string[]>([]);
const mode = ref(false);
const dynamic = ref<string | string[]>("");
const time = ref<string | null>(null);
</script>

<template>
  <WlCalendar v-model="single" />
  <WlCalendar v-model="selected" multiple><template #day="{ iso, events }">{{ iso.toUpperCase() }}: {{ events.length }}</template></WlCalendar>
  <WlCalendar v-model="dynamic" :multiple="mode" />
  <WlTimePicker v-model="time" :hour-format="12" step="900" />
  <!-- @vue-expect-error Multiple calendar cannot widen its array model to a scalar. -->
  <WlCalendar v-model="single" multiple />
  <!-- @vue-expect-error Arrays require the explicit runtime multiple mode. -->
  <WlCalendar v-model="selected" />
  <!-- @vue-expect-error Date-only formats do not change the ISO model to datetime. -->
  <WlDatePicker v-model="time" display-format="locale" :format-options="{ timeZone: 'UTC' }" />
</template>

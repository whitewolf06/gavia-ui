<script setup lang="ts">
import { ref } from "vue";
import type { WlDateRange } from "../../src";
import { WlAccordion, WlAlert, WlAutocomplete, WlAvatar, WlBadge, WlBreadcrumbs, WlButton, WlButtonGroup, WlCalendar, WlCard, WlCheckbox, WlChip, WlColorPicker, WlCommandPalette, WlConfirmDialog, WlDatePicker, WlDialog, WlDivider, WlDrawer, WlEmpty, WlField, WlFileUpload, WlFilePicker, WlFilterBar, WlIcon, WlIconButton, WlInput, WlMenu, WlMultiSelect, WlNavItem, WlNumberInput, WlPagination, WlPageHeader, WlPasswordInput, WlPill, WlPopover, WlProgress, WlRadio, WlSegmented, WlSelect, WlSidebar, WlSkeleton, WlSlider, WlSpinner, WlStatCard, WlSteps, WlSwitch, WlTable, WlTabs, WlTag, WlTextarea, WlTimePicker, WlToast, type WlFilePickerExpose } from "../../src";
const picker = ref<WlFilePickerExpose | null>(null);
const dateRange = ref<WlDateRange | null>(["2026-10-15", "2026-10-20"]);
const projects = [{ id: 1, label: "Gavia" }, { id: 2, label: "Classic" }];
const projectId = ref<number | null>(null);
function inputEvent(event: Event): void { event.preventDefault(); }
function clickEvent(event: MouseEvent): void { event.button.toFixed(); }
</script>

<template>
  <!-- Every public component is used through the root package export under strictTemplates. -->
  <WlAccordion aria-label="Public API sample" data-testid="WlAccordion" />
  <WlAlert aria-label="Public API sample" data-testid="WlAlert" />
  <WlAutocomplete aria-label="Public API sample" data-testid="WlAutocomplete" />
  <WlAvatar aria-label="Public API sample" data-testid="WlAvatar" />
  <WlBadge aria-label="Public API sample" data-testid="WlBadge" />
  <WlBreadcrumbs aria-label="Public API sample" data-testid="WlBreadcrumbs" />
  <WlButton type="submit" form="project" @click="clickEvent" aria-label="Public API sample" data-testid="WlButton" />
  <WlButtonGroup aria-label="Public API sample" data-testid="WlButtonGroup" />
  <WlCalendar aria-label="Public API sample" data-testid="WlCalendar" />
  <WlCard aria-label="Public API sample" data-testid="WlCard" />
  <WlCheckbox aria-label="Public API sample" data-testid="WlCheckbox" />
  <WlChip aria-label="Public API sample" data-testid="WlChip" />
  <WlColorPicker aria-label="Public API sample" data-testid="WlColorPicker" />
  <WlCommandPalette aria-label="Public API sample" data-testid="WlCommandPalette" />
  <WlConfirmDialog aria-label="Public API sample" data-testid="WlConfirmDialog" />
  <WlDatePicker aria-label="Public API sample" data-testid="WlDatePicker" />
  <WlDatePicker v-model="dateRange" selection-mode="range" name="trip-dates" aria-label="Trip dates" data-testid="date-range" />
  <WlDialog aria-label="Public API sample" data-testid="WlDialog" />
  <WlDivider aria-label="Public API sample" data-testid="WlDivider" />
  <WlDrawer aria-label="Public API sample" data-testid="WlDrawer" />
  <WlEmpty aria-label="Public API sample" data-testid="WlEmpty" />
  <WlField label="Title" hint="Help"><template #default="{ inputId, ariaDescribedby, invalid, required }"><WlInput :id="inputId" :aria-describedby="ariaDescribedby" :invalid="invalid" :required="required" /></template></WlField>
  <WlFileUpload aria-label="Public API sample" data-testid="WlFileUpload" />
  <WlFilePicker ref="picker" aria-label="Public API sample" data-testid="WlFilePicker" />
  <WlFilterBar aria-label="Public API sample" data-testid="WlFilterBar" />
  <WlIcon aria-label="Public API sample" data-testid="WlIcon" />
  <WlIconButton aria-label="Public API sample" data-testid="WlIconButton" />
  <WlInput name="title" :maxlength="80" @input="inputEvent" aria-label="Public API sample" data-testid="WlInput" />
  <WlMenu aria-label="Public API sample" data-testid="WlMenu" />
  <WlMultiSelect aria-label="Public API sample" data-testid="WlMultiSelect" />
  <WlNavItem aria-label="Public API sample" data-testid="WlNavItem" />
  <WlNumberInput aria-label="Public API sample" data-testid="WlNumberInput" />
  <WlPagination :page-count="5" aria-label="Public API sample" data-testid="WlPagination" />
  <WlPageHeader aria-label="Public API sample" data-testid="WlPageHeader" />
  <WlPasswordInput aria-label="Public API sample" data-testid="WlPasswordInput" />
  <WlPill aria-label="Public API sample" data-testid="WlPill" />
  <WlPopover aria-label="Public API sample" data-testid="WlPopover" />
  <WlProgress aria-label="Public API sample" data-testid="WlProgress" />
  <WlRadio :value="'one'" aria-label="Public API sample" data-testid="WlRadio" />
  <WlSegmented aria-label="Public API sample" data-testid="WlSegmented" />
  <WlSelect aria-label="Public API sample" data-testid="WlSelect" />
  <WlSelect v-model="projectId" :options="projects" option-label="label" option-value="id" name="project" aria-label="Project" data-testid="project-select" />
  <WlSidebar aria-label="Public API sample" data-testid="WlSidebar" />
  <WlSkeleton aria-label="Public API sample" data-testid="WlSkeleton" />
  <WlSlider aria-label="Public API sample" data-testid="WlSlider" />
  <WlSpinner aria-label="Public API sample" data-testid="WlSpinner" />
  <WlStatCard aria-label="Public API sample" data-testid="WlStatCard" />
  <WlSteps aria-label="Public API sample" data-testid="WlSteps" />
  <WlSwitch aria-label="Public API sample" data-testid="WlSwitch" />
  <WlTable aria-label="Public API sample" data-testid="WlTable" />
  <WlTabs aria-label="Public API sample" data-testid="WlTabs" />
  <WlTag aria-label="Public API sample" data-testid="WlTag" />
  <WlTextarea :rows="5" :cols="40" aria-label="Public API sample" data-testid="WlTextarea" />
  <WlTimePicker aria-label="Public API sample" data-testid="WlTimePicker" />
  <WlToast aria-label="Public API sample" data-testid="WlToast" />
  <!-- @vue-expect-error Named enum contracts remain strict after adding native attrs. -->
  <WlButton variant="unknown" />
  <!-- @vue-expect-error Native listeners are events, not text. -->
  <WlInput @input="(value: string) => value.toUpperCase()" />
  <!-- @vue-expect-error Kit size remains an enum. -->
  <WlInput :size="80" />
  <!-- @vue-expect-error Page headers expose only supported heading levels. -->
  <WlPageHeader :heading-level="4" />
</template>

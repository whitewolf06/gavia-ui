<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue";
import type { WlDensity } from "../types";
import type { WlNoModelModifiers } from "../model-types";
import type { WlFilterBarExpose, WlFilterBarSlots } from "../overlay-types";
import { useWlId } from "../utils/useWlId";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import WlButton from "./WlButton.vue";
import WlIcon from "./WlIcon.vue";
import WlIconButton from "./WlIconButton.vue";

const props = withDefaults(
  defineProps<{
    activeCount?: number;
    openModifiers?: WlNoModelModifiers;
    ariaLabel?: string;
    toggleLabel?: string;
    panelTitle?: string;
    clearLabel?: string;
    applyLabel?: string;
    closeLabel?: string;
    showClear?: boolean;
    showApply?: boolean;
    disabled?: boolean;
    density?: WlDensity;
  }>(),
  {
    activeCount: 0,
    ariaLabel: "Фильтры",
    toggleLabel: "Фильтры",
    panelTitle: "Фильтры",
    clearLabel: "Сбросить",
    applyLabel: "Применить",
    closeLabel: "Закрыть фильтры",
    showClear: true,
    showApply: true,
    disabled: false,
    density: "default"
  }
);

const emit = defineEmits<{
  clear: [];
  apply: [];
  open: [];
  close: [];
}>();

const open = defineModel<boolean, never>("open", { default: false });
const slots = defineSlots<WlFilterBarSlots>();
const panelId = `wl-filter-bar-panel-${useWlId()}`;
const panelRef = ref<HTMLElement | null>(null);
const isMobile = ref(false);
let mediaQuery: MediaQueryList | null = null;

const count = computed(() => Number.isFinite(props.activeCount) ? Math.max(0, Math.floor(props.activeCount)) : 0);
const hasSummary = computed(() => Boolean(slots.summary));
const hasLeading = computed(() => Boolean(slots.leading));
const hasActions = computed(() => Boolean(slots.actions) || (props.showClear && count.value > 0));
const hasFooter = computed(() => Boolean(slots.footer) || props.showApply);

function requestOpen(): void {
  if (props.disabled || open.value) return;
  open.value = true;
}

function updateMedia(event: MediaQueryListEvent | MediaQueryList): void {
  isMobile.value = event.matches;
}

onMounted(() => {
  if (typeof window.matchMedia === "function") {
    mediaQuery = window.matchMedia("(max-width: 720px)");
    updateMedia(mediaQuery);
    mediaQuery.addEventListener?.("change", updateMedia);
  }
});

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener?.("change", updateMedia);
});

const { requestClose } = useOverlayLifecycle({
  visible: open,
  container: panelRef,
  enabled: () => !props.disabled,
  lockScroll: () => isMobile.value,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});

function toggle(): void {
  if (props.disabled) return;
  open.value ? requestClose() : requestOpen();
}

function clear(): void {
  if (!props.disabled) emit("clear");
}

function apply(): void {
  if (props.disabled) return;
  emit("apply");
  requestClose();
}

defineExpose({ open: requestOpen, close: requestClose, toggle, clear, apply } satisfies WlFilterBarExpose);
</script>

<template>
  <section
    class="wl-filter-bar"
    :class="[
      open && 'is-open',
      disabled && 'is-disabled',
      density === 'compact' && 'wl-filter-bar--compact'
    ]"
    :aria-label="ariaLabel"
    data-wl="filter-bar"
    :data-density="density"
    :data-open="open"
  >
    <div class="wl-filter-bar__mobile-toggle">
      <WlButton
        variant="secondary"
        size="sm"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="toggle"
      >
        <template #icon><WlIcon name="filter" :size="15" /></template>
        {{ toggleLabel }}
        <span v-if="count" class="wl-filter-bar__count">{{ count }}</span>
      </WlButton>
    </div>

    <div
      :id="panelId"
      ref="panelRef"
      class="wl-filter-bar__panel"
      :class="open && 'wl-filter-bar__panel--open'"
      :aria-hidden="isMobile && !open ? 'true' : undefined"
      :inert="isMobile && !open"
      tabindex="-1"
    >
      <div class="wl-filter-bar__mobile-head">
        <strong class="wl-filter-bar__title">{{ panelTitle }}</strong>
        <WlIconButton
          icon="x"
          size="sm"
          variant="ghost"
          :aria-label="closeLabel"
          @click="requestClose"
        />
      </div>

      <div class="wl-filter-bar__toolbar">
        <div v-if="hasLeading" class="wl-filter-bar__leading">
          <slot name="leading" />
        </div>

        <div class="wl-filter-bar__controls">
          <slot :open="requestOpen" :close="requestClose" :clear="clear" />
        </div>

        <div v-if="hasActions" class="wl-filter-bar__actions">
          <slot name="actions" :clear="clear" :close="requestClose">
            <WlButton v-if="showClear && count > 0" variant="ghost" size="sm" @click="clear">
              {{ clearLabel }}
            </WlButton>
          </slot>
        </div>
      </div>

      <div v-if="hasFooter" class="wl-filter-bar__footer">
        <slot name="footer" :apply="apply" :clear="clear" :close="requestClose">
          <WlButton class="wl-filter-bar__apply" variant="primary" size="sm" @click="apply">
            {{ applyLabel }}
          </WlButton>
        </slot>
      </div>
    </div>

    <div v-if="hasSummary" class="wl-filter-bar__summary">
      <slot name="summary" :clear="clear" />
    </div>

    <button
      v-if="open"
      type="button"
      class="wl-filter-bar__backdrop"
      :aria-label="closeLabel"
      @click="requestClose"
    />
  </section>
</template>

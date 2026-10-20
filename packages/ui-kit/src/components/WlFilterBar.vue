<script setup lang="ts">
/** WlFilterBar public component contract.
 * @since 0.3.0
 * @slot leading - Search or another control before filters.
 * @slot default - Filter controls; scope { open, close, clear }.
 * @slot actions - Desktop panel actions; scope { clear, close }.
 * @slot footer - Mobile Drawer actions; scope { apply, clear, close }.
 * @slot summary - Active filters or chips below the panel; scope { clear }.
 */
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs
} from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlFilterBarExpose, WlFilterBarSlots } from "../overlay-types";
import type { WlPt } from "../pt-types";
import type { WlDensity } from "../types";
import { mergeWlAttrs, useWlLocaleText, useWlPt } from "../config";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { useWlId } from "../utils/useWlId";
import WlButton from "./WlButton.vue";
import WlIcon from "./WlIcon.vue";
import WlIconButton from "./WlIconButton.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    /**
     * Number of active filters.
     * @default 0
     */
    activeCount?: number;
    /** Modifier contract for open state; built-in modifiers are unsupported. */
    openModifiers?: WlNoModelModifiers;
    /**
     * Accessible name when an external label is not referenced.
     * @default "Фильтры"
     */
    ariaLabel?: string;
    /**
     * Accessible name of the filter panel's toggle action.
     * @default "Фильтры"
     */
    toggleLabel?: string;
    /**
     * Visible title of the mobile filter panel.
     * @default "Фильтры"
     */
    panelTitle?: string;
    /**
     * Accessible text for the clear action.
     * @default "Сбросить"
     */
    clearLabel?: string;
    /**
     * Accessible text for the apply action.
     * @default "Применить"
     */
    applyLabel?: string;
    /**
     * Accessible text for the close action.
     * @default "Закрыть фильтры"
     */
    closeLabel?: string;
    /**
     * Show the filter panel's clear action when applicable.
     * @default true
     */
    showClear?: boolean;
    /**
     * Show the filter panel's apply action.
     * @default true
     */
    showApply?: boolean;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"filterbar">;
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
  /** Reset filter values in the application. */
  clear: [];
  /** Apply current values in the application. */
  apply: [];
  /** Emitted when the surface opens. */
  open: [];
  /** Emitted when the surface closes. */
  close: [];
}>();

/** Whether the mobile filter panel is open.
 * Paired with update:open.
 * @default false
 */
const open = defineModel<boolean, never>("open", { default: false });

const slots = defineSlots<WlFilterBarSlots>();

const localeText = useWlLocaleText();
const attrs = useAttrs();
const section = useWlPt("filterbar", computed(() => props.pt));

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
  modal: () => isMobile.value,
  backdrop: () => panelRef.value?.parentElement?.querySelector<HTMLElement>(".wl-filter-bar__backdrop") ?? null,
  lockScroll: () => isMobile.value,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});

function toggle(): void {
  if (props.disabled) return;
  if (open.value) requestClose();
  else requestOpen();
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
    v-bind="mergeWlAttrs(section('root'), attrs)"
    class="wl-filter-bar"
    :class="[
      open && 'is-open',
      disabled && 'is-disabled',
      density === 'compact' && 'wl-filter-bar--compact'
    ]"
    :aria-label="localeText('ariaLabel', ariaLabel, 'filters')"
    data-wl="filter-bar"
    :data-density="density"
    :data-open="open"
  >
    <div v-bind="section('mobileToggle')" class="wl-filter-bar__mobile-toggle">
      <WlButton
        variant="secondary"
        size="sm"
        :disabled="disabled"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="toggle"
      >
        <template #icon><WlIcon name="filter" :size="15" /></template>
        {{ localeText('toggleLabel', toggleLabel, 'filters') }}
        <span v-if="count" class="wl-filter-bar__count">{{ count }}</span>
      </WlButton>
    </div>

    <div
      :id="panelId"
      ref="panelRef"
      v-bind="section('panel')"
      class="wl-filter-bar__panel"
      :class="open && 'wl-filter-bar__panel--open'"
      :role="isMobile ? 'dialog' : undefined"
      :aria-modal="isMobile && open || undefined"
      :aria-label="isMobile ? localeText('panelTitle', panelTitle, 'filters') : undefined"
      :aria-hidden="isMobile && !open ? 'true' : undefined"
      :inert="isMobile && !open"
      tabindex="-1"
    >
      <div v-bind="section('mobileHead')" class="wl-filter-bar__mobile-head">
        <strong v-bind="section('title')" class="wl-filter-bar__title">{{ localeText('panelTitle', panelTitle, 'filters') }}</strong>
        <WlIconButton
          icon="x"
          size="sm"
          variant="ghost"
          v-bind="section('closeButton')"
          :aria-label="localeText('closeLabel', closeLabel, 'closeFilters')"
          @click="requestClose"
        />
      </div>

      <div v-bind="section('toolbar')" class="wl-filter-bar__toolbar">
        <div v-if="hasLeading" v-bind="section('leading')" class="wl-filter-bar__leading">
          <slot name="leading"></slot>
        </div>

        <div v-bind="section('controls')" class="wl-filter-bar__controls">
          <slot :open="requestOpen" :close="requestClose" :clear="clear"></slot>
        </div>

        <div v-if="hasActions" v-bind="section('actions')" class="wl-filter-bar__actions">
          <slot name="actions" :clear="clear" :close="requestClose">
            <WlButton
              v-if="showClear && count > 0"
              variant="ghost"
              size="sm"
              @click="clear"
            >
              {{ localeText('clearLabel', clearLabel, 'reset') }}
            </WlButton>
          </slot>
        </div>
      </div>

      <div v-if="hasFooter" v-bind="section('footer')" class="wl-filter-bar__footer">
        <slot
          name="footer"
          :apply="apply"
          :clear="clear"
          :close="requestClose"
        >
          <WlButton
            class="wl-filter-bar__apply"
            variant="primary"
            size="sm"
            @click="apply"
          >
            {{ localeText('applyLabel', applyLabel, 'apply') }}
          </WlButton>
        </slot>
      </div>
    </div>

    <div v-if="hasSummary" v-bind="section('summary')" class="wl-filter-bar__summary">
      <slot name="summary" :clear="clear"></slot>
    </div>

    <button
      v-if="open"
      v-bind="section('backdrop')"
      type="button"
      class="wl-filter-bar__backdrop"
      :aria-label="localeText('closeLabel', closeLabel, 'closeFilters')"
      @click="requestClose"
    ></button>
  </section>
</template>

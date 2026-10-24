<script setup lang="ts">
/** WlDrawer public component contract.
 * @since 0.1.0
 * @slot header - Custom header.
 * @slot default - Panel content.
 * @slot footer - Footer.
 */
import { computed, ref, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlOverlayInitialFocus, WlOverlaySize } from "../overlay-types";
import type { WlPt } from "../pt-types";
import type { WlDrawerPosition } from "../types";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { overlayWidth, resolveOverlayInitialFocus } from "../utils/overlayProps";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Heading (when no header slot is provided). */
  header?: string;
  /** Modifier contract for visibility; built-in modifiers are unsupported. */
  visibleModifiers?: WlNoModelModifiers;
  /**
   * Opening side.
   * @default "right"
   */
  position?: WlDrawerPosition;
  /**
   * Modal mode with backdrop.
   * @default true
   */
  modal?: boolean;
  /** Close by clicking the backdrop.
   * @default true
   */
  dismissible?: boolean;
  /**
   * Show the explicit close action.
   * @default true
   */
  closable?: boolean;
  /** Size within the component family's documented scale. */
  size?: WlOverlaySize;
  /** Explicit surface width as a CSS length or a pixel number. */
  width?: string | number;
  /** Initial focus policy or target for the opened modal surface. */
  initialFocus?: WlOverlayInitialFocus;
  /**
   * Close with Escape.
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Locks page scrolling while the panel is open.
   * @default true
   */
  blockScroll?: boolean;
  /** Accessible panel name without a text heading. */
  ariaLabel?: string;
  /** ID of the element labelling the panel. */
  ariaLabelledby?: string;
  /** Opening and closing animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"drawer">;
}>(), {
  position: "right", modal: true, dismissible: true, closable: true, closeOnEscape: true, blockScroll: true,
  motion: undefined
});

const emit = defineEmits<{
  /** Panel fully opened. */
  open: [];
  /** Panel closed. */
  close: [];
  /** Emitted after the closing transition has completed. */
  afterLeave: []; }>();

/** Whether the surface is open.
 * Paired with update:visible.
 * @default false
 */
const visible = defineModel<boolean, never>("visible", { default: false });

defineSlots<{
  /** Panel content. */
  default?(props: {}): unknown;
  /** Custom header. */
  header?(props: {}): unknown;
  /** Footer. */
  footer?(props: {}): unknown; }>();

const locale = useWlLocale();

const drawer = ref<HTMLElement | null>(null);
const titleId = useWlId();
const attrs = useAttrs();
const section = useWlPt("drawer", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
useOverlayLifecycle({
  visible, container: drawer,
  initialFocus: () => resolveOverlayInitialFocus(props.initialFocus, drawer.value),
  closeOnEscape: () => props.closeOnEscape,
  modal: () => props.modal,
  trapFocus: () => props.modal,
  lockScroll: () => props.modal && props.blockScroll,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
function onMask(event: MouseEvent): void {
  if (event.target === event.currentTarget && props.dismissible) visible.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition
      name="wl-drawer-motion"
      :css="motion"
      @before-leave="markOverlayLeaving"
      @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering"
      @after-leave="emit('afterLeave')"
    >
      <!-- Pointer-only backdrop dismissal complements Escape in the overlay lifecycle. -->
      <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
      <div
        v-if="visible"
        v-bind="section('mask')"
        class="wl-drawer-mask"
        :class="{ 'wl-mask': modal, 'wl-drawer-host': !modal }"
        @mousedown="onMask"
      >
        <aside
          ref="drawer"
          v-bind="mergeWlAttrs(section('root'), attrs)"
          class="wl-drawer"
          :class="[`wl-drawer--${position}`, size && `wl-drawer--size-${size}`]"
          :style="{ width: overlayWidth(width) }"
          :data-size="size"
          role="dialog"
          :aria-modal="modal || undefined"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby ?? (!ariaLabel && header ? titleId : undefined)"
          tabindex="-1"
          data-wl="drawer"
        >
          <header v-if="header || $slots.header || closable" v-bind="section('header')" class="wl-drawer__header">
            <slot name="header">
              <span v-bind="section('title')" :id="titleId" class="wl-drawer__title">{{ header }}</span>
            </slot>
            <button
              v-if="closable"
              v-bind="section('closeButton.root')"
              type="button"
              class="wl-overlay-close"
              :aria-label="locale.close"
              @click="visible = false"
            ><WlIcon v-bind="section('closeButton.icon')" name="x" :size="14" /></button>
          </header>
          <div v-bind="section('content')" class="wl-drawer__content"><slot></slot></div>
          <footer v-if="$slots.footer" v-bind="section('footer')" class="wl-drawer__footer"><slot name="footer"></slot></footer>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

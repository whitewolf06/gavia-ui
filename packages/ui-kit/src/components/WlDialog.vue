<script setup lang="ts">
/** WlDialog public component contract.
 * @since 0.1.0
 * @slot header - Custom header.
 * @slot default - Dialog body.
 * @slot footer - Footer (buttons).
 */
import { computed, ref, useAttrs } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlOverlayInitialFocus, WlOverlaySize } from "../overlay-types";
import type { WlPt } from "../pt-types";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { useOverlayLifecycle } from "../utils/overlayLifecycle";
import { overlayWidth, resolveOverlayInitialFocus, useDismissible, useOverlayFullscreen } from "../utils/overlayProps";
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
   * Modal mode with backdrop.
   * @default true
   */
  modal?: boolean;
  /**
   * Button that closes the surface.
   * @default true
   */
  closable?: boolean;
  /** Close by clicking the backdrop.
   * @deprecated Use dismissible. */
  dismissable?: boolean;
  /** Allow the surface to close through its documented dismissal interactions. */
  dismissible?: boolean;
  /**
   * Close with Escape.
   * @default true
   */
  closeOnEscape?: boolean;
  /**
   * Locks page scrolling while the dialog is open.
   * @default true
   */
  blockScroll?: boolean;
  /** Accessible dialog name without a text heading. */
  ariaLabel?: string;
  /** ID of the element labelling the dialog. */
  ariaLabelledby?: string;
  /** Width (CSS), for example "480px". */
  width?: string | number;
  /** Size within the component family's documented scale. */
  size?: WlOverlaySize;
  /** Expand the dialog to fill the viewport. */
  fullscreen?: boolean | "mobile";
  /** Initial focus policy or target for the opened modal surface. */
  initialFocus?: WlOverlayInitialFocus;
  /** Opening and closing animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"dialog">;
}>(), {
  modal: true, closable: true, dismissable: false, closeOnEscape: true, blockScroll: true,
  motion: undefined, dismissible: undefined
});

const emit = defineEmits<{
  /** Dialog fully opened. */
  open: [];
  /** Dialog closed. */
  close: [];
  /** Closing transition completed and dialog DOM removed. */
  afterLeave: []; }>();

/** Whether the surface is open.
 * Paired with update:visible.
 * @default false
 */
const visible = defineModel<boolean, never>("visible", { default: false });

defineSlots<{
  /** Dialog body. */
  default?(props: {}): unknown;
  /** Custom header. */
  header?(props: {}): unknown;
  /** Footer (buttons). */
  footer?(props: {}): unknown; }>();

const locale = useWlLocale();

const dialog = ref<HTMLElement | null>(null);
const titleId = useWlId();
const attrs = useAttrs();
const section = useWlPt("dialog", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const dismissible = useDismissible("WlDialog", computed(() => props.dismissible), computed(() => props.dismissable));
const fullscreenActive = useOverlayFullscreen(computed(() => props.fullscreen));
useOverlayLifecycle({
  visible, container: dialog,
  initialFocus: () => resolveOverlayInitialFocus(props.initialFocus, dialog.value),
  closeOnEscape: () => props.closeOnEscape,
  modal: () => props.modal,
  trapFocus: () => props.modal,
  lockScroll: () => props.modal && props.blockScroll,
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
function onMask(event: MouseEvent): void {
  if (event.target === event.currentTarget && dismissible.value) visible.value = false;
}
</script>

<template>
  <Teleport to="body">
    <Transition
      name="wl-dialog-motion"
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
        class="wl-dialog-mask"
        :class="{ 'wl-mask': modal, 'wl-dialog-host': !modal }"
        @mousedown="onMask"
      >
        <section
          ref="dialog"
          data-wl="dialog"
          v-bind="mergeWlAttrs(section('root'), attrs)"
          class="wl-dialog"
          :class="[
            size && `wl-dialog--${size}`,
            fullscreen === true && 'wl-dialog--fullscreen',
            fullscreen === 'mobile' && 'wl-dialog--mobile-fullscreen'
          ]"
          role="dialog"
          :aria-modal="modal || undefined"
          :aria-label="ariaLabel"
          :aria-labelledby="ariaLabelledby ?? (!ariaLabel && header ? titleId : undefined)"
          :style="{ width: fullscreenActive ? undefined : overlayWidth(width) }"
          :data-size="size"
          tabindex="-1"
        >
          <header v-if="header || $slots.header || closable" v-bind="section('header')" class="wl-dialog__header">
            <slot name="header">
              <span
                v-if="header"
                v-bind="section('title')"
                :id="titleId"
                class="wl-dialog__title"
              >{{ header }}</span>
            </slot>
            <div v-if="closable" v-bind="section('headerActions')" class="wl-dialog__actions">
              <button
                v-bind="section('pcCloseButton.root')"
                type="button"
                class="wl-overlay-close"
                :aria-label="locale.close"
                @click="visible = false"
              ><WlIcon v-bind="section('pcCloseButton.icon')" name="x" :size="14" /></button>
            </div>
          </header>
          <div v-bind="section('content')" class="wl-dialog__content"><slot></slot></div>
          <footer v-if="$slots.footer" v-bind="section('footer')" class="wl-dialog__footer"><slot name="footer"></slot></footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

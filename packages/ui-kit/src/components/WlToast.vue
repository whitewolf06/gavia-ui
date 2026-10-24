<script setup lang="ts">
/** WlToast public component contract.
 * @since 0.1.0
 * @slot message - Custom message content.
 * @slot action - Custom action content.
 */
import { computed, onBeforeUnmount, useAttrs, watch } from "vue";
import type { WlPt } from "../pt-types";
import { mergeWlAttrs, useWlLocale, useWlMotion, useWlPt } from "../config";
import { getWlToastTone, useToastStore, type WlToastMessage, type WlToastPosition } from "../services/toast";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlButton from "./WlButton.vue";
import WlIcon from "./WlIcon.vue";
defineOptions({ inheritAttrs: false });

const props = withDefaults(defineProps<{
  /** Notification group. */
  group?: string;
  /** Message animation; defaults to WlConfig.motion (true). */
  motion?: boolean;
  /**
   * Screen position of the toast group.
   * @default "bottom-center"
   */
  position?: WlToastPosition;
  /**
   * Maximum retained messages in this toast group; older messages are removed.
   * @default 5
   */
  max?: number;
  /** Attributes of internal Gavia UI elements. */
  pt?: WlPt<"toast">;
}>(), { motion: undefined, position: "bottom-center", max: 5 });

defineSlots<{
  /** Custom toast message content with a dismiss callback. */
  message?(props: { message: WlToastMessage; dismiss: () => void }): unknown;
  /** Custom toast action; receives the message and a dismiss callback. */
  action?(props: { message: WlToastMessage; dismiss: () => void }): unknown;
}>();

const locale = useWlLocale();

const store = useToastStore();
const attrs = useAttrs();
const section = useWlPt("toast", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const messages = computed(() => store.messages.value.filter((message) => message.group === props.group));
const iconName = { neutral: "info", accent: "info", info: "info", success: "check", warning: "warn", danger: "x" } as const;
const hover = Symbol("wl-toast-hover");
const focus = Symbol("wl-toast-focus");
watch(() => [messages.value, props.max] as const, ([entries, max]) => {
  const limit = Number.isFinite(max) && max >= 1 ? Math.floor(max) : 5;
  entries.slice(0, Math.max(0, entries.length - limit)).forEach((message) => store.remove(message.id));
}, { immediate: true });
function onFocusOut(message: WlToastMessage, event: FocusEvent): void {
  const target = event.relatedTarget;
  if (event.currentTarget instanceof HTMLElement && !event.currentTarget.contains(target instanceof Node ? target : null)) {
    store.resume(message.id, focus);
  }
}
function action(message: WlToastMessage): void {
  try {
    message.action?.onClick();
  } finally {
    store.remove(message.id);
  }
}
function releasePaused(entries: WlToastMessage[]): void {
  entries.forEach((message) => {
    store.resume(message.id, hover);
    store.resume(message.id, focus);
  });
}
watch(() => props.group, (_group, previous) => {
  releasePaused(store.messages.value.filter((message) => message.group === previous));
});
onBeforeUnmount(() => {
  releasePaused(messages.value);
});
</script>

<template>
  <Teleport to="body">
    <div
      v-bind="mergeWlAttrs(section('root'), attrs)"
      class="wl-toast"
      data-wl="toast"
      :data-position="position"
    >
      <TransitionGroup
        name="wl-toast-motion"
        :css="motion"
        @before-leave="markOverlayLeaving"
        @before-enter="restoreOverlayEntering"
        @leave-cancelled="restoreOverlayEntering"
      >
        <!-- Hover and focus pause the same message timer; action buttons retain keyboard ownership. -->
        <!-- eslint-disable-next-line vuejs-accessibility/no-static-element-interactions -->
        <div
          v-for="message in messages"
          :key="message.id"
          v-bind="section('message', { tone: getWlToastTone(message), severity: message.severity, id: message.id })"
          class="wl-toast__message"
          :data-severity="message.severity"
          :data-tone="getWlToastTone(message)"
          :role="getWlToastTone(message) === 'danger' ? 'alert' : 'status'"
          aria-atomic="true"
          @mouseenter="store.pause(message.id, hover)"
          @mouseleave="store.resume(message.id, hover)"
          @focusin="store.pause(message.id, focus)"
          @focusout="onFocusOut(message, $event)"
        >
          <slot name="message" :message="message" :dismiss="() => store.remove(message.id)">
            <div v-bind="section('messageContent')" class="wl-toast__content">
              <WlIcon
                v-bind="section('messageIcon', { tone: getWlToastTone(message), severity: message.severity, id: message.id })"
                :name="iconName[getWlToastTone(message)]"
                :size="18"
                class="wl-toast__icon"
                :data-tone="getWlToastTone(message)"
              />
              <div v-bind="section('messageText')" class="wl-toast__text">
                <div v-bind="section('summary')" class="wl-toast__summary">{{ message.summary }}</div>
                <div v-if="message.detail" v-bind="section('detail')" class="wl-toast__detail">{{ message.detail }}</div>
              </div>
              <slot name="action" :message="message" :dismiss="() => store.remove(message.id)">
                <WlButton
                  v-if="message.action"
                  v-bind="section('actionButton')"
                  class="wl-toast__action"
                  variant="ghost"
                  size="sm"
                  @click="action(message)"
                >{{ message.action.label }}</WlButton>
              </slot>
              <button
                v-bind="section('closeButton')"
                type="button"
                class="wl-toast__close"
                :aria-label="locale.close"
                @click="store.remove(message.id)"
              >
                <WlIcon v-bind="section('closeIcon')" name="x" :size="14" />
              </button>
            </div>
          </slot>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

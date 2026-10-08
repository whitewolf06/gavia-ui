<script setup lang="ts">
import type { WlPt } from "../pt-types";
import { computed, useAttrs } from "vue";
import { mergeWlAttrs, useWlMotion, useWlPt } from "../config";
import { useToastStore } from "../services/toast";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";

defineOptions({ inheritAttrs: false });
defineSlots<{}>();
const props = withDefaults(defineProps<{
  group?: string;
  motion?: boolean;
  pt?: WlPt<"toast">;
}>(), { motion: undefined });
const store = useToastStore();
const attrs = useAttrs();
const section = useWlPt("toast", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const messages = computed(() => store.messages.value.filter((message) => message.group === props.group));
const iconName = { success: "check", info: "info", warn: "warn", error: "x" } as const;
</script>

<template>
  <Teleport to="body">
    <div v-bind="mergeWlAttrs(section('root'), attrs)" class="wl-toast" data-wl="toast" aria-live="polite">
      <TransitionGroup name="wl-toast-motion" :css="motion"
        @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
        @leave-cancelled="restoreOverlayEntering">
      <div v-for="message in messages" :key="message.id"
        v-bind="section('message')" class="wl-toast__message" :data-severity="message.severity">
        <div v-bind="section('messageContent')" class="wl-toast__content">
          <WlIcon v-bind="section('messageIcon')" :name="iconName[message.severity]" :size="18" class="wl-toast__icon" />
          <div v-bind="section('messageText')" class="wl-toast__text">
            <div v-bind="section('summary')" class="wl-toast__summary">{{ message.summary }}</div>
            <div v-if="message.detail" v-bind="section('detail')" class="wl-toast__detail">{{ message.detail }}</div>
          </div>
          <button v-bind="section('closeButton')" type="button" class="wl-toast__close"
            aria-label="Закрыть" @click="store.remove(message.id)">
            <WlIcon v-bind="section('closeIcon')" name="x" :size="14" />
          </button>
        </div>
      </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

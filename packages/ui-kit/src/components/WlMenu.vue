<script setup lang="ts">
import { computed, ref } from "vue";
import { useWlMotion, useWlPt } from "../config";
import type { WlMenuItem } from "../types";
import { useAnchoredOverlay } from "../utils/anchoredOverlay";
import { markOverlayLeaving, restoreOverlayEntering } from "../utils/overlayTransition";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(defineProps<{
  items?: WlMenuItem[];
  popup?: boolean;
  ariaLabel?: string;
  ariaLabelledby?: string;
  motion?: boolean;
  pt?: Record<string, unknown>;
}>(), { items: () => [], popup: false, motion: undefined });
const emit = defineEmits<{ open: []; close: [] }>();
const section = useWlPt("menu", computed(() => props.pt));
const motion = useWlMotion(computed(() => props.motion));
const { visible, panel, style, toggle, show, hide } = useAnchoredOverlay({
  onOpen: () => emit("open"),
  onClose: () => emit("close")
});
const links = ref<HTMLElement[]>([]);
function activate(item: WlMenuItem, event: MouseEvent): void {
  event.preventDefault();
  if (item.disabled) return;
  item.command?.(item);
  if (props.popup) hide();
}
function onKeydown(event: KeyboardEvent): void {
  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const enabled = links.value.filter((node) => node.getAttribute("aria-disabled") !== "true");
  if (!enabled.length) return;
  event.preventDefault();
  const current = enabled.indexOf(document.activeElement as HTMLElement);
  const next = event.key === "Home" ? 0 : event.key === "End" ? enabled.length - 1
    : event.key === "ArrowDown" ? (current + 1) % enabled.length
    : (current + enabled.length - 1) % enabled.length;
  enabled[next]?.focus();
}
defineExpose({ toggle, show, hide });
</script>

<template>
  <Teleport to="body" :disabled="!popup">
    <Transition name="wl-pop-motion" :css="popup && motion"
      @before-leave="markOverlayLeaving" @before-enter="restoreOverlayEntering"
      @leave-cancelled="restoreOverlayEntering">
    <div v-if="!popup || visible" ref="panel" v-bind="section('root')"
      class="wl-menu" :style="popup ? style : undefined" data-wl="menu">
      <ul v-bind="section('list')" class="wl-menu__list" role="menu"
        :aria-label="ariaLabel" :aria-labelledby="ariaLabelledby" @keydown="onKeydown">
        <li v-for="(item, index) in items" :key="item.key ?? index" v-bind="section('item')"
          class="wl-menu__item" :role="item.separator ? 'separator' : 'none'">
          <div v-if="item.header !== undefined" v-bind="section('submenuLabel')" class="wl-menu__head">{{ item.header }}</div>
          <div v-else-if="item.separator" v-bind="section('separator')" class="wl-menu__sep" />
          <div v-else v-bind="section('itemContent')" class="wl-menu__item-content">
            <a :ref="(element) => { if (element) links[index] = element as HTMLElement; }"
              v-bind="section('itemLink')" class="wl-menu__link"
              :class="{ 'is-danger': item.danger, 'is-disabled': item.disabled }"
              role="menuitem" :aria-disabled="item.disabled || undefined" :tabindex="item.disabled ? -1 : 0"
              @click="activate(item, $event)">
              <WlIcon v-if="item.icon" :name="item.icon" :size="16" class="wl-menu__icon" />
              <span class="wl-menu__label">{{ item.label }}</span>
              <span v-if="item.shortcut" class="wl-menu__meta">{{ item.shortcut }}</span>
            </a>
          </div>
        </li>
      </ul>
    </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/** WlSteps public component contract.
 * @since 0.1.0
 * @slot step - Custom step content.
 */
import { ref, watch } from "vue";
import type { WlStepItem } from "../types";
import { useWlLocale } from "../config";
import { useWlRovingFocus } from "../utils/rovingFocus";
import WlIcon from "./WlIcon.vue";

const props = withDefaults(defineProps<{
  /** Ordered step descriptors; the application owns their state.
   * @default []
   */
  items?: readonly WlStepItem[];
  /** Zero-based index of the current step.
   * @default 0
   */
  current?: number;
  /** Enable step buttons and keyboard navigation, skipping disabled items.
   * @default false
   */
  clickable?: boolean;
  /** Layout and arrow-key direction for interactive steps.
   * @default "horizontal"
   */
  orientation?: "horizontal" | "vertical";
}>(), { items: () => [], current: 0 });
const emit = defineEmits<{
  /** Requests a new zero-based current step index. */
  "update:current": [index: number]; }>();
defineSlots<{
  /** Custom step content with its index, current and completed states. */
  step?(props: { item: WlStepItem; index: number; current: boolean; completed: boolean }): unknown; }>();
const locale = useWlLocale();
const buttons = ref<HTMLButtonElement[]>([]);
function setButton(element: unknown, index: number): void {
  if (typeof HTMLButtonElement !== "undefined" && element instanceof HTMLButtonElement)
    buttons.value[index] = element;
}
const { active, tabIndex, onKeydown } = useWlRovingFocus({
  count: () => props.items.length,
  isDisabled: (index) => !!props.items[index]?.disabled,
  orientation: () => props.orientation ?? "horizontal",
  focus: (index) => buttons.value[index]?.focus()
});
watch(() => props.current, (current) => {
  if (!props.items[current]?.disabled)
    active.value = current;
}, { immediate: true });
function choose(index: number): void {
  if (props.clickable && !props.items[index]?.disabled && index !== props.current)
    emit("update:current", index);
}
</script>

<template>
  <ol class="wl-steps" data-wl="steps" :data-orientation="orientation ?? 'horizontal'">
    <li
      v-for="(item, index) in items"
      :key="item.key ?? index"
      class="wl-steps__item"
      :class="{ 'wl-steps__item--first': index === 0, 'is-done': index < current, 'is-current': index === current }"
      :aria-current="index === current ? 'step' : undefined"
    >
      <span v-if="index > 0" class="wl-steps__line" aria-hidden="true"></span>
      <component
        :is="clickable ? 'button' : 'span'"
        :ref="(element: unknown) => setButton(element, index)"
        class="wl-steps__step"
        :class="{ 'is-done': index < current, 'is-current': index === current, 'is-error': item.error }"
        :type="clickable ? 'button' : undefined"
        :disabled="clickable ? item.disabled : undefined"
        :tabindex="clickable ? tabIndex(index) : undefined"
        @focus="active = index"
        @keydown="clickable && onKeydown($event)"
        @click="choose(index)"
      >
        <slot
          name="step"
          :item="item"
          :index="index"
          :current="index === current"
          :completed="index < current"
        >
          <span class="wl-steps__num" aria-hidden="true">
            <WlIcon v-if="index < current" name="check" :size="12" />
            <template v-else>{{ index + 1 }}</template>
          </span>
          <span class="wl-steps__label">{{ item.label }}</span>
          <span v-if="item.description" class="wl-steps__description">{{ item.description }}</span>
          <span v-if="item.error" class="wl-visually-hidden">{{ locale.stepError }}</span>
          <span v-if="index <= current" class="wl-visually-hidden">{{ index < current ? locale.stepCompleted : locale.stepCurrent }}</span>
        </slot>
      </component>
    </li>
  </ol>
</template>

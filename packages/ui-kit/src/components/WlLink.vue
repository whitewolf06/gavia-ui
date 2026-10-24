<script setup lang="ts">
/** WlLink public component contract.
 * @slot default - Link content; scope { isActive, href }.
 */
import { type AriaAttributes, computed, ref, useAttrs } from "vue";
import type { WlPt } from "../pt-types";
import type { WlTone } from "../types";
import { mergeWlAttrs, useWlLinkComponent, useWlLocale, useWlPt } from "../config";

defineOptions({ inheritAttrs: false });
const props = withDefaults(defineProps<{
  /** Router location passed unchanged to WlConfig.linkComponent. */
  to?: unknown;
  /** Semantic color role. */
  tone?: WlTone;
  /** Native URL. */
  href?: string;
  /**
   * Opens a new tab with a safe rel and an accessible hint.
   * @default false
   */
  external?: boolean;
  /**
   * Disable user interaction with this component.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether this item represents the current destination.
   * @default false
   */
  active?: boolean;
  /** Attributes and callbacks for the component's documented pass-through sections. */
  pt?: WlPt<"link">;
}>(), { external: false, disabled: false, active: false });
const emit = defineEmits<{
  /** Emitted for an enabled activation; receives the native MouseEvent. */
  click: [event: MouseEvent]; }>();
defineSlots<{
  /** Link content; scope { isActive, href }. */
  default?(props: { isActive: boolean; href: string | undefined }): unknown; }>();
const control = ref<HTMLAnchorElement | null>(null);
/** Focus the rendered anchor, including a custom router adapter's fragment. */
defineExpose({ focus: (): void => control.value?.focus() });

const attrs = useAttrs();
const section = useWlPt("link", computed(() => props.pt));
const rootAttrs = computed(() => {
  // Vue3.4 tracks property reads on the otherwise non-enumerable empty attrs proxy.
  void attrs.id;
  return mergeWlAttrs(section("root"), attrs);
});
const linkComponent = useWlLinkComponent();
const locale = useWlLocale();
const fallbackHref = computed(() => props.href ?? (typeof props.to === "string" ? props.to : undefined));
const target = computed(() => props.external ? "_blank" : typeof rootAttrs.value.target === "string" ? rootAttrs.value.target : undefined);
const rel = computed(() => {
  if (target.value !== "_blank") return typeof rootAttrs.value.rel === "string" ? rootAttrs.value.rel : undefined;
  return [...new Set(`${String(rootAttrs.value.rel ?? "")} noopener noreferrer`.trim().split(/\s+/))].join(" ");
});
const tabIndex = computed(() => typeof rootAttrs.value.tabindex === "string" || typeof rootAttrs.value.tabindex === "number"
  ? rootAttrs.value.tabindex
  : undefined);
const ariaCurrent = computed(() => rootAttrs.value["aria-current"] as AriaAttributes["aria-current"]);

function onClick(event: MouseEvent, navigate?: (event: MouseEvent) => unknown): void {
  if (props.disabled) {
    event.preventDefault();
    event.stopPropagation();
    return;
  }
  emit("click", event);
  if (!event.defaultPrevented && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey
    && event.button === 0 && target.value !== "_blank") navigate?.(event);
}
</script>

<template>
  <component
    :is="linkComponent"
    v-if="linkComponent && to !== undefined"
    v-slot="{ href: routeHref, navigate, isActive }"
    :to="to"
    custom
  >
    <a
      ref="control"
      v-bind="rootAttrs"
      :href="disabled ? undefined : routeHref"
      :target="target"
      :rel="rel"
      class="wl-link"
      :class="{ 'is-active': isActive ?? active, 'is-disabled': disabled }"
      :aria-disabled="disabled || undefined"
      :aria-current="ariaCurrent ?? ((isActive ?? active) ? 'page' : undefined)"
      :tabindex="disabled ? -1 : tabIndex"
      :data-wl="rootAttrs['data-wl'] ?? 'link'"
      :data-tone="tone ?? rootAttrs['data-tone'] ?? 'accent'"
      @click="onClick($event, navigate)"
    >
      <slot :is-active="!!(isActive ?? active)" :href="disabled ? undefined : routeHref"></slot>
      <span v-if="external" class="wl-sr-only">{{ locale.opensInNewTab }}</span>
    </a>
  </component>
  <a
    v-else
    ref="control"
    v-bind="rootAttrs"
    :href="disabled ? undefined : fallbackHref"
    :target="target"
    :rel="rel"
    class="wl-link"
    :class="{ 'is-active': active, 'is-disabled': disabled }"
    :aria-disabled="disabled || undefined"
    :aria-current="ariaCurrent ?? (active ? 'page' : undefined)"
    :tabindex="disabled ? -1 : tabIndex"
    :data-wl="rootAttrs['data-wl'] ?? 'link'"
    :data-tone="tone ?? rootAttrs['data-tone'] ?? 'accent'"
    @click="onClick($event)"
  >
    <slot :is-active="active" :href="disabled ? undefined : fallbackHref"></slot>
    <span v-if="external" class="wl-sr-only">{{ locale.opensInNewTab }}</span>
  </a>
</template>

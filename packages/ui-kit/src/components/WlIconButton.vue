<script setup lang="ts">
/** WlIconButton public component contract.
 * @since 0.1.0
 * @slot default - Custom content instead of the icon.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, onUpdated, ref, useAttrs } from "vue";
import type { WlIconInput } from "../iconNames";
import type { WlPt } from "../pt-types";
import type { WlIconButtonVariant, WlTone } from "../types";
import { mergeWlAttrs, useWlLocale, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { hasWlAccessibleName } from "../utils/accessibility";
import { isWlDevelopment } from "../utils/development";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
import WlLink from "./WlLink.vue";

/** Consumer bundlers replace this literal; no Node type dependency is required. */
declare const process: { env: { NODE_ENV?: string } };
defineOptions({ inheritAttrs: false });

const props = withDefaults(
  defineProps<{
    /**
     * Visual variant.
     * @default "ghost"
     */
    variant?: WlIconButtonVariant;
    /** Semantic color role; takes precedence over supported legacy color aliases. */
    tone?: WlTone;
    /**
     * Button size.
     * @default "md"
     */
    size?: "md" | "sm";
    /** Icon (when no slot is provided). */
    icon?: WlIconInput;
    /**
     * Highlight as active.
     * @default false
     */
    active?: boolean;
    /**
     * Disables the button.
     * @default false
     */
    disabled?: boolean;
    /** Indicate pending work supplied by the application. */
    loading?: boolean;
    /** Native link destination. */
    href?: string;
    /** Application router destination handled by the configured link adapter. */
    to?: unknown;
    /** Numeric badge (shown when > 0). */
    count?: number;
    /** Badge description; the action still needs its own accessible name. */
    countLabel?: string;
    /**
     * Indicator dot (when count is absent).
     * @default false
     */
    dot?: boolean;
    /** Accessible description for a meaningful status dot. */
    dotLabel?: string;
    /** Required when no named default slot, native label or aria-labelledby is supplied. */
    ariaLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"iconButton">;
  }>(),
  {
    variant: "ghost",
    size: "md",
    active: false,
    disabled: false,
    dot: false
  }
);

const emit = defineEmits<{
  /** Click (not emitted when disabled). */
  (e: "click", event: MouseEvent): void;
}>();

const rootClass = computed(() => [
  "wl-iconbtn",
  `wl-iconbtn--${props.variant}`,
  props.size === "sm" && "wl-iconbtn--sm",
  props.active && "is-active",
  (props.disabled || props.loading) && "is-disabled"
]);
const section = useWlPt("iconButton", computed(() => props.pt));
const attrs = useAttrs();
const rootAttrs = computed(() => {
  void attrs.id;
  return mergeWlAttrs(attrs, section("root"));
});
const locale = useWlLocale();
const badgeId = `wl-icon-button-badge-${useWlId()}`;
const badgeDescription = computed(() => props.count !== undefined && props.count > 0
  ? props.countLabel ?? formatWlLocaleText(locale.value.badgeCount, { count: props.count })
  : props.dot ? props.dotLabel ?? locale.value.badgeDot : undefined);
const describedBy = computed(() => {
  const tokens = new Set(String(rootAttrs.value["aria-describedby"] ?? "").trim().split(/\s+/).filter(Boolean));
  if (badgeDescription.value?.trim()) tokens.add(badgeId);
  return [...tokens].join(" ") || undefined;
});
const actionLabel = computed(() => props.ariaLabel ?? (typeof rootAttrs.value["aria-label"] === "string" ? rootAttrs.value["aria-label"] : undefined));
const content = ref<HTMLElement | null>(null);
const isLink = computed(() => props.href !== undefined || props.to !== undefined);
if (isWlDevelopment() && process.env.NODE_ENV !== "production") {
  let mounted = false;
  let warned = false;
  const checkName = (): void => {
    if (!mounted) return;
    const element = content.value?.closest<HTMLElement>("button, a");
    if (!element) return;
    if (hasWlAccessibleName(element, [".wl-iconbtn__count", ".wl-iconbtn__description"])) warned = false;
    else if (!warned) {
      warned = true;
      console.warn("[Gavia UI] WlIconButton needs ariaLabel, a resolved aria-labelledby or text describing its action.");
    }
  };
  onMounted(() => {
    mounted = true;
    void nextTick(checkName);
  });
  onUpdated(() => void nextTick(checkName));
  onBeforeUnmount(() => {
    mounted = false;
  });
}

function onClick(event: MouseEvent): void {
  if (props.disabled || props.loading) return;
  emit("click", event);
}
</script>

<template>
  <component
    :is="isLink ? WlLink : 'button'"
    v-bind="rootAttrs"
    :type="isLink ? undefined : 'button'"
    :href="href"
    :to="to"
    :class="rootClass"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    :aria-label="actionLabel"
    :aria-describedby="describedBy"
    data-wl="icon-button"
    :data-variant="variant"
    :data-tone="tone ?? 'neutral'"
    :data-size="size"
    @click="onClick"
  >
    <span
      v-if="loading"
      v-bind="section('loadingIcon')"
      class="wl-btn__spinner"
      aria-hidden="true"
    ></span>
    <span ref="content" class="wl-iconbtn__content" :class="{ 'wl-visually-hidden': loading }"><slot>
      <WlIcon v-if="icon" :name="icon" :size="size === 'sm' ? 16 : 18" />
    </slot></span>
    <span v-if="count !== undefined && count > 0" class="wl-iconbtn__count" aria-hidden="true">{{ count }}</span>
    <span v-else-if="dot" class="wl-iconbtn__dot" aria-hidden="true"></span>
    <span
      v-if="badgeDescription"
      :id="badgeId"
      class="wl-visually-hidden wl-iconbtn__description"
      aria-hidden="true"
    >{{ badgeDescription }}</span>
  </component>
</template>

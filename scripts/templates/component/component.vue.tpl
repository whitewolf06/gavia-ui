<script setup lang="ts">
import { computed } from "vue";
import { useWlPt } from "../config";
import type { WlPt } from "../pt-types";
import type { WlDensity, WlSizeSm } from "../types";

const props = withDefaults(defineProps<{
  variant?: "default";
  size?: WlSizeSm;
  density?: WlDensity;
  disabled?: boolean;
  invalid?: boolean;
  loading?: boolean;
  pt?: WlPt<"{{ptKey}}">;
}>(), {
  variant: "default", size: "md", density: "default",
  disabled: false, invalid: false, loading: false
});

const section = useWlPt("{{ptKey}}", computed(() => props.pt));
// TODO: replace this neutral container with the component's actual semantics.
</script>

<template>
  <div
    v-bind="section('root')"
    class="{{cssClass}}"
    data-wl="{{slug}}"
    :data-variant="variant"
    :data-size="size"
    :data-density="density"
    :data-invalid="invalid || undefined"
    :aria-disabled="disabled || undefined"
    :aria-busy="loading || undefined"
  >
    <slot />
  </div>
</template>

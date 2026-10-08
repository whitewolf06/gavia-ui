<script setup lang="ts">
import type { WlPt } from "../pt-types";
import type { WlTextModelModifiers } from "../model-types";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useWlPt } from "../config";

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlTextModelModifiers;
    invalid?: boolean;
    disabled?: boolean;
    rows?: number;
    autoResize?: boolean;
    placeholder?: string;
    pt?: WlPt<"textarea">;
  }>(),
  {
    invalid: false,
    disabled: false,
    rows: 3,
    autoResize: false
  }
);

const model = defineModel<string, "trim">({ default: "" });
const control = ref<HTMLTextAreaElement | null>(null);
const section = useWlPt("textarea", computed(() => props.pt));
async function resize(): Promise<void> {
  if (!props.autoResize) return;
  await nextTick();
  if (!control.value) return;
  control.value.style.height = "auto";
  control.value.style.height = `${control.value.scrollHeight}px`;
}
watch([model, () => props.autoResize], resize);
onMounted(resize);

const rootClass = computed(() => [
  "wl-textarea",
  props.invalid && "is-invalid",
  props.disabled && "is-disabled"
]);
</script>

<template>
  <textarea
    ref="control"
    v-bind="section('root')"
    v-model="model"
    :class="rootClass"
    :rows="rows"
    :placeholder="placeholder"
    :disabled="disabled"
    :aria-invalid="invalid || undefined"
    data-wl="textarea"
  />
</template>

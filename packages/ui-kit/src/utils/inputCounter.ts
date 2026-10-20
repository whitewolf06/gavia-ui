import { computed, type ComputedRef, type Ref } from "vue";
import { useWlId } from "./useWlId";

export function useWlInputCounter(model: Ref<string>, attrs: () => Record<string, unknown>, enabled: () => boolean): {
  id: string;
  text: ComputedRef<string>;
  describedBy: ComputedRef<string | undefined>;
} {
  const id = `wl-input-count-${useWlId()}`;
  const text = computed(() => {
    const raw = attrs().maxlength;
    const maximum = typeof raw === "number" || (typeof raw === "string" && raw.trim()) ? Number(raw) : NaN;
    return Number.isFinite(maximum) && maximum >= 0 ? `${model.value.length} / ${maximum}` : String(model.value.length);
  });
  const describedBy = computed(() => [attrs()["aria-describedby"], enabled() ? id : undefined]
    .filter((value) => typeof value === "string" && value.length > 0).join(" ") || undefined);
  return { id, text, describedBy };
}

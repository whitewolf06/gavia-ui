import { computed, type ComputedRef, getCurrentInstance, inject, type InjectionKey, onBeforeUpdate, shallowRef } from "vue";
import type { WlButtonVariant, WlDensity, WlSize } from "../types";

export interface WlButtonGroupDefaults { size?: WlSize; variant?: WlButtonVariant; density?: WlDensity }
export const buttonGroupKey: InjectionKey<ComputedRef<WlButtonGroupDefaults>> = Symbol("wl-button-group");

/** Explicit child props win over group defaults, including a prop added after mount. */
export function useWlButtonGroupDefaults(props: Required<WlButtonGroupDefaults>): ComputedRef<Required<WlButtonGroupDefaults>> {
  const group = inject(buttonGroupKey, undefined);
  const instance = getCurrentInstance();
  const raw = shallowRef(instance?.vnode.props);
  onBeforeUpdate(() => {
    raw.value = instance?.vnode.props;
  });
  return computed(() => ({
    size: raw.value?.size !== undefined ? props.size : group?.value.size ?? props.size,
    variant: raw.value?.variant !== undefined ? props.variant : group?.value.variant ?? props.variant,
    density: raw.value?.density !== undefined ? props.density : group?.value.density ?? props.density
  }));
}

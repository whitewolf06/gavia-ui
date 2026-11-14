import { ComputedRef, InjectionKey } from 'vue';
import { WlButtonVariant, WlDensity, WlSize } from "../types.js";
export interface WlButtonGroupDefaults {
    size?: WlSize;
    variant?: WlButtonVariant;
    density?: WlDensity;
}
export declare const buttonGroupKey: InjectionKey<ComputedRef<WlButtonGroupDefaults>>;
/** Explicit child props win over group defaults, including a prop added after mount. */
export declare function useWlButtonGroupDefaults(props: Required<WlButtonGroupDefaults>): ComputedRef<Required<WlButtonGroupDefaults>>;

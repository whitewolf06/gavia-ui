import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSwitchSize } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /**
     * Size.
     * @default "md"
     */
    size?: WlSwitchSize;
    /**
     * Disables the switch.
     * @default false
     */
    disabled?: boolean;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Indicate pending work supplied by the application.
     * @default false
     */
    loading?: boolean;
    /**
     * Place the visible label before or after the switch.
     * @default "end"
     */
    labelPosition?: "start" | "end";
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"switch">;
};
type __VLS_ModelProps = {
    /** Boolean checked state.
     * Paired with update:modelValue.
     * @default false
     */
    modelValue?: boolean;
    'modelModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare var __VLS_1: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    disabled: boolean;
    invalid: boolean;
    loading: boolean;
    labelPosition: string;
    density: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    disabled: boolean;
    invalid: boolean;
    loading: boolean;
    labelPosition: string;
    density: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: boolean) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSwitchSize;
    loading: boolean;
    invalid: boolean;
    density: WlDensity;
    labelPosition: "start" | "end";
}, {}>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T & string]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<Required<T>[K]>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
type __VLS_WithDefaults<P, D> = {
    [K in keyof P & string]: K extends keyof D ? __VLS_PrettifyLocal<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};

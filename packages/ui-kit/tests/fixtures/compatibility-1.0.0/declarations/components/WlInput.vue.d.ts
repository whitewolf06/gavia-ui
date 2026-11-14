import { WlTextModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlTextModelModifiers;
    /**
     * Field size.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Compact mode reduces field height.
     * @default "default"
     */
    density?: WlDensity;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Disables the field.
     * @default false
     */
    disabled?: boolean;
    /** Show a clear action for the current value. */
    clearable?: boolean;
    /** Indicate pending work supplied by the application. */
    loading?: boolean;
    /** Display the text length counter and connect it to the control description. */
    showCount?: boolean;
    /** Placeholder. */
    placeholder?: string;
    /**
     * Input element type attribute.
     * @default "text"
     */
    type?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"input">;
};
type __VLS_ModelProps = {
    /** Text value; supports the trim model modifier.
     * Paired with update:modelValue.
     * @default ""
     */
    modelValue?: string;
    'modelModifiers'?: Partial<Record<"trim", true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare var __VLS_1: {}, __VLS_3: {};
type __VLS_Slots = {} & {
    prefix?: (props: typeof __VLS_1) => any;
} & {
    suffix?: (props: typeof __VLS_3) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    invalid: boolean;
    disabled: boolean;
    type: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    invalid: boolean;
    disabled: boolean;
    type: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    type: string;
    invalid: boolean;
    density: WlDensity;
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

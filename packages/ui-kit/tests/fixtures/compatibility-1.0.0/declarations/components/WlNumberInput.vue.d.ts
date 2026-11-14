import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /**
     * Minimum.
     * @default 0
     */
    min?: number;
    /**
     * Maximum.
     * @default 99
     */
    max?: number;
    /**
     * Numeric step.
     * @default 1
     */
    step?: number;
    /**
     * Field size.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Density.
     * @default "default"
     */
    density?: WlDensity;
    /**
     * Disables the field.
     * @default false
     */
    disabled?: boolean;
    /**
     * Error state.
     * @default false
     */
    invalid?: boolean;
    /** Input aria-label. */
    ariaLabel?: string;
    /**
     * Accessible decrement button name.
     * Defaults to WlConfig.locale.decrease (English when unconfigured).
     * @default undefined
     */
    decrementLabel?: string;
    /**
     * Accessible increment button name.
     * Defaults to WlConfig.locale.increase (English when unconfigured).
     * @default undefined
     */
    incrementLabel?: string;
    /** Enable localized number parsing and display formatting. */
    format?: boolean;
    /** Locale override for numeric display formatting. */
    locale?: string;
    /** Decimal precision used by numeric formatting. */
    precision?: number;
    /** ISO currency code used by number formatting. */
    currency?: string;
    /** Intl.NumberFormat options for the displayed numeric value. */
    numberFormat?: Intl.NumberFormatOptions;
    /** Text displayed before the numeric value. */
    prefix?: string;
    /** Text displayed after the numeric value. */
    suffix?: string;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"numberinput">;
};
type __VLS_Slots = {
    /** Content before the numeric input; receives the current value. */
    prefix?(props: {
        value: number;
    }): unknown;
    /** Content after the numeric input; receives the current value. */
    suffix?(props: {
        value: number;
    }): unknown;
};
type __VLS_ModelProps = {
    /** Numeric value, normalized to the configured bounds and step.
     * Paired with update:modelValue.
     * @default 0
     */
    modelValue?: number;
    'modelModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    min: number;
    max: number;
    step: number;
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
    format: undefined;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: number) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    min: number;
    max: number;
    step: number;
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
    format: undefined;
}>>> & {
    "onUpdate:modelValue"?: ((value: number) => any) | undefined;
}, {
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    size: WlSizeSm;
    invalid: boolean;
    density: WlDensity;
    format: boolean;
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

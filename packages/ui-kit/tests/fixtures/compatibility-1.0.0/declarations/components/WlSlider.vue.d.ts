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
     * @default 100
     */
    max?: number;
    /**
     * Step.
     * @default 1
     */
    step?: number;
    /**
     * Disables the slider.
     * @default false
     */
    disabled?: boolean;
    /**
     * Expose a validation error state on the control.
     * @default false
     */
    invalid?: boolean;
    /**
     * Use two slider handles with a start/end value pair.
     * @default false
     */
    range?: boolean;
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** aria-label. */
    ariaLabel?: string;
    /** Human-readable value text for assistive technology. */
    ariaValueText?: string | ((value: number, index: 0 | 1) => string);
    /** Accessible label for the range start control. */
    startLabel?: string;
    /** Accessible label for the range end control. */
    endLabel?: string;
    /**
     * Labeled positions displayed along the slider track.
     * @default []
     */
    marks?: readonly (number | {
        value: number;
        label?: string;
    })[];
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"slider">;
};
type __VLS_ModelProps = {
    /** Numeric value, or a pair of start/end values in range mode.
     * Paired with update:modelValue.
     * @default 0
     */
    modelValue?: number | [number, number];
    'modelModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    invalid: boolean;
    range: boolean;
    size: string;
    density: string;
    marks: () => never[];
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: number | [number, number]) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    invalid: boolean;
    range: boolean;
    size: string;
    density: string;
    marks: () => never[];
}>>> & {
    "onUpdate:modelValue"?: ((value: number | [number, number]) => any) | undefined;
}, {
    min: number;
    max: number;
    step: number;
    disabled: boolean;
    size: WlSizeSm;
    range: boolean;
    invalid: boolean;
    density: WlDensity;
    marks: readonly (number | {
        value: number;
        label?: string;
    })[];
}, {}>;
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
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};

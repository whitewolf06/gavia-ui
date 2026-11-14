import { WlTextModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlTextModelModifiers;
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
    /**
     * Row count.
     * @default 3
     */
    rows?: number;
    /**
     * Adjust height to content.
     * @default false
     */
    autoResize?: boolean;
    /** Maximum visible textarea rows when automatic resizing is enabled. */
    maxRows?: number;
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
    /** Display the text length counter and connect it to the control description. */
    showCount?: boolean;
    /** Placeholder. */
    placeholder?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"textarea">;
};
type __VLS_ModelProps = {
    /** Multiline text value; supports the trim model modifier.
     * Paired with update:modelValue.
     * @default ""
     */
    modelValue?: string;
    'modelModifiers'?: Partial<Record<"trim", true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    invalid: boolean;
    disabled: boolean;
    rows: number;
    autoResize: boolean;
    size: string;
    density: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    invalid: boolean;
    disabled: boolean;
    rows: number;
    autoResize: boolean;
    size: string;
    density: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}, {
    rows: number;
    disabled: boolean;
    size: WlSizeSm;
    invalid: boolean;
    density: WlDensity;
    autoResize: boolean;
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

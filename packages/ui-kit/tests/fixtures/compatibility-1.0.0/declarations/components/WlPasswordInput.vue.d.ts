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
     * Density.
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
    /**
     * Placeholder.
     * Defaults to WlConfig.locale.password (English when unconfigured).
     * @default undefined
     */
    placeholder?: string;
    /** Input aria-label. */
    ariaLabel?: string;
    /** Consumer-provided password-strength status. */
    strength?: number;
    /** Readable description of the password-strength status. */
    strengthLabel?: string;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"password">;
};
type __VLS_ModelProps = {
    /** Password text value; supports the trim model modifier.
     * Paired with update:modelValue.
     * @default ""
     */
    modelValue?: string;
    'modelModifiers'?: Partial<Record<"trim", true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    invalid: boolean;
    disabled: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    invalid: boolean;
    disabled: boolean;
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    invalid: boolean;
    density: WlDensity;
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

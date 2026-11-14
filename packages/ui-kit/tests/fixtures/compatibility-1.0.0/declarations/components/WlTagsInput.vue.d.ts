import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /** Hint shown when the control has no displayed text. */
    placeholder?: string;
    /** Name used by the component's native form controls. */
    name?: string;
    /**
     * Text delimiters splitting pasted or entered text into tag values.
     * @default [","]
     */
    separators?: readonly string[];
    /** Application validation predicate for a proposed tag value. */
    validator?: (value: string) => boolean;
    /** Maximum number of tag values accepted in the model. */
    max?: number;
    /**
     * Allow repeated tag values in the model.
     * @default false
     */
    allowDuplicates?: boolean;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Keep the current value readable while preventing user edits.
     * @default false
     */
    readonly?: boolean;
    /**
     * Expose a validation error state on the control.
     * @default false
     */
    invalid?: boolean;
    /**
     * Indicate pending work supplied by the application.
     * @default false
     */
    loading?: boolean;
    /**
     * Visual treatment within this component family.
     * @default "default"
     */
    variant?: "default";
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
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"tagsinput">;
};
type __VLS_Slots = {
    /** Custom tag content with its value, index and removal callback. */
    tag?(props: {
        value: string;
        index: number;
        remove: () => void;
    }): unknown;
};
type __VLS_ModelProps = {
    /** Ordered list of tag strings.
     * Paired with update:modelValue.
     * @default []
     */
    modelValue?: string[];
    'modelModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    separators: () => string[];
    allowDuplicates: boolean;
    disabled: boolean;
    readonly: boolean;
    invalid: boolean;
    loading: boolean;
    variant: string;
    size: string;
    density: string;
}>, {
    focus: () => void | undefined;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    reject: (value: string, reason: "max" | "invalid" | "duplicate") => void;
    remove: (value: string, index: number) => void;
    add: (value: string) => void;
    "update:modelValue": (value: string[]) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    separators: () => string[];
    allowDuplicates: boolean;
    disabled: boolean;
    readonly: boolean;
    invalid: boolean;
    loading: boolean;
    variant: string;
    size: string;
    density: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: string[]) => any) | undefined;
    onRemove?: ((value: string, index: number) => any) | undefined;
    onReject?: ((value: string, reason: "max" | "invalid" | "duplicate") => any) | undefined;
    onAdd?: ((value: string) => any) | undefined;
}, {
    readonly: boolean;
    disabled: boolean;
    size: WlSizeSm;
    loading: boolean;
    invalid: boolean;
    density: WlDensity;
    variant: "default";
    separators: readonly string[];
    allowDuplicates: boolean;
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

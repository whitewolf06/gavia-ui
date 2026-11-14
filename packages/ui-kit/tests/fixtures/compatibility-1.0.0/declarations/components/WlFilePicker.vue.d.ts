import { WlFilePickerExpose } from "../input-expose-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Extensions or MIME types for the file picker. The application validates files. */
    accept?: string;
    /**
     * Allows multiple file selection.
     * @default false
     */
    multiple?: boolean;
    /**
     * Disables the trigger and choose().
     * @default false
     */
    disabled?: boolean;
    /**
     * Default button label.
     * Defaults to WlConfig.locale.chooseFiles (English when unconfigured).
     * @default undefined
     */
    chooseLabel?: string;
    /** Default button accessible name. */
    ariaLabel?: string;
    /**
     * Button size.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Button density.
     * @default "default"
     */
    density?: WlDensity;
    /** Root, trigger and input attributes. */
    pt?: WlPt<"filepicker">;
};
declare var __VLS_1: {
    choose: () => void;
    clear: () => void;
    disabled: boolean;
    attrs: {
        [k: string]: unknown;
    };
};
type __VLS_Slots = {} & {
    trigger?: (props: typeof __VLS_1) => any;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    multiple: boolean;
    disabled: boolean;
    size: string;
    density: string;
}>, WlFilePickerExpose, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    select: (files: File[]) => void;
    cancel: () => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    multiple: boolean;
    disabled: boolean;
    size: string;
    density: string;
}>>> & {
    onSelect?: ((files: File[]) => any) | undefined;
    onCancel?: (() => any) | undefined;
}, {
    multiple: boolean;
    disabled: boolean;
    size: WlSizeSm;
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

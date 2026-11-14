import { WlPt } from "../pt-types.js";
import { WlColorPickerSize } from "../types.js";
/** Kit accent / success / warn / danger + gray ramp (foundation hexes).
 *  Inlined into withDefaults — defineProps cannot reference local variables. */
type __VLS_Props = {
    /** Normalized lowercase hex; alpha mode includes the final opacity byte. */
    modelValue?: string;
    /** Palette HEX colours. */
    swatches?: readonly string[];
    /**
     * Colour swatch size.
     * @default "md"
     */
    size?: WlColorPickerSize;
    /**
     * Disables the palette and input.
     * @default false
     */
    disabled?: boolean;
    /**
     * External error state.
     * @default false
     */
    invalid?: boolean;
    /**
     * Enable an alpha channel in the selected color.
     * @default false
     */
    alpha?: boolean;
    /**
     * Allow entering a custom color beyond the swatch palette.
     * @default false
     */
    custom?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"colorpicker">;
    /**
     * Accessible colour list name.
     * Defaults to WlConfig.locale.colorPalette (English when unconfigured).
     * @default undefined
     */
    paletteLabel?: string;
    /**
     * Accessible HEX field name.
     * Defaults to WlConfig.locale.colorHex (English when unconfigured).
     * @default undefined
     */
    inputLabel?: string;
};
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    modelValue: string;
    swatches: () => string[];
    size: string;
    disabled: boolean;
    invalid: boolean;
    alpha: boolean;
    custom: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    modelValue: string;
    swatches: () => string[];
    size: string;
    disabled: boolean;
    invalid: boolean;
    alpha: boolean;
    custom: boolean;
}>>> & {
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}, {
    disabled: boolean;
    size: WlColorPickerSize;
    invalid: boolean;
    modelValue: string;
    swatches: readonly string[];
    alpha: boolean;
    custom: boolean;
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

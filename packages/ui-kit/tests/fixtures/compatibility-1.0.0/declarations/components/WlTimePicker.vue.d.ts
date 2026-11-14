import { WlNoModelModifiers } from "../model-types.js";
import { WlTimeInterval, WlTimePickerHourFormat } from "../picker-types.js";
import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /** Lower HH:mm boundary; minTime > maxTime defines an overnight range. */
    minTime?: string;
    /** Upper HH:mm boundary. */
    maxTime?: string;
    /**
     * Increment in seconds, or any for unrestricted step precision.
     * @default 60
     */
    step?: number | string;
    /**
     * Choose native, twelve-hour or twenty-four-hour time presentation.
     * @default "auto"
     */
    hourFormat?: WlTimePickerHourFormat;
    /** Allowed time intervals; values outside them cannot be selected. */
    allowedIntervals?: readonly WlTimeInterval[];
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
     * Disables selection.
     * @default false
     */
    disabled?: boolean;
    /**
     * External error state.
     * @default false
     */
    invalid?: boolean;
    /** Root and input attributes. */
    pt?: WlPt<"timepicker">;
};
type __VLS_ModelProps = {
    /** A local wall-clock time, with optional seconds; no date or timezone is added. */
    modelValue?: string | null;
    'modelModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_export: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
    step: number;
    hourFormat: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string | null) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    size: string;
    density: string;
    disabled: boolean;
    invalid: boolean;
    step: number;
    hourFormat: string;
}>>> & {
    "onUpdate:modelValue"?: ((value: string | null) => any) | undefined;
}, {
    step: string | number;
    disabled: boolean;
    size: WlSizeSm;
    invalid: boolean;
    density: WlDensity;
    hourFormat: WlTimePickerHourFormat;
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

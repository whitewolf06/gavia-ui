import { WlNoModelModifiers } from "../model-types.js";
import { WlDateFormatOptions, WlDateRangePreset, WlDisabledDates } from "../picker-types.js";
import { WlPt } from "../pt-types.js";
import { WlDatePickerModel, WlDatePickerSelectionMode, WlDensity, WlSizeSm } from "../types.js";
declare const __VLS_export: <Mode extends WlDatePickerSelectionMode = "single">(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /**
         * Placeholder.
         * Defaults to WlConfig.locale.datePlaceholder (English when unconfigured).
         * @default undefined
         */
        placeholder?: string;
        /**
         * Field size.
         * @default "md"
         */
        size?: WlSizeSm;
        /**
         * Spacing density for this component family.
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
        /**
         * Calendar icon button.
         * @default false
         */
        showIcon?: boolean;
        /** Minimum date in "YYYY-MM-DD" format. Empty or invalid values do not restrict selection. */
        minDate?: string;
        /** Maximum date in "YYYY-MM-DD" format. Empty or invalid values do not restrict selection. */
        maxDate?: string;
        /**
         * Display and manual input format; the model remains ISO.
         * @default "dd.mm.yyyy"
         */
        displayFormat?: "dd.mm.yyyy" | "yyyy-mm-dd" | "locale";
        /** Intl date-format options used by the localized display mode. */
        formatOptions?: WlDateFormatOptions;
        /** Date list or predicate identifying dates that cannot be selected. */
        disabledDates?: WlDisabledDates;
        /** Consumer-provided predefined date ranges. */
        rangePresets?: readonly WlDateRangePreset[];
        /**
         * single: ISO string/null; range: [start, end|null]/null. The first selection sets the start, the second
         * completes and sorts the range, and the next starts a new one.
         */
        selectionMode?: Mode;
        /**
         * Visible range start label.
         * Defaults to WlConfig.locale.dateFrom (English when unconfigured).
         * @default undefined
         */
        startLabel?: string;
        /**
         * Visible range end label.
         * Defaults to WlConfig.locale.dateTo (English when unconfigured).
         * @default undefined
         */
        endLabel?: string;
        /** Calendar animation; defaults to WlConfig.motion (true). */
        motion?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"datepicker">;
    } & {
        /** ISO date or date-range value determined by selectionMode.
         * Paired with update:modelValue.
         * @default null
         */
        modelValue?: WlDatePickerModel<NoInfer<Mode>>;
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: WlDatePickerModel<NoInfer<Mode>>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {};
    emit: (event: "update:modelValue", value: WlDatePickerModel<NoInfer<Mode>>) => void;
}>) => import('vue').VNode & {
    __ctx?: NonNullable<Awaited<typeof __VLS_setup>>;
};
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};

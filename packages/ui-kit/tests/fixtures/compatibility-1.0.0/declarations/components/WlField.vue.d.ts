import { WlFieldSlotProps } from "../field-types.js";
import { WlPt } from "../pt-types.js";
type __VLS_Props = {
    /** Visible label associated with the control ID. */
    label?: string;
    /** Mark the field as required and expose required to the control slot.
     * @default false
     */
    required?: boolean;
    /** Show the localized optional marker when required is false.
     * @default false
     */
    optional?: boolean;
    /** Arrange the label above or beside the control.
     * @default "vertical"
     */
    orientation?: "vertical" | "horizontal";
    /** Help text, retained in aria-describedby when an error is present. */
    hint?: string;
    /** Validation message; also marks the control slot as invalid. */
    error?: string;
    /** Control ID; otherwise a stable application-scoped ID is generated. */
    id?: string;
    /** Opt in to live validation announcements through role=alert.
     * @default false
     */
    announceError?: boolean;
    /** Attributes for the root, label, required, hint and error sections. */
    pt?: WlPt<"field">;
};
type __VLS_Slots = {
    /** Control content; bind the supplied IDs, descriptions and validation state to the actual control. */
    default?(props: WlFieldSlotProps): unknown;
    /** Custom field label; receives the label text and required state. */
    label?(props: {
        label: string | undefined;
        required: boolean;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    required: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    required: boolean;
}>>>, {
    required: boolean;
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

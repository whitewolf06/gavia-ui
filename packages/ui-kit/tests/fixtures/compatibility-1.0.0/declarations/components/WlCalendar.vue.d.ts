import { WlNoModelModifiers } from "../model-types.js";
import { WlCalendarDaySlotProps, WlCalendarModel } from "../picker-types.js";
import { WlPt } from "../pt-types.js";
import { WlCalendarEvent } from "../types.js";
declare const __VLS_export: <Multiple extends boolean = false>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /**
         * WlCalendarEvent[]: { date (ISO), label, tone?: "blue" | "gray" }.
         * @default []
         */
        events?: readonly WlCalendarEvent[];
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /** Modifier contract for the displayed-month model; built-in modifiers are unsupported. */
        monthModifiers?: WlNoModelModifiers;
        /** Enable selection of more than one value. */
        multiple?: Multiple & boolean;
        /**
         * Disable user interaction with this component.
         * @default false
         */
        disabled?: boolean;
        /** Attributes and callbacks for the component's documented pass-through sections. */
        pt?: WlPt<"calendar">;
    } & {
        /**
         * v-model — selected ISO "YYYY-MM-DD" date, or ISO date array in multiple mode.
         * v-model:month — displayed month as "YYYY-MM"; uncontrolled default = current month.
         */
        modelValue?: WlCalendarModel<NoInfer<Multiple>>;
        modelModifiers?: Partial<Record<never, true>>;
        /** Displayed month in YYYY-MM format.
         * Paired with update:month.
         * @default ""
         */
        month?: string;
        monthModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: WlCalendarModel<NoInfer<Multiple>>) => any) | undefined;
        "onUpdate:month"?: ((value: string) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        /** Custom calendar day content with its date and selection state. */
        day?(props: WlCalendarDaySlotProps): unknown;
    };
    emit: ((event: "update:modelValue", value: WlCalendarModel<NoInfer<Multiple>>) => void) & ((event: "update:month", value: string) => void);
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

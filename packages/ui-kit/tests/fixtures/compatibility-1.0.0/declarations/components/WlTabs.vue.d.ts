import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlTabItem } from "../types.js";
declare const __VLS_export: <Item extends WlTabItem = WlTabItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<({
        /** Modifier flags accepted by the component's typed model contract. */
        modelModifiers?: WlNoModelModifiers;
        /**
         * WlTabItem[]: { key, label, icon?, count? }.
         * @default []
         */
        items?: readonly Item[];
        /**
         * Layout direction and applicable arrow-key navigation direction.
         * @default "horizontal"
         */
        orientation?: "horizontal" | "vertical";
        /**
         * Defer a tab panel's first render until it becomes active.
         * @default true
         */
        lazy?: boolean;
        /**
         * Keep a previously visited tab panel mounted while it is inactive.
         * @default false
         */
        keepAlive?: boolean;
        /** Attributes of internal Gavia UI elements. */
        pt?: WlPt<"tabs">;
    } & {
        /** Key of the active tab; an empty string retains the initial unselected model.
         * Paired with update:modelValue.
         * @default ""
         */
        modelValue?: NoInfer<Item["key"]> | "";
        modelModifiers?: Partial<Record<never, true>>;
    }) & {
        "onUpdate:modelValue"?: ((value: "" | NoInfer<Item["key"]>) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: {
        /** Panel content; scope: { item }. */
        panel?(props: {
            item: Item;
        }): unknown;
    };
    emit: (event: "update:modelValue", value: "" | NoInfer<Item["key"]>) => void;
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

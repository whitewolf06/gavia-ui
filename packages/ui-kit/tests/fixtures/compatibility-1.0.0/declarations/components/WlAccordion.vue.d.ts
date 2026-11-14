import { WlNoModelModifiers } from "../model-types.js";
import { WlAccordionItem, WlAccordionSlots } from "../navigation-types.js";
import { WlPt } from "../pt-types.js";
declare const __VLS_export: <Item extends WlAccordionItem = WlAccordionItem>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_exposed?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: import('vue').PublicProps & __VLS_PrettifyLocal<{
        /**
         * WlAccordionItem[]: { key, title, content?, disabled? }.
         * @default []
         */
        items?: readonly Item[];
        /**
         * Only one item is open.
         * @default false
         */
        single?: boolean;
        /** Open section keys; controlled through v-model:openKeys. */
        openKeys?: readonly NoInfer<Item["key"]>[];
        /** Initially expanded item keys for an uncontrolled accordion. */
        defaultOpenKeys?: readonly NoInfer<Item["key"]>[];
        /** Attributes and callbacks for the component's documented pass-through sections. */
        pt?: WlPt<"accordion">;
        /** Modifier contract for expanded keys; built-in modifiers are unsupported. */
        openKeysModifiers?: WlNoModelModifiers;
    } & {
        "onUpdate:openKeys"?: ((value: Item["key"][]) => any) | undefined;
    }> & (typeof globalThis extends {
        __VLS_PROPS_FALLBACK: infer P;
    } ? P : {});
    expose: (exposed: {}) => void;
    attrs: any;
    slots: WlAccordionSlots<Item>;
    emit: (e: "update:openKeys", value: Item["key"][]) => void;
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

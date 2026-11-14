import { WlPt } from "../pt-types.js";
import { WlBreadcrumbItem } from "../types.js";
type __VLS_Props = {
    /**
     * WlBreadcrumbItem[]: { label, to?, href?, icon? }.
     * @default []
     */
    items?: readonly WlBreadcrumbItem[];
    /**
     * Text displayed between breadcrumb items.
     * @default "/"
     */
    separator?: string;
    /** Maximum visible breadcrumb items before collapsing the middle items. */
    maxItems?: number;
    /** Accessible name for the collapsed-items trigger. */
    collapseLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"breadcrumbs">;
};
type __VLS_Slots = {
    /** Custom breadcrumb item; receives the item, index and navigation state. */
    item?(props: {
        item: WlBreadcrumbItem;
        index: number;
        current: boolean;
    }): unknown;
    /** Custom breadcrumb separator content. */
    separator?(props: {
        item: WlBreadcrumbItem;
        index: number;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    items: () => never[];
    separator: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    items: () => never[];
    separator: string;
}>>>, {
    items: readonly WlBreadcrumbItem[];
    separator: string;
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

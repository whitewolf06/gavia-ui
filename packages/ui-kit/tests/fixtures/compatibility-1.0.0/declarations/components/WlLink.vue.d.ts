import { WlPt } from "../pt-types.js";
import { WlTone } from "../types.js";
type __VLS_Props = {
    /** Router location passed unchanged to WlConfig.linkComponent. */
    to?: unknown;
    /** Semantic color role. */
    tone?: WlTone;
    /** Native URL. */
    href?: string;
    /**
     * Opens a new tab with a safe rel and an accessible hint.
     * @default false
     */
    external?: boolean;
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether this item represents the current destination.
     * @default false
     */
    active?: boolean;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"link">;
};
type __VLS_Slots = {
    /** Link content; scope { isActive, href }. */
    default?(props: {
        isActive: boolean;
        href: string | undefined;
    }): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    external: boolean;
    disabled: boolean;
    active: boolean;
}>, {
    focus: () => void;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    click: (event: MouseEvent) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    external: boolean;
    disabled: boolean;
    active: boolean;
}>>> & {
    onClick?: ((event: MouseEvent) => any) | undefined;
}, {
    disabled: boolean;
    active: boolean;
    external: boolean;
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

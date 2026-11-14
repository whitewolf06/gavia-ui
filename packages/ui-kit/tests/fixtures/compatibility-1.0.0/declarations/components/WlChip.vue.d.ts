import { WlPt } from "../pt-types.js";
import { WlDensity, WlSizeSm } from "../types.js";
type __VLS_Props = {
    /** Trailing count. */
    count?: number;
    /**
     * Disables the chip.
     * @default false
     */
    disabled?: boolean;
    /**
     * Show a removal action for this chip.
     * @default false
     */
    removable?: boolean;
    /** Accessible name of the removal action. */
    removeLabel?: string;
    /**
     * Size within the component family's documented scale.
     * @default "md"
     */
    size?: WlSizeSm;
    /**
     * Spacing density for this component family.
     * @default "default"
     */
    density?: WlDensity;
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"chip">;
};
type __VLS_Slots = {
    /** Chip text. */
    default?(props: Record<never, never>): unknown;
    /** Custom chip count; receives the numeric count. */
    count?(props: {
        count: number;
    }): unknown;
    /** Custom graphic inside the named removal action. */
    removeIcon?(props: Record<never, never>): unknown;
};
type __VLS_ModelProps = {
    /** Whether the chip is active.
     * Paired with update:active.
     * @default false
     */
    "active"?: boolean;
    'activeModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    disabled: boolean;
    removable: boolean;
    size: string;
    density: string;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    remove: (event: MouseEvent) => void;
    click: (event: MouseEvent) => void;
    "update:active": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    disabled: boolean;
    removable: boolean;
    size: string;
    density: string;
}>>> & {
    onClick?: ((event: MouseEvent) => any) | undefined;
    onRemove?: ((event: MouseEvent) => any) | undefined;
    "onUpdate:active"?: ((value: boolean) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    density: WlDensity;
    removable: boolean;
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

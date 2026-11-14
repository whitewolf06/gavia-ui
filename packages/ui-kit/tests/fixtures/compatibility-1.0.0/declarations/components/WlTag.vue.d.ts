import { WlPt } from "../pt-types.js";
import { WlDensity, WlIconInput, WlSizeSm, WlTone } from "../types.js";
type __VLS_Props = {
    /**
     * Palette color, independent of semantic tone. Other strings remain native color attributes.
     * @default "gray"
     */
    color?: string;
    /** Semantic color role. */
    tone?: WlTone;
    /** Icon name or supported custom icon descriptor. */
    icon?: WlIconInput;
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
    /**
     * Disable user interaction with this component.
     * @default false
     */
    disabled?: boolean;
    /**
     * Show the remove button.
     * @default false
     */
    removable?: boolean;
    /**
     * Remove button aria-label; uses locale.remove when omitted or undefined (English: Remove).
     * @default undefined
     */
    removeLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"tag">;
};
type __VLS_Slots = {
    /** Tag text. */
    default?(props: Record<never, never>): unknown;
    /** Custom icon content. */
    icon?(props: Record<never, never>): unknown;
    /** Custom graphic inside the named removal action. */
    removeIcon?(props: Record<never, never>): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    color: string;
    removable: boolean;
    size: string;
    density: string;
    disabled: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    remove: (event: MouseEvent) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    color: string;
    removable: boolean;
    size: string;
    density: string;
    disabled: boolean;
}>>> & {
    onRemove?: ((event: MouseEvent) => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    color: string;
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

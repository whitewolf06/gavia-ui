import { WlIconInput } from "../iconNames.js";
import { WlPt } from "../pt-types.js";
import { WlIconButtonVariant, WlTone } from "../types.js";
type __VLS_Props = {
    /**
     * Visual variant.
     * @default "ghost"
     */
    variant?: WlIconButtonVariant;
    /** Semantic color, independent of the visual treatment. */
    tone?: WlTone;
    /**
     * Button size.
     * @default "md"
     */
    size?: "md" | "sm";
    /** Icon (when no slot is provided). */
    icon?: WlIconInput;
    /**
     * Highlight as active.
     * @default false
     */
    active?: boolean;
    /**
     * Disables the button.
     * @default false
     */
    disabled?: boolean;
    /** Indicate pending work supplied by the application. */
    loading?: boolean;
    /** Native link destination. */
    href?: string;
    /** Application router destination handled by the configured link adapter. */
    to?: unknown;
    /** Numeric badge (shown when > 0). */
    count?: number;
    /** Badge description; the action still needs its own accessible name. */
    countLabel?: string;
    /**
     * Indicator dot (when count is absent).
     * @default false
     */
    dot?: boolean;
    /** Accessible description for a meaningful status dot. */
    dotLabel?: string;
    /** Required for the icon prop unless native aria-label, aria-labelledby or a named pt.root is supplied. */
    ariaLabel?: string;
    /** Attributes of internal Gavia UI elements. */
    pt?: WlPt<"iconButton">;
};
type __VLS_Slots = {
    /** Action text, optionally with a custom icon; descriptions alone do not name the action. */
    default?(props: Record<never, never>): unknown;
};
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    variant: string;
    size: string;
    active: boolean;
    disabled: boolean;
    dot: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    click: (event: MouseEvent) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    variant: string;
    size: string;
    active: boolean;
    disabled: boolean;
    dot: boolean;
}>>> & {
    onClick?: ((event: MouseEvent) => any) | undefined;
}, {
    disabled: boolean;
    size: "sm" | "md";
    active: boolean;
    dot: boolean;
    variant: WlIconButtonVariant;
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

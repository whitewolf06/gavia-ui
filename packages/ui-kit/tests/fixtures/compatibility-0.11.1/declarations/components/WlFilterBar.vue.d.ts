import { WlDensity } from '../types';
import { WlNoModelModifiers } from '../model-types';
import { WlFilterBarSlots } from '../overlay-types';
type __VLS_Props = {
    activeCount?: number;
    openModifiers?: WlNoModelModifiers;
    ariaLabel?: string;
    toggleLabel?: string;
    panelTitle?: string;
    clearLabel?: string;
    applyLabel?: string;
    closeLabel?: string;
    showClear?: boolean;
    showApply?: boolean;
    disabled?: boolean;
    density?: WlDensity;
};
declare function requestOpen(): void;
declare function toggle(): void;
declare function clear(): void;
declare function apply(): void;
type __VLS_PublicProps = {
    "open"?: boolean;
    'openModifiers'?: Partial<Record<never, true>>;
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: Readonly<WlFilterBarSlots> & WlFilterBarSlots;
    refs: {
        panelRef: HTMLDivElement;
    };
    rootEl: HTMLElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    activeCount: number;
    ariaLabel: string;
    toggleLabel: string;
    panelTitle: string;
    clearLabel: string;
    applyLabel: string;
    closeLabel: string;
    showClear: boolean;
    showApply: boolean;
    disabled: boolean;
    density: string;
}>, {
    open: typeof requestOpen;
    close: () => void;
    toggle: typeof toggle;
    clear: typeof clear;
    apply: typeof apply;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    clear: () => void;
    close: () => void;
    open: () => void;
    apply: () => void;
    "update:open": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    activeCount: number;
    ariaLabel: string;
    toggleLabel: string;
    panelTitle: string;
    clearLabel: string;
    applyLabel: string;
    closeLabel: string;
    showClear: boolean;
    showApply: boolean;
    disabled: boolean;
    density: string;
}>>> & {
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
    onClear?: (() => any) | undefined;
    onApply?: (() => any) | undefined;
    "onUpdate:open"?: ((value: boolean) => any) | undefined;
}, {
    disabled: boolean;
    density: WlDensity;
    ariaLabel: string;
    closeLabel: string;
    activeCount: number;
    toggleLabel: string;
    panelTitle: string;
    clearLabel: string;
    applyLabel: string;
    showClear: boolean;
    showApply: boolean;
}, {}>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithDefaults<P, D> = {
    [K in keyof Pick<P, keyof P>]: K extends keyof D ? __VLS_PrettifyLocal<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_NonUndefinedable<T> = T extends undefined ? never : T;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<__VLS_NonUndefinedable<T[K]>>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};

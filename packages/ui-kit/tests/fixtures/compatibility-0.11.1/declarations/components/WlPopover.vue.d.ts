import { WlPt } from '../pt-types';
type __VLS_Props = {
    dismissable?: boolean;
    closeOnEscape?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    motion?: boolean;
    pt?: WlPt<"popover">;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: Readonly<{
        default?(props: {}): unknown;
    }> & {
        default?(props: {}): unknown;
    };
    refs: {
        panel: HTMLDivElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    dismissable: boolean;
    closeOnEscape: boolean;
    motion: undefined;
}>, {
    toggle: (event?: Event) => void;
    show: (event?: Event) => void;
    hide: (event?: Event) => void;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    close: () => void;
    open: () => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    dismissable: boolean;
    closeOnEscape: boolean;
    motion: undefined;
}>>> & {
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
}, {
    motion: boolean;
    dismissable: boolean;
    closeOnEscape: boolean;
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

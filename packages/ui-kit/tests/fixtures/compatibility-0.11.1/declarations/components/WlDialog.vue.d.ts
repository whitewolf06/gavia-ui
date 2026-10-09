import { WlPt } from '../pt-types';
import { WlNoModelModifiers } from '../model-types';
type __VLS_Props = {
    header?: string;
    visibleModifiers?: WlNoModelModifiers;
    modal?: boolean;
    closable?: boolean;
    dismissable?: boolean;
    closeOnEscape?: boolean;
    blockScroll?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    width?: string;
    motion?: boolean;
    pt?: WlPt<"dialog">;
};
type __VLS_PublicProps = {
    "visible"?: boolean;
    'visibleModifiers'?: Partial<Record<never, true>>;
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: Readonly<{
        default?(props: {}): unknown;
        header?(props: {}): unknown;
        footer?(props: {}): unknown;
    }> & {
        default?(props: {}): unknown;
        header?(props: {}): unknown;
        footer?(props: {}): unknown;
    };
    refs: {
        dialog: HTMLElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    modal: boolean;
    closable: boolean;
    dismissable: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
    motion: undefined;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    close: () => void;
    open: () => void;
    afterLeave: () => void;
    "update:visible": (value: boolean) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    modal: boolean;
    closable: boolean;
    dismissable: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
    motion: undefined;
}>>> & {
    onAfterLeave?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
    onOpen?: (() => any) | undefined;
    "onUpdate:visible"?: ((value: boolean) => any) | undefined;
}, {
    motion: boolean;
    closable: boolean;
    modal: boolean;
    dismissable: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
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

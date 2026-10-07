import { WlDrawerPosition } from '../types';
type __VLS_Props = {
    header?: string;
    position?: WlDrawerPosition;
    modal?: boolean;
    dismissable?: boolean;
    closeOnEscape?: boolean;
    blockScroll?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    motion?: boolean;
    pt?: Record<string, unknown>;
};
type __VLS_PublicProps = {
    "visible"?: boolean;
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        header?(_: {}): any;
        default?(_: {}): any;
        footer?(_: {}): any;
    };
    refs: {
        drawer: HTMLElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    open: () => any;
    close: () => any;
    "update:visible": (value: boolean) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    onOpen?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
    "onUpdate:visible"?: ((value: boolean) => any) | undefined;
}>, {
    position: WlDrawerPosition;
    motion: boolean;
    modal: boolean;
    dismissable: boolean;
    closeOnEscape: boolean;
    blockScroll: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    drawer: HTMLElement;
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

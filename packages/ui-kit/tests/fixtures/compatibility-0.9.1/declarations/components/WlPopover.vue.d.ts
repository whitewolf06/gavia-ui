type __VLS_Props = {
    dismissable?: boolean;
    closeOnEscape?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    motion?: boolean;
    pt?: Record<string, unknown>;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        default?(_: {}): any;
    };
    refs: {
        panel: HTMLDivElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {
    toggle: (event?: Event) => void;
    show: (event?: Event) => void;
    hide: (event?: Event) => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    open: () => any;
    close: () => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onOpen?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
}>, {
    motion: boolean;
    dismissable: boolean;
    closeOnEscape: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    panel: HTMLDivElement;
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

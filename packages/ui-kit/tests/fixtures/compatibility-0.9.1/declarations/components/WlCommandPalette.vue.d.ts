import { WlCommandPaletteGroup, WlCommandPaletteItem, WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    groups?: WlCommandPaletteGroup[];
    placeholder?: string;
    emptyText?: string;
    loadingText?: string;
    ariaLabel?: string;
    filter?: boolean;
    shortcut?: boolean;
    closeOnSelect?: boolean;
    loading?: boolean;
    disabled?: boolean;
    size?: WlSizeSm;
    density?: WlDensity;
    motion?: boolean;
};
type __VLS_PublicProps = {
    "visible"?: boolean;
    "query"?: string;
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        group?(_: {
            group: WlCommandPaletteGroup;
        }): any;
        item?(_: {
            item: WlCommandPaletteItem;
            group: WlCommandPaletteGroup;
            active: boolean;
        }): any;
        'item-icon'?(_: {
            item: WlCommandPaletteItem;
            group: WlCommandPaletteGroup;
        }): any;
        empty?(_: {
            query: string;
        }): any;
        footer?(_: {}): any;
    };
    refs: {
        panelRef: HTMLDivElement;
        inputRef: HTMLInputElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_PublicProps, {
    focus: () => void | undefined;
    open: () => void;
    close: () => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    search: (query: string) => any;
    select: (item: WlCommandPaletteItem, group: WlCommandPaletteGroup) => any;
    open: () => any;
    close: () => any;
    "update:visible": (value: boolean) => any;
    "update:query": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    onSearch?: ((query: string) => any) | undefined;
    onSelect?: ((item: WlCommandPaletteItem, group: WlCommandPaletteGroup) => any) | undefined;
    onOpen?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
    "onUpdate:visible"?: ((value: boolean) => any) | undefined;
    "onUpdate:query"?: ((value: string) => any) | undefined;
}>, {
    filter: boolean;
    size: WlSizeSm;
    disabled: boolean;
    placeholder: string;
    density: WlDensity;
    motion: boolean;
    loading: boolean;
    ariaLabel: string;
    groups: WlCommandPaletteGroup[];
    emptyText: string;
    loadingText: string;
    shortcut: boolean;
    closeOnSelect: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    panelRef: HTMLDivElement;
    inputRef: HTMLInputElement;
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

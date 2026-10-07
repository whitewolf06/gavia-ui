import { WlDensity, WlSidebarGroup, WlSidebarItem } from '../types';
type __VLS_Props = {
    groups?: WlSidebarGroup[];
    footerItems?: WlSidebarItem[];
    brand?: string;
    brandMark?: string;
    ariaLabel?: string;
    collapsible?: boolean;
    expandOnHover?: boolean;
    showPin?: boolean;
    pinLabel?: string;
    unpinLabel?: string;
    density?: WlDensity;
};
declare function togglePinned(): void;
type __VLS_PublicProps = {
    modelValue?: string;
    "pinned"?: boolean;
    "mobileOpen"?: boolean;
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        'brand-mark'?(_: {}): any;
        brand?(_: {}): any;
        item?(_: {
            key: string;
            item: WlSidebarItem;
            group: WlSidebarGroup;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): any;
        'footer-item'?(_: {
            key: string;
            item: WlSidebarItem;
            active: boolean;
            expanded: boolean;
            select: () => void;
        }): any;
        footer?(_: {
            expanded: boolean;
        }): any;
    };
    refs: {
        asideRef: HTMLElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_PublicProps, {
    openMobile: () => void;
    closeMobile: () => void;
    togglePinned: typeof togglePinned;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    select: (item: WlSidebarItem, group?: WlSidebarGroup | undefined) => any;
    "update:modelValue": (value: string) => any;
    "update:pinned": (value: boolean) => any;
    "update:mobileOpen": (value: boolean) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    onSelect?: ((item: WlSidebarItem, group?: WlSidebarGroup | undefined) => any) | undefined;
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    "onUpdate:pinned"?: ((value: boolean) => any) | undefined;
    "onUpdate:mobileOpen"?: ((value: boolean) => any) | undefined;
}>, {
    density: WlDensity;
    ariaLabel: string;
    groups: WlSidebarGroup[];
    footerItems: WlSidebarItem[];
    brand: string;
    brandMark: string;
    collapsible: boolean;
    expandOnHover: boolean;
    showPin: boolean;
    pinLabel: string;
    unpinLabel: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    asideRef: HTMLElement;
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

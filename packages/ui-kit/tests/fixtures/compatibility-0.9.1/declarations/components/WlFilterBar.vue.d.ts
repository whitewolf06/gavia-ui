import { WlDensity } from '../types';
type __VLS_Props = {
    activeCount?: number;
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
} & __VLS_Props;
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        leading?(_: {}): any;
        default?(_: {
            open: typeof requestOpen;
            close: () => void;
            clear: typeof clear;
        }): any;
        actions?(_: {
            clear: typeof clear;
            close: () => void;
        }): any;
        footer?(_: {
            apply: typeof apply;
            clear: typeof clear;
            close: () => void;
        }): any;
        summary?(_: {
            clear: typeof clear;
        }): any;
    };
    refs: {
        panelRef: HTMLDivElement;
    };
    rootEl: HTMLElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_PublicProps, {
    open: typeof requestOpen;
    close: () => void;
    toggle: typeof toggle;
    clear: typeof clear;
    apply: typeof apply;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    open: () => any;
    close: () => any;
    clear: () => any;
    apply: () => any;
    "update:open": (value: boolean) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    onOpen?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
    onClear?: (() => any) | undefined;
    onApply?: (() => any) | undefined;
    "onUpdate:open"?: ((value: boolean) => any) | undefined;
}>, {
    closeLabel: string;
    disabled: boolean;
    density: WlDensity;
    ariaLabel: string;
    activeCount: number;
    toggleLabel: string;
    panelTitle: string;
    clearLabel: string;
    applyLabel: string;
    showClear: boolean;
    showApply: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    panelRef: HTMLDivElement;
}, HTMLElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

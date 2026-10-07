import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    chooseLabel?: string;
    ariaLabel?: string;
    size?: WlSizeSm;
    density?: WlDensity;
    pt?: Record<string, unknown>;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        trigger?(_: {
            choose: () => void;
            clear: () => void;
            disabled: boolean;
            attrs: {
                [k: string]: unknown;
            };
        }): any;
    };
    refs: {
        input: HTMLInputElement;
    };
    rootEl: any;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {
    choose: () => void;
    clear: () => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    select: (files: File[]) => any;
    cancel: () => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onSelect?: ((files: File[]) => any) | undefined;
    onCancel?: (() => any) | undefined;
}>, {
    size: WlSizeSm;
    disabled: boolean;
    multiple: boolean;
    density: WlDensity;
    chooseLabel: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    input: HTMLInputElement;
}, any>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

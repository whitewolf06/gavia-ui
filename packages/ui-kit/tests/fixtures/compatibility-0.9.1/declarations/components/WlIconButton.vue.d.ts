import { WlIconButtonVariant } from '../types';
import { WlIconInput } from '../iconNames';
type __VLS_Props = {
    variant?: WlIconButtonVariant;
    size?: "md" | "sm";
    icon?: WlIconInput;
    active?: boolean;
    disabled?: boolean;
    count?: number;
    dot?: boolean;
    ariaLabel?: string;
    pt?: Record<string, unknown>;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        default?(_: {}): any;
    };
    refs: {};
    rootEl: HTMLButtonElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    click: (event: MouseEvent) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onClick?: ((event: MouseEvent) => any) | undefined;
}>, {
    size: "md" | "sm";
    variant: WlIconButtonVariant;
    disabled: boolean;
    active: boolean;
    dot: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLButtonElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

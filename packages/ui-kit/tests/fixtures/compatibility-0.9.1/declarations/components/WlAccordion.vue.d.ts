import { WlAccordionItem } from '../types';
type __VLS_Props = {
    items?: WlAccordionItem[];
    single?: boolean;
    openKeys?: string[];
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        item?(_: {
            item: WlAccordionItem;
            open: boolean;
        }): any;
    };
    refs: {};
    rootEl: HTMLDivElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:openKeys": (value: string[]) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:openKeys"?: ((value: string[]) => any) | undefined;
}>, {
    single: boolean;
    items: WlAccordionItem[];
    openKeys: string[];
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLDivElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

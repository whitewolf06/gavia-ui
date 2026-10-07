import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    title?: string;
    description?: string;
    eyebrow?: string;
    headingLevel?: 1 | 2;
    size?: WlSizeSm;
    density?: WlDensity;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: {
        breadcrumbs?(_: {}): any;
        eyebrow?(_: {}): any;
        title?(_: {}): any;
        description?(_: {}): any;
        meta?(_: {}): any;
        actions?(_: {}): any;
        navigation?(_: {}): any;
    };
    refs: {};
    rootEl: HTMLElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    size: WlSizeSm;
    title: string;
    density: WlDensity;
    description: string;
    eyebrow: string;
    headingLevel: 1 | 2;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

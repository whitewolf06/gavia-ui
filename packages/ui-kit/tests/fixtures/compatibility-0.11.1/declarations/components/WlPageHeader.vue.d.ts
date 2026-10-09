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
declare const __VLS_component: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    title: string;
    description: string;
    eyebrow: string;
    headingLevel: number;
    size: string;
    density: string;
}>, {}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    title: string;
    description: string;
    eyebrow: string;
    headingLevel: number;
    size: string;
    density: string;
}>>>, {
    title: string;
    size: WlSizeSm;
    density: WlDensity;
    description: string;
    eyebrow: string;
    headingLevel: 1 | 2;
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

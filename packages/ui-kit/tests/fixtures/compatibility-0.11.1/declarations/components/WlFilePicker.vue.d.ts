import { WlPt } from '../pt-types';
import { WlDensity, WlSizeSm } from '../types';
type __VLS_Props = {
    accept?: string;
    multiple?: boolean;
    disabled?: boolean;
    chooseLabel?: string;
    ariaLabel?: string;
    size?: WlSizeSm;
    density?: WlDensity;
    pt?: WlPt<"filepicker">;
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
declare const __VLS_component: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    multiple: boolean;
    disabled: boolean;
    chooseLabel: string;
    size: string;
    density: string;
}>, {
    choose(): void;
    clear(): void;
}, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    select: (files: File[]) => void;
    cancel: () => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_Props>, {
    multiple: boolean;
    disabled: boolean;
    chooseLabel: string;
    size: string;
    density: string;
}>>> & {
    onSelect?: ((files: File[]) => any) | undefined;
    onCancel?: (() => any) | undefined;
}, {
    disabled: boolean;
    size: WlSizeSm;
    multiple: boolean;
    density: WlDensity;
    chooseLabel: string;
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

import { WlTableColumn, WlTableRow } from '../types';
type __VLS_Props = {
    value?: WlTableRow[];
    columns?: WlTableColumn[];
    loading?: boolean;
    emptyMessage?: string;
    pt?: Record<string, unknown>;
};
declare function __VLS_template(): {
    attrs: Partial<{}>;
    slots: Partial<Record<`cell-${string}`, (_: {
        row: WlTableRow;
        value: unknown;
    }) => any>> & {
        default?(_: {}): any;
        empty?(_: {}): any;
    };
    refs: {};
    rootEl: HTMLDivElement;
};
type __VLS_TemplateResult = ReturnType<typeof __VLS_template>;
declare const __VLS_component: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {
    value: WlTableRow[];
    emptyMessage: string;
    loading: boolean;
    columns: WlTableColumn[];
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLDivElement>;
declare const _default: __VLS_WithTemplateSlots<typeof __VLS_component, __VLS_TemplateResult["slots"]>;
export default _default;
type __VLS_WithTemplateSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};

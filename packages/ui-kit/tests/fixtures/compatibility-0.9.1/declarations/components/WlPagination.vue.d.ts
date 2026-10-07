type __VLS_Props = {
    page?: number;
    pageCount: number;
    siblings?: number;
    compact?: boolean;
    disabled?: boolean;
    pt?: Record<string, unknown>;
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {} & {
    "update:page": (value: number) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:page"?: ((value: number) => any) | undefined;
}>, {
    compact: boolean;
    disabled: boolean;
    page: number;
    siblings: number;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLElement>;
export default _default;

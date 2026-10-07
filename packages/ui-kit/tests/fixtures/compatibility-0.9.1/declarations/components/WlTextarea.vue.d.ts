type __VLS_Props = {
    invalid?: boolean;
    disabled?: boolean;
    rows?: number;
    autoResize?: boolean;
    placeholder?: string;
    pt?: Record<string, unknown>;
};
type __VLS_PublicProps = {
    modelValue?: string;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}>, {
    disabled: boolean;
    invalid: boolean;
    rows: number;
    autoResize: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    control: HTMLTextAreaElement;
}, HTMLTextAreaElement>;
export default _default;

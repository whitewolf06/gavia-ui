type __VLS_Props = {
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    ariaLabel?: string;
};
type __VLS_PublicProps = {
    modelValue?: number;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: number) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: number) => any) | undefined;
}>, {
    disabled: boolean;
    min: number;
    max: number;
    step: number;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLInputElement>;
export default _default;

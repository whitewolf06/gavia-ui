import { WlSegmentedOption } from '../types';
type __VLS_Props = {
    options?: WlSegmentedOption[];
    disabled?: boolean;
    pt?: Record<string, unknown>;
};
type __VLS_PublicProps = {
    modelValue?: string | null;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string | null) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string | null) => any) | undefined;
}>, {
    disabled: boolean;
    options: WlSegmentedOption[];
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;

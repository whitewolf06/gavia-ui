import { WlFileReject } from '../types';
type __VLS_Props = {
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    /** Bytes. */
    maxSize?: number;
    disabled?: boolean;
};
type __VLS_PublicProps = {
    modelValue?: File[];
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    reject: (payload: WlFileReject) => any;
    "update:modelValue": (value: File[]) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    onReject?: ((payload: WlFileReject) => any) | undefined;
    "onUpdate:modelValue"?: ((value: File[]) => any) | undefined;
}>, {
    accept: string;
    disabled: boolean;
    multiple: boolean;
    maxFiles: number;
    maxSize: number;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    input: HTMLInputElement;
}, HTMLDivElement>;
export default _default;

import { WlCalendarEvent } from '../types';
type __VLS_Props = {
    events?: WlCalendarEvent[];
};
type __VLS_PublicProps = {
    modelValue?: string;
    "month"?: string;
} & __VLS_Props;
declare const _default: import('vue').DefineComponent<__VLS_PublicProps, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
    "update:month": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_PublicProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
    "onUpdate:month"?: ((value: string) => any) | undefined;
}>, {
    events: WlCalendarEvent[];
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    gridRef: HTMLDivElement;
}, HTMLDivElement>;
export default _default;

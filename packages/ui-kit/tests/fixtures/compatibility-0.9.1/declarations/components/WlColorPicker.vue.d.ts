import { WlColorPickerSize } from '../types';
/** Kit accent / success / warn / danger + gray ramp (foundation hexes).
 *  Inlined into withDefaults — defineProps cannot reference local variables. */
type __VLS_Props = {
    /** v-model — hex color, always emitted normalized as lowercase #rrggbb. */
    modelValue?: string;
    swatches?: string[];
    size?: WlColorPickerSize;
    disabled?: boolean;
    invalid?: boolean;
    paletteLabel?: string;
    inputLabel?: string;
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}>, {
    size: WlColorPickerSize;
    disabled: boolean;
    invalid: boolean;
    modelValue: string;
    swatches: string[];
    paletteLabel: string;
    inputLabel: string;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {}, HTMLDivElement>;
export default _default;

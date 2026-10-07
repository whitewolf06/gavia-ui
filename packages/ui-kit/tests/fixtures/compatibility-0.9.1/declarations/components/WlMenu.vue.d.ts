import { WlMenuItem } from '../types';
type __VLS_Props = {
    items?: WlMenuItem[];
    popup?: boolean;
    ariaLabel?: string;
    ariaLabelledby?: string;
    motion?: boolean;
    pt?: Record<string, unknown>;
};
declare const _default: import('vue').DefineComponent<__VLS_Props, {
    toggle: (event?: Event) => void;
    show: (event?: Event) => void;
    hide: (event?: Event) => void;
}, {}, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    open: () => any;
    close: () => any;
}, string, import('vue').PublicProps, Readonly<__VLS_Props> & Readonly<{
    onOpen?: (() => any) | undefined;
    onClose?: (() => any) | undefined;
}>, {
    items: WlMenuItem[];
    motion: boolean;
    popup: boolean;
}, {}, {}, {}, string, import('vue').ComponentProvideOptions, false, {
    panel: HTMLDivElement;
}, any>;
export default _default;

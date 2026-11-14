import { Ref } from 'vue';
/** A single tab stop for a composite control, with disabled items skipped. */
export declare function useWlRovingFocus(options: {
    count: () => number;
    isDisabled: (index: number) => boolean;
    focus: (index: number) => void;
    orientation?: "horizontal" | "vertical" | (() => "horizontal" | "vertical");
    loop?: boolean | (() => boolean);
}): {
    active: Ref<number>;
    tabIndex: (index: number) => 0 | -1;
    onKeydown: (event: KeyboardEvent) => void;
};

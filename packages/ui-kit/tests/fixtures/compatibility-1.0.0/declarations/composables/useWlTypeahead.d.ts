export interface WlTypeaheadOptions {
    count: () => number;
    label: (index: number) => string;
    active: () => number;
    onMatch: (index: number) => void;
    isDisabled?: (index: number) => boolean;
    delay?: number;
}
/** Buffered prefix matching for noneditable composite controls. Repeated letters cycle matches. */
export declare function useWlTypeahead(options: WlTypeaheadOptions): {
    onKeydown: (event: KeyboardEvent) => void;
    reset: () => void;
};

import { Ref } from 'vue';
export type OptionResolver = string | ((option: any) => unknown) | undefined;
export declare function optionValue(option: unknown, resolver: OptionResolver): unknown;
export declare function optionLabel(option: unknown, resolver: OptionResolver): string;
export declare function useListNavigation(length: () => number, select: (index: number) => void, close: (event?: KeyboardEvent) => void): {
    active: Ref<number>;
    onKeydown: (event: KeyboardEvent) => void;
};

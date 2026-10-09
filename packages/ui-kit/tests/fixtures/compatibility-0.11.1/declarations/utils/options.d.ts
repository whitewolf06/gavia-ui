import { Ref } from 'vue';
import { WlOptionValue, WlOptionValueResolver } from '../selection-types';
export type OptionResolver<TOption = unknown> = WlOptionValueResolver<TOption> | undefined;
export declare function optionValue<TOption, TResolver extends OptionResolver<TOption>>(option: TOption, resolver: TResolver): WlOptionValue<TOption, TResolver>;
export declare function optionLabel<TOption>(option: TOption, resolver: string | ((option: TOption) => unknown) | undefined): string;
export declare function useListNavigation(length: () => number, select: (index: number) => void, close: (event?: KeyboardEvent) => void): {
    active: Ref<number>;
    onKeydown: (event: KeyboardEvent) => void;
};

import { ComputedRef, Ref } from 'vue';
import { WlOptionDisabled, WlOptionKeyResolver, WlOptionValue, WlOptionValueResolver } from "../selection-types.js";
export type OptionResolver<TOption = unknown> = WlOptionValueResolver<TOption> | undefined;
export declare function optionValue<TOption, TResolver extends OptionResolver<TOption>>(option: TOption, resolver: TResolver): WlOptionValue<TOption, TResolver>;
export declare function optionLabel<TOption>(option: TOption, resolver: string | ((option: TOption) => unknown) | undefined): string;
export declare function optionDisabled<TOption>(option: TOption, resolver: WlOptionDisabled<TOption> | undefined): boolean;
export declare function optionKey<TOption>(option: TOption, resolver: WlOptionKeyResolver<TOption> | undefined, index: number, defaultValue?: unknown): PropertyKey;
export declare function useWlListbox(options: {
    listId: () => string;
    count: () => number;
    isDisabled?: (index: number) => boolean;
    label?: (index: number) => string;
    onSelect: (index: number) => void;
    onClose: (event?: KeyboardEvent) => void;
    list: Ref<HTMLElement | null>;
}): {
    active: Ref<number>;
    optionId: (index: number) => string;
    activeDescendant: ComputedRef<string | undefined>;
    onKeydown: (event: KeyboardEvent) => void;
};

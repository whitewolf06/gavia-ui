import { WlOptionGroupChildrenResolver, WlOptionLabel, WlOptionLeaf } from "../selection-types.js";
export interface WlOptionSection<TSource, TOption> {
    group: TSource | undefined;
    label: string;
    options: {
        option: TOption;
        index: number;
    }[];
}
/** Group wrappers retain their options when preceding groups are filtered or reordered. */
export declare function createOptionGroupKey(): (group: unknown, index: number) => PropertyKey;
/** Resolve groups and filtering once, retaining a flat option index for listbox navigation. */
export declare function optionSections<TSource, TChildren extends WlOptionGroupChildrenResolver<TSource> | undefined>(sources: readonly TSource[], children: TChildren, groupLabel: WlOptionLabel<TSource> | undefined, label: WlOptionLabel<WlOptionLeaf<TSource, TChildren>> | undefined, query: string): WlOptionSection<TSource, WlOptionLeaf<TSource, TChildren>>[];

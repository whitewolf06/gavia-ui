import type { WlOptionGroupChildrenResolver, WlOptionLabel, WlOptionLeaf } from "../selection-types";
import { optionLabel } from "./options";

export interface WlOptionSection<TSource, TOption> {
  group: TSource | undefined;
  label: string;
  options: { option: TOption; index: number }[];
}

/** Group wrappers retain their options when preceding groups are filtered or reordered. */
export function createOptionGroupKey(): (group: unknown, index: number) => PropertyKey {
  const identities = new WeakMap<object, number>();
  let next = 0;
  return (group, index) => {
    if (group !== null && (typeof group === "object" || typeof group === "function")) {
      let key = identities.get(group);
      if (key === undefined) {
        key = next++;
        identities.set(group, key);
      }
      return key;
    }
    return group === undefined ? `flat:${index}` : `${typeof group}:${String(group)}`;
  };
}

/** Resolve groups and filtering once, retaining a flat option index for listbox navigation. */
export function optionSections<TSource, TChildren extends WlOptionGroupChildrenResolver<TSource> | undefined>(
  sources: readonly TSource[], children: TChildren, groupLabel: WlOptionLabel<TSource> | undefined,
  label: WlOptionLabel<WlOptionLeaf<TSource, TChildren>> | undefined, query: string
): WlOptionSection<TSource, WlOptionLeaf<TSource, TChildren>>[] {
  let index = 0;
  const normalized = query.toLocaleLowerCase();
  const groups = children === undefined
    ? [{ group: undefined, options: sources, label: "" }]
    : sources.map((group) => {
        const value = typeof children === "function"
          ? children(group)
          : group && typeof group === "object" ? (group as Record<string, unknown>)[String(children)] : undefined;
        return { group, options: Array.isArray(value) ? value : [], label: optionLabel(group, groupLabel) };
      });
  return groups.map((group) => ({
    group: group.group, label: group.label,
    // This cast follows the public conditional type and the runtime resolver above.
    options: (group.options as readonly WlOptionLeaf<TSource, TChildren>[])
      .filter((option) => !normalized || optionLabel(option, label).toLocaleLowerCase().includes(normalized))
      .map((option) => ({ option, index: index++ }))
  })).filter((group) => group.options.length > 0);
}

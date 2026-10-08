/** Compile-only contracts; run by the authorized strict library typecheck before release. */
import { WlAutocomplete, WlMultiSelect, WlSelect } from "../src";
import type { WlAutocompleteModel, WlOptionValue, WlOptionValueResolver } from "../src";
import Consumer from "./fixtures/selection-contracts-consumer.vue";

interface Item { id: number; label: string; }
const items: readonly Item[] = [{ id: 1, label: "One" }];
const resolveId = (option: Item): number => option.id;
const resolveLabel = (option: Item): string => option.label;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type KeyValue = Expect<Equal<WlOptionValue<Item, "id">, number>>;
type CallbackValue = Expect<Equal<WlOptionValue<Item, typeof resolveLabel>, string>>;
type DirectValue = Expect<Equal<WlOptionValue<Item>, Item>>;
// @ts-expect-error Standalone model contracts must reject unknown object keys too.
type MissingField = WlOptionValue<Item, "missing">;
type DynamicResolver = Expect<Equal<WlOptionValue<Item, "id" | undefined>, Item | number>>;
type MultipleModel = Expect<Equal<WlAutocompleteModel<Item, true>, Item[] | null>>;
type FreeTextModel = Expect<Equal<WlAutocompleteModel<Item>, Item | string | null>>;
type KeyProps = Parameters<typeof WlSelect<Item, "id">>[0];
type CallbackProps = Parameters<typeof WlSelect<Item, typeof resolveId>>[0];
type MultiProps = Parameters<typeof WlMultiSelect<Item, "id">>[0];
type AutoProps = Parameters<typeof WlAutocomplete<Item>>[0];
type AutoMultipleProps = Parameters<typeof WlAutocomplete<Item, true>>[0];
type KeyUpdate = Expect<Equal<Parameters<NonNullable<KeyProps["onUpdate:modelValue"]>>[0], number | null>>;
type MultiUpdate = Expect<Equal<Parameters<NonNullable<MultiProps["onUpdate:modelValue"]>>[0], number[]>>;
type AutoUpdate = Expect<Equal<Parameters<NonNullable<AutoProps["onUpdate:modelValue"]>>[0], Item | string | null>>;
type AutoMultipleUpdate = Expect<Equal<Parameters<NonNullable<AutoMultipleProps["onUpdate:modelValue"]>>[0], Item[] | null>>;
type KeyInput = Expect<Equal<KeyProps["modelValue"], number | null | undefined>>;
type AutoInput = Expect<Equal<AutoProps["modelValue"], Item | string | null | undefined>>;
type KeyContext = NonNullable<ReturnType<typeof WlSelect<Item, "id">>["__ctx"]>;
type MultiContext = NonNullable<ReturnType<typeof WlMultiSelect<Item, "id">>["__ctx"]>;
type AutoContext = NonNullable<ReturnType<typeof WlAutocomplete<Item>>["__ctx"]>;
type AutoMultipleContext = NonNullable<ReturnType<typeof WlAutocomplete<Item, true>>["__ctx"]>;

function selectionContextTypes(key: KeyContext, multi: MultiContext, auto: AutoContext, autoMultiple: AutoMultipleContext): void {
  key.emit("update:modelValue", 1); key.emit("update:modelValue", null);
  multi.emit("update:modelValue", [1]);
  auto.emit("update:modelValue", items[0]!); auto.emit("update:modelValue", "text"); auto.emit("update:modelValue", null);
  autoMultiple.emit("update:modelValue", [...items]); autoMultiple.emit("update:modelValue", null);
  // @ts-expect-error Omitted inputs do not add undefined to the resolved selection event.
  key.emit("update:modelValue", undefined);
  // @ts-expect-error MultiSelect updates are arrays, never omitted values.
  multi.emit("update:modelValue", undefined);
  // @ts-expect-error Autocomplete emits suggestions/free text/null, not omitted input absence.
  auto.emit("update:modelValue", undefined);
  // @ts-expect-error Multiple mode has the same exact event domain, with an array instead of free text.
  autoMultiple.emit("update:modelValue", undefined);
  // @ts-expect-error A keyed Select emits its resolved numeric value.
  key.emit("update:modelValue", "One");
  // @ts-expect-error Multiple autocomplete never emits scalar free text.
  autoMultiple.emit("update:modelValue", "One");
}

export function selectionConsumerTypes(): void {
  const keyed: KeyProps = { options: items, optionValue: "id", optionLabel: "label", modelValue: 1 };
  const callback: CallbackProps = { options: items, optionValue: resolveId, modelValue: 1 };
  const multi: MultiProps = { options: items, optionValue: "id", modelValue: [1] };
  const auto: AutoProps = { suggestions: items, modelValue: "free text", optionLabel: (item) => typeof item === "string" ? item : item.label };
  const autoMultiple: AutoMultipleProps = { suggestions: items, multiple: true, modelValue: [...items], optionLabel: (item) => item.label };
  // @ts-expect-error A field resolver must be an actual field of Item.
  const badKey: WlOptionValueResolver<Item> = "missing";
  // @ts-expect-error The model must match the resolved id, not the label.
  const badModel: KeyProps = { options: items, optionValue: "id", modelValue: "One" };
  // @ts-expect-error Callback return types determine the model too.
  const badCallback: CallbackProps = { options: items, optionValue: resolveId, modelValue: "One" };
  // @ts-expect-error MultiSelect has the same resolver relation for each selected value.
  const badMulti: MultiProps = { options: items, optionValue: "id", modelValue: ["One"] };
  // @ts-expect-error Autocomplete's multiple mode never emits scalar free text.
  const badAutoMultiple: AutoMultipleProps = { suggestions: items, multiple: true, modelValue: "free text" };
  // @ts-expect-error Single label callbacks must handle user-entered text as well as suggestions.
  const badAutoLabel: AutoProps = { suggestions: items, optionLabel: (item: Item) => item.label };
  void [selectionContextTypes, keyed, callback, multi, auto, autoMultiple, badKey, badModel, badCallback, badMulti, badAutoMultiple, badAutoLabel, Consumer];
}

export type SelectionContractAssertions = [KeyValue, CallbackValue, DirectValue, DynamicResolver, MultipleModel, FreeTextModel, KeyUpdate, MultiUpdate, AutoUpdate, AutoMultipleUpdate, KeyInput, AutoInput];

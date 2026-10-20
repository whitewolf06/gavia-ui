/** String fields shared by all object options. Primitive options are used directly. */
export type WlOptionKey<TOption> = unknown extends TOption ? string
  : [TOption] extends [object] ? Extract<keyof TOption, string> : never;

/** Resolve a label from an object field or from the option supplied by the component. */
export type WlOptionLabel<TOption = unknown> = WlOptionKey<TOption> | ((option: TOption) => string);

/** Disabled options remain visible but cannot be selected or reached by keyboard. */
export type WlOptionDisabled<TOption = unknown> = WlOptionKey<TOption> | ((option: TOption) => boolean);

/** Stable keys preserve option slot state when a consumer reorders its data. */
export type WlOptionKeyResolver<TOption = unknown> = WlOptionKey<TOption> | ((option: TOption) => PropertyKey);

/** A group contains leaf options; the original source type remains inferred from options. */
export type WlOptionGroupChildrenResolver<TGroup = unknown>
  = (unknown extends TGroup ? string : {
    [Key in Extract<keyof TGroup, string>]-?: NonNullable<TGroup[Key]> extends readonly unknown[] ? Key : never
  }[Extract<keyof TGroup, string>]) | ((group: TGroup) => readonly unknown[]);
export type WlOptionLeaf<TSource, TChildren = undefined>
  = [TChildren] extends [undefined] ? TSource
    : TChildren extends (group: never) => readonly (infer TLeaf)[] ? TLeaf
      : TChildren extends keyof TSource ? NonNullable<TSource[TChildren]> extends readonly (infer TLeaf)[] ? TLeaf : TSource
        : TSource;

export interface WlSelectionExpose {
  open: (event?: Event) => void;
  close: () => void;
  focus: () => void;
}

/** A value resolver derives the model from the same options; it is not an independent model type. */
export type WlOptionValueResolver<TOption = unknown> = WlOptionKey<TOption> | ((option: TOption) => unknown);

/** A callback returns its result; a field returns that field's type; no resolver returns the option. */
export type WlOptionValue<TOption, TResolver extends WlOptionValueResolver<TOption> | undefined = undefined>
  = TResolver extends (option: never) => infer TValue ? TValue
    : TResolver extends keyof TOption ? TOption[TResolver]
      : TResolver extends string ? unknown : TOption;

/** null is the externally cleared single-selection state. An omitted model is also supported. */
export type WlSelectModel<
  TOption = unknown,
  TResolver extends WlOptionValueResolver<TOption> | undefined = undefined
> = WlOptionValue<TOption, TResolver> | null;
export type WlMultiSelectModel<
  TOption = unknown,
  TResolver extends WlOptionValueResolver<TOption> | undefined = undefined
> = WlOptionValue<TOption, TResolver>[];

/** Single autocomplete permits free text; multiple autocomplete stores selected suggestions only. */
export type WlAutocompleteModel<TOption = unknown, TMultiple extends boolean = false>
  = (TMultiple extends true ? TOption[] : TOption | string) | null;

/** In single mode a label callback also receives text entered by the user. */
export type WlAutocompleteOptionLabel<TOption = unknown, TMultiple extends boolean = false>
  = WlOptionKey<TOption> | ((option: TOption | (TMultiple extends true ? never : string)) => string);

export interface WlAutocompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

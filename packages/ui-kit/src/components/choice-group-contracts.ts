import type { WlElementAttributes } from "../native-types";
import type { WlOptionValueResolver } from "../selection-types";
import RawCheckboxGroup from "./WlCheckboxGroup.vue";
import RawRadioGroup from "./WlRadioGroup.vue";

type Attributes<Props> = Props & Omit<WlElementAttributes & { form?: string }, keyof Props>;
type VueArguments<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Rest] ? Rest : never;
type ResolverProp<Props, Resolver> = Props & ([Resolver] extends [undefined] ? unknown : { optionValue: Resolver });
type InferenceProps<Props> = Omit<Props, "modelValue" | "onUpdate:modelValue"> & { modelValue?: unknown; "onUpdate:modelValue"?: unknown };
type GenericInstance<Props, Result extends { __ctx?: unknown }>
  = (NonNullable<Result["__ctx"]> extends { expose(exposed: infer Exposed): void } ? Exposed : {}) & {
    $props: Props;
    $slots: NonNullable<Result["__ctx"]> extends { slots: infer Slots } ? Slots : {};
    $emit: NonNullable<Result["__ctx"]> extends { emit: infer Emit } ? Emit : never;
  };
type CheckboxProps<Option, Resolver extends WlOptionValueResolver<NoInfer<Option>> | undefined>
  = ResolverProp<Attributes<Parameters<typeof RawCheckboxGroup<Option, Resolver>>[0]>, Resolver>;
type RadioProps<Option, Resolver extends WlOptionValueResolver<NoInfer<Option>> | undefined>
  = ResolverProp<Attributes<Parameters<typeof RawRadioGroup<Option, Resolver>>[0]>, Resolver>;

type CheckboxGroupContract = {
  // The inference-only third parameter retains contextual callback inference in Vue templates.
  new<Option, Resolver extends (option: NoInfer<Option>) => unknown, CallbackInference extends never>(
    props: { options?: readonly Option[]; optionValue: Resolver }
      & InferenceProps<Omit<CheckboxProps<Option, Resolver>, "options" | "optionValue">>
  ): GenericInstance<CheckboxProps<Option, Resolver>, ReturnType<typeof RawCheckboxGroup<Option, Resolver>>>;
  new<Option = unknown, const Resolver extends WlOptionValueResolver<NoInfer<Option>> | undefined = undefined>(
    props: { options?: readonly Option[]; optionValue?: Resolver } & InferenceProps<CheckboxProps<Option, Resolver>>
  ): GenericInstance<CheckboxProps<Option, Resolver>, ReturnType<typeof RawCheckboxGroup<Option, Resolver>>>;
  <Option, Resolver extends (option: NoInfer<Option>) => unknown, CallbackInference extends never>(
    props: { options?: readonly Option[]; optionValue: Resolver } & Omit<CheckboxProps<Option, Resolver>, "options" | "optionValue">,
    ...vue: VueArguments<Parameters<typeof RawCheckboxGroup<Option, Resolver>>>
  ): ReturnType<typeof RawCheckboxGroup<Option, Resolver>>;
  <Option = unknown, const Resolver extends WlOptionValueResolver<NoInfer<Option>> | undefined = undefined>(
    props: { options?: readonly Option[]; optionValue?: Resolver } & CheckboxProps<Option, Resolver>,
    ...vue: VueArguments<Parameters<typeof RawCheckboxGroup<Option, Resolver>>>
  ): ReturnType<typeof RawCheckboxGroup<Option, Resolver>>;
};
type RadioGroupContract = {
  new<Option, Resolver extends (option: NoInfer<Option>) => unknown, CallbackInference extends never>(
    props: { options?: readonly Option[]; optionValue: Resolver }
      & InferenceProps<Omit<RadioProps<Option, Resolver>, "options" | "optionValue">>
  ): GenericInstance<RadioProps<Option, Resolver>, ReturnType<typeof RawRadioGroup<Option, Resolver>>>;
  new<Option = unknown, const Resolver extends WlOptionValueResolver<NoInfer<Option>> | undefined = undefined>(
    props: { options?: readonly Option[]; optionValue?: Resolver } & InferenceProps<RadioProps<Option, Resolver>>
  ): GenericInstance<RadioProps<Option, Resolver>, ReturnType<typeof RawRadioGroup<Option, Resolver>>>;
  <Option, Resolver extends (option: NoInfer<Option>) => unknown, CallbackInference extends never>(
    props: { options?: readonly Option[]; optionValue: Resolver } & Omit<RadioProps<Option, Resolver>, "options" | "optionValue">,
    ...vue: VueArguments<Parameters<typeof RawRadioGroup<Option, Resolver>>>
  ): ReturnType<typeof RawRadioGroup<Option, Resolver>>;
  <Option = unknown, const Resolver extends WlOptionValueResolver<NoInfer<Option>> | undefined = undefined>(
    props: { options?: readonly Option[]; optionValue?: Resolver } & RadioProps<Option, Resolver>,
    ...vue: VueArguments<Parameters<typeof RawRadioGroup<Option, Resolver>>>
  ): ReturnType<typeof RawRadioGroup<Option, Resolver>>;
};

/** Typed public views preserve the original SFC objects and their option/model relationship. */
export const WlCheckboxGroup = RawCheckboxGroup as unknown as CheckboxGroupContract;
export const WlRadioGroup = RawRadioGroup as unknown as RadioGroupContract;

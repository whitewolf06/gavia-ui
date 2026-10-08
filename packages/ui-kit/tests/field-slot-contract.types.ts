/** Compile-only Field slot compatibility through the public package API. */
import { h } from "vue";
import { WlField, type WlFieldSlotProps } from "../src";

// Released 0.9.1 payload: both ARIA keys were present, even without descriptions/errors.
interface ReleasedFieldSlotProps {
  id: string;
  inputId: string;
  ariaDescribedby: string | undefined;
  ariaInvalid: boolean | undefined;
  invalid: boolean;
  required: boolean;
}
type FieldSlot = NonNullable<InstanceType<typeof WlField>["$slots"]["default"]>;
type CurrentScope = Parameters<FieldSlot>[0];
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type DescribedbyRequired = Expect<Equal<{} extends Pick<CurrentScope, "ariaDescribedby"> ? false : true, true>>;
type InvalidRequired = Expect<Equal<{} extends Pick<CurrentScope, "ariaInvalid"> ? false : true, true>>;
type DescribedbyValue = Expect<Equal<CurrentScope["ariaDescribedby"], string | undefined>>;
type InvalidValue = Expect<Equal<CurrentScope["ariaInvalid"], true | undefined>>;

export function fieldSlotConsumerTypes(): void {
  const plain: WlFieldSlotProps = {
    id: "title", inputId: "title", ariaDescribedby: undefined, ariaInvalid: undefined,
    invalid: false, required: false
  };
  const releasedConsumer = (scope: ReleasedFieldSlotProps) => [
    h("input", { id: scope.inputId, "aria-describedby": scope.ariaDescribedby, "aria-invalid": scope.ariaInvalid, required: scope.required })
  ];
  const acceptedConsumer: FieldSlot = releasedConsumer;
  const compatiblePayload: ReleasedFieldSlotProps = plain;
  // @ts-expect-error The runtime always includes ariaDescribedby, even when it is undefined.
  const missingDescription: WlFieldSlotProps = { id: "title", inputId: "title", ariaInvalid: undefined, invalid: false, required: false };
  // @ts-expect-error The runtime always includes ariaInvalid, even when it is undefined.
  const missingInvalid: WlFieldSlotProps = { id: "title", inputId: "title", ariaDescribedby: undefined, invalid: false, required: false };
  // @ts-expect-error Absence is undefined; the runtime does not produce ariaInvalid=false.
  const falseInvalid: WlFieldSlotProps = { ...plain, ariaInvalid: false };
  // @ts-expect-error Description ids are text, not booleans.
  const wrongDescription: WlFieldSlotProps = { ...plain, ariaDescribedby: true };
  // @ts-expect-error A description must be narrowed before reading string methods.
  plain.ariaDescribedby.toUpperCase();
  void [acceptedConsumer, compatiblePayload, missingDescription, missingInvalid, falseInvalid, wrongDescription];
}
export type FieldSlotAssertions = [DescribedbyRequired, InvalidRequired, DescribedbyValue, InvalidValue];
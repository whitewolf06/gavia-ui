/** Compile-only JSX consumer; runtime and rendering remain Vue SFCs. */
import { WlButton, WlCheckbox, WlInput, WlNumberInput, WlSelect, WlTextarea } from "../src";

export function nativeJsxContracts() {
  const good = <div>
    <WlInput name="title" required maxlength={80} onInput={(event) => event.preventDefault()} onKeydown={(event) => event.key.toUpperCase()} />
    <WlTextarea name="description" rows={6} cols={40} />
    <WlButton type="submit" form="project" onClick={(event) => event.button.toFixed()} />
    <WlNumberInput modelValue={1} min={0} step={0.5} name="amount" />
    <WlCheckbox name="consent" required modelValue={false} />
    <WlSelect<string> options={["One"]} name="choice" modelValue="One" />
  </div>;
  // @ts-expect-error Keep component size distinct from the native input size attribute.
  const badSize = <WlInput size={60} />;
  // @ts-expect-error Listener payload is Event, not the model value.
  const badListener = <WlInput onInput={(value: string) => value.toUpperCase()} />;
  // @ts-expect-error Numeric model updates cannot emit text.
  const badModel = <WlNumberInput modelValue="one" />;
  // @ts-expect-error A proxy combobox does not support native text maxlength.
  const badProxy = <WlSelect<string> options={["One"]} maxlength={10} />;
  return [good, badSize, badListener, badModel, badProxy];
}

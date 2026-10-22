/** Compile-only JSX consumer; runtime and rendering remain Vue SFCs. */
import { WlButton, WlCheckbox, WlIconButton, WlInput, WlNumberInput, WlSelect, WlTextarea } from "../../src";

export function nativeJsxContracts() {
  const good = (
    <div>
      <WlInput name="title" required maxlength={80} onInput={(event) => event.preventDefault()} onKeydown={(event) => event.key.toUpperCase()} />
      <WlTextarea name="description" rows={6} cols={40} />
      <WlButton type="submit" form="project" onClick={(event) => event.button.toFixed()} />
      <WlNumberInput modelValue={1} min={0} step={0.5} name="amount" />
      <WlCheckbox name="consent" required modelValue={false} />
      <WlSelect<string> options={["One"]} name="choice" modelValue="One" />
      <WlIconButton icon="bell" ariaLabel="Inbox" />
      <WlIconButton icon="bell" aria-label="Inbox" />
      <WlIconButton icon="bell" aria-labelledby="inbox-label" />
      <WlIconButton icon="bell" pt={{ root: { "aria-label": "Inbox" } }} />
      <WlIconButton>Save changes</WlIconButton>
    </div>
  );
  // @ts-expect-error Keep component size distinct from the native input size attribute.
  const badSize = <WlInput size={60} />;
  // @ts-expect-error Listener payload is Event, not the model value.
  const badListener = <WlInput onInput={(value: string) => value.toUpperCase()} />;
  // @ts-expect-error Numeric model updates cannot emit text.
  const badModel = <WlNumberInput modelValue="one" />;
  // @ts-expect-error A proxy combobox does not support native text maxlength.
  const badProxy = <WlSelect<string> options={["One"]} maxlength={10} />;
  // @ts-expect-error Icon-only actions require a name independently of status descriptions.
  const badIconName = <WlIconButton icon="bell" count={3} countLabel="Three unread messages" />;
  // @ts-expect-error A help description does not name an icon-only action.
  const badDescriptionName = <WlIconButton icon="bell" aria-describedby="inbox-help" />;
  return [good, badSize, badListener, badModel, badProxy, badIconName, badDescriptionName];
}

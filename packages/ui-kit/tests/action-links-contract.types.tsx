import { WlButton, WlIconButton } from "../src";
import ActionLinksSfc from "./action-links-contract.vue";

const button = (
  <WlButton
    type="submit"
    form="settings"
    formaction="/save"
    formmethod="post"
    onClick={(event) => {
      const click: MouseEvent = event;
      void click;
    }}
  />
);
const href = <WlButton href="/guide.pdf" target="_blank" rel="noopener" download="guide.pdf" referrerpolicy="no-referrer" />;
const route = <WlButton to={{ name: "guide" }} target="_blank" />;
const explicit = <WlButton as="a" target="_blank" rel="noreferrer" />;
const icon = <WlIconButton ariaLabel="Guide" href="/guide.pdf" target="_blank" download />;
const iconRoute = <WlIconButton ariaLabel="Guide" to={{ name: "guide" }} rel="nofollow" />;
const iconButton = <WlIconButton ariaLabel="Save" form="settings" type="submit" />;
const oldProps: Partial<InstanceType<typeof WlButton>["$props"]> = { disabled: true, size: "md", type: "submit" };
const oldIconProps: Partial<InstanceType<typeof WlIconButton>["$props"]> = { ariaLabel: "Save", disabled: true, size: "sm" };
type OldButtonKeys = keyof InstanceType<typeof WlButton>["$props"];
const oldKey: OldButtonKeys = "type";
type OldIconButtonKeys = keyof InstanceType<typeof WlIconButton>["$props"];
const oldIconKey: OldIconButtonKeys = "type";
const oldIconType: InstanceType<typeof WlIconButton>["$props"]["type"] = "submit";
// @ts-expect-error target only applies while rendering an anchor.
const invalidButtonTarget = <WlButton target="_blank" />;
// @ts-expect-error explicit button rendering still has no link-only download attribute.
const invalidExplicitDownload = <WlButton as="button" download />;
// @ts-expect-error IconButton without a destination remains a native button.
const invalidIconDownload = <WlIconButton ariaLabel="Guide" download />;
// @ts-expect-error IconButton link rendering has no native button type.
const invalidIconLinkType = <WlIconButton href="/guide" ariaLabel="Guide" type="submit" />;
// @ts-expect-error form actions only apply to a native button.
const invalidLinkFormAction = <WlButton href="/guide" formaction="/submit" />;
// @ts-expect-error click payload remains a MouseEvent for routed actions.
const invalidClick = <WlButton to="/guide" onClick={(_: KeyboardEvent) => {}} />;
// @ts-expect-error IconButton keeps its click payload strict in anchor mode.
const invalidIconClick = <WlIconButton href="/guide" ariaLabel="Guide" onClick={(_: KeyboardEvent) => {}} />;
void [ActionLinksSfc, button, href, route, explicit, icon, iconRoute, iconButton, oldProps, oldIconProps,
  oldKey, oldIconKey, oldIconType, invalidButtonTarget, invalidExplicitDownload, invalidIconDownload,
  invalidIconLinkType, invalidLinkFormAction, invalidClick, invalidIconClick];

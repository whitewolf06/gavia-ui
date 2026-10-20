import type { WlAvatar, WlBadge, WlButton, WlDivider, WlPill, WlProgress, WlStatCard, WlTone } from "../src";

type ButtonProps = InstanceType<typeof WlButton>["$props"];
type BadgeProps = InstanceType<typeof WlBadge>["$props"];
type ProgressProps = InstanceType<typeof WlProgress>["$props"];

export function toneDataTypes(): void {
  const tone: WlTone = "danger";
  const button: ButtonProps = { tone, variant: "soft" };
  const legacyButton: ButtonProps = { variant: "soft-danger" };
  const badge: BadgeProps = { value: 150, max: 99, tone: "warning", ariaLabel: "Unread" };
  const progress: ProgressProps = { max: 50, value: 25, indeterminate: true, tone: "success" };
  const pill: InstanceType<typeof WlPill>["$props"] = { tone: "info", dot: true, pt: { root: { class: "local" } } };
  const avatar: InstanceType<typeof WlAvatar>["$props"] = { name: "Ada Lovelace", shape: "square" };
  const stat: InstanceType<typeof WlStatCard>["$props"] = { value: 1234, numberFormat: { maximumFractionDigits: 1 }, delta: "+5%", tone: "warning" };
  const divider: InstanceType<typeof WlDivider>["$props"] = { orientation: "vertical" };
  // @ts-expect-error Tone has a normalized vocabulary; old aliases remain on variant only.
  const invalidTone: ButtonProps = { tone: "err" };
  // @ts-expect-error Count caps are numeric.
  const invalidMax: BadgeProps = { max: "99" };
  void [button, legacyButton, badge, progress, pill, avatar, stat, divider, invalidTone, invalidMax];
}

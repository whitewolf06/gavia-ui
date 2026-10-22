import type { WlAlert, WlAvatar, WlBadge, WlButton, WlDivider, WlPill, WlProgress, WlStatCard, WlTag, WlTagColor, WlTone } from "../src";

type ButtonProps = InstanceType<typeof WlButton>["$props"];
type BadgeProps = InstanceType<typeof WlBadge>["$props"];
type ProgressProps = InstanceType<typeof WlProgress>["$props"];

export function toneDataTypes(): void {
  const tone: WlTone = "danger";
  const button: ButtonProps = { tone, variant: "soft" };
  const tagColor: WlTagColor = "blue";
  const tag: InstanceType<typeof WlTag>["$props"] = { color: tagColor, tone: "info" };
  // @ts-expect-error Destructive status uses tone, not a combined appearance alias.
  const legacyButton: ButtonProps = { variant: "soft-danger" };
  // @ts-expect-error Badge status variants were removed in 1.0.
  const legacyBadge: BadgeProps = { variant: "warn" };
  // @ts-expect-error Notification status variants were removed in 1.0.
  const legacyAlert: InstanceType<typeof WlAlert>["$props"] = { variant: "ok" };
  // @ts-expect-error Pill status variants were removed in 1.0.
  const legacyPill: InstanceType<typeof WlPill>["$props"] = { variant: "info" };
  // @ts-expect-error Progress status variants were removed in 1.0.
  const legacyProgress: ProgressProps = { variant: "ok" };
  // @ts-expect-error Tag palette colors use color in 1.0.
  const legacyTag: InstanceType<typeof WlTag>["$props"] = { variant: "blue" };
  const badge: BadgeProps = { value: 150, max: 99, tone: "warning", ariaLabel: "Unread" };
  const progress: ProgressProps = { max: 50, value: 25, indeterminate: true, tone: "success" };
  const pill: InstanceType<typeof WlPill>["$props"] = { tone: "info", dot: true, pt: { root: { class: "local" } } };
  const avatar: InstanceType<typeof WlAvatar>["$props"] = { name: "Ada Lovelace", shape: "square" };
  const stat: InstanceType<typeof WlStatCard>["$props"] = { value: 1234, numberFormat: { maximumFractionDigits: 1 }, delta: "+5%", tone: "warning" };
  const divider: InstanceType<typeof WlDivider>["$props"] = { orientation: "vertical" };
  // @ts-expect-error Tone has a normalized vocabulary.
  const invalidTone: ButtonProps = { tone: "err" };
  // @ts-expect-error Count caps are numeric.
  const invalidMax: BadgeProps = { max: "99" };
  void [button, tag, legacyButton, legacyBadge, legacyAlert, legacyPill, legacyProgress, legacyTag,
    badge, progress, pill, avatar, stat, divider, invalidTone, invalidMax];
}

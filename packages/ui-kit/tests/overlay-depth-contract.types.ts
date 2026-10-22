import type { WlDialog, WlDrawer, WlPopover } from "../src";
import type { WlAnchoredOverlayOptions } from "../src/utils/anchoredOverlay";

type DialogProps = InstanceType<typeof WlDialog>["$props"];
type DrawerProps = InstanceType<typeof WlDrawer>["$props"];
type PopoverProps = InstanceType<typeof WlPopover>["$props"];

function contract(): void {
  const dialog: DialogProps = { size: "lg", fullscreen: "mobile", width: 500, initialFocus: ".title", dismissible: false };
  const drawer: DrawerProps = { size: "sm", width: "30rem", closable: false, onAfterLeave: () => {} };
  const popover: PopoverProps = { placement: "right", align: "end", trigger: "hover", arrow: true, dismissible: true };
  const dismissal: WlAnchoredOverlayOptions = { dismissible: () => false, closeOnEscape: () => true };
  // @ts-expect-error The old spelling was removed in 1.0.
  const legacy: WlAnchoredOverlayOptions = { dismissable: () => false };
  // @ts-expect-error Dialog exposes only the canonical dismissal prop.
  const legacyDialog: DialogProps = { dismissable: true };
  // @ts-expect-error Drawer exposes only the canonical dismissal prop.
  const legacyDrawer: DrawerProps = { dismissable: true };
  // @ts-expect-error Popover exposes only the canonical dismissal prop.
  const legacyPopover: PopoverProps = { dismissable: true };
  const positioned: WlAnchoredOverlayOptions = { placement: "top", align: () => "center", offset: 8, dismissible: false };
  // @ts-expect-error Unsupported size names are rejected.
  const wrongSize: DialogProps = { size: "huge" };
  // @ts-expect-error Fullscreen breakpoint is explicit, not an arbitrary string.
  const wrongFullscreen: DialogProps = { fullscreen: "desktop" };
  // @ts-expect-error Initial focus must resolve to an actual DOM element.
  const wrongFocus: DrawerProps = { initialFocus: () => "input" };
  // @ts-expect-error Placement remains a finite set.
  const wrongPlacement: PopoverProps = { placement: "diagonal" };
  void [
    dialog, drawer, popover, dismissal, legacy, legacyDialog, legacyDrawer,
    legacyPopover, positioned, wrongSize, wrongFullscreen, wrongFocus, wrongPlacement
  ];
}
void contract;

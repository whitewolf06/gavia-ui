import type {
  WlConfirmApi, WlConfirmOptions, WlDatePickerLocale, WlFilterBarExpose, WlFilterBarSlots,
  WlLocale, WlLocaleInput, WlPopoverExpose, WlResolvedLocale, WlToastApi, WlToastOptions
} from "../../src";
/** Compile-only public overlay, locale, service-routing and model-modifier assertions. */
import {
  normalizeWlLocale, useWlConfirm, useWlToast,
  type WlAlert, type WlAutocomplete, type WlColorPicker, type WlCommandPalette, type WlDatePicker,
  type WlDialog, type WlDrawer, type WlFilePicker, type WlFilterBar, type WlNumberInput,
  type WlPasswordInput, type WlPopover, type WlSidebar, type WlSpinner, type WlTable, type WlTag
} from "../../src";

type DialogProps = InstanceType<typeof WlDialog>["$props"];
type DrawerProps = InstanceType<typeof WlDrawer>["$props"];
type FilterProps = InstanceType<typeof WlFilterBar>["$props"];

export function overlayLocaleConsumerTypes(
  popover: InstanceType<typeof WlPopover>, filters: InstanceType<typeof WlFilterBar>
): void {
  const days = ["S", "M", "T", "W", "T", "F", "S"] as const;
  const input: WlLocaleInput = { dayNamesMin: days, chooseYear: "Choose year", customMessage: { text: "App" } };
  const calendar: WlDatePickerLocale = { dayNames: days, clear: "Clear" };
  const normalized: WlResolvedLocale = normalizeWlLocale(input);
  const knownText: string = normalized.chooseMonth;
  // The old minimal WlLocale literal remains accepted; new input arrays may be readonly.
  const legacyLocale: WlLocale = {
    firstDayOfWeek: 1, dayNamesMin: [...days], monthNames: [], accept: "OK", reject: "Cancel",
    chooseDate: "Date", prevMonth: "Previous", nextMonth: "Next"
  };
  legacyLocale.dayNamesMin.push("Legacy mutable locale constant");
  // A complete pre-localization resolved object does not require the new control labels.
  const legacyResolvedLocale: WlResolvedLocale = {
    ...legacyLocale, dayNames: [...days], dayNamesShort: [...days], monthNamesShort: [],
    today: "Today", clear: "Clear", chooseMonth: "Month", chooseYear: "Year",
    prevYear: "Previous year", nextYear: "Next year", prevDecade: "Previous decade",
    nextDecade: "Next decade", weekHeader: "Week"
  };
  const optionalControl: string | undefined = legacyResolvedLocale.close;
  const normalizedControl: string = normalizeWlLocale(undefined, legacyResolvedLocale).close;
  // Locale-derived defaults do not make a component's text overrides required.
  const localizedText: {
    alert: Pick<InstanceType<typeof WlAlert>["$props"], "closeLabel">;
    autocomplete: Pick<Parameters<typeof WlAutocomplete>[0], "dropdownLabel">;
    color: Pick<InstanceType<typeof WlColorPicker>["$props"], "paletteLabel" | "inputLabel">;
    commands: Pick<Parameters<typeof WlCommandPalette>[0], "placeholder" | "emptyText" | "loadingText" | "ariaLabel">;
    date: Pick<Parameters<typeof WlDatePicker>[0], "placeholder" | "startLabel" | "endLabel">;
    files: Pick<InstanceType<typeof WlFilePicker>["$props"], "chooseLabel">;
    filters: Pick<FilterProps, "ariaLabel" | "toggleLabel" | "panelTitle" | "clearLabel" | "applyLabel" | "closeLabel">;
    number: Pick<InstanceType<typeof WlNumberInput>["$props"], "decrementLabel" | "incrementLabel">;
    password: Pick<InstanceType<typeof WlPasswordInput>["$props"], "placeholder">;
    sidebar: Pick<Parameters<typeof WlSidebar>[0], "ariaLabel" | "pinLabel" | "unpinLabel">;
    spinner: Pick<InstanceType<typeof WlSpinner>["$props"], "label">;
    table: Pick<Parameters<typeof WlTable>[0], "emptyMessage">;
    tag: Pick<InstanceType<typeof WlTag>["$props"], "removeLabel">;
  } = {
    alert: {}, autocomplete: {}, color: {}, commands: {}, date: {}, files: {}, filters: {},
    number: {}, password: {}, sidebar: {}, spinner: {}, table: {}, tag: {}
  };
  const emptyActionLabel: typeof localizedText.alert = { closeLabel: "" };
  const omittedFileLabel: typeof localizedText.files = { chooseLabel: undefined };
  const customDateLabel: typeof localizedText.date = { startLabel: "From" };
  const customEmptyText: typeof localizedText.commands = { emptyText: "No matches" };
  // @ts-expect-error Localized text overrides remain strings, not booleans.
  const wrongSpinnerLabel: typeof localizedText.spinner = { label: false };
  // @ts-expect-error Table empty-state text does not accept numeric values.
  const wrongTableText: typeof localizedText.table = { emptyMessage: 0 };
  // @ts-expect-error Locale selection does not widen action labels to objects.
  const wrongApplyLabel: typeof localizedText.filters = { applyLabel: { text: "Apply" } };
  if (typeof input.customMessage === "object" && input.customMessage !== null)
    void input.customMessage;
  const exposedPopover: WlPopoverExpose = popover;
  const exposedFilters: WlFilterBarExpose = filters;
  exposedPopover.show(new MouseEvent("click"));
  exposedPopover.toggle();
  exposedPopover.hide(new KeyboardEvent("keydown", { key: "Escape" }));
  exposedFilters.open();
  exposedFilters.apply();
  const slots: WlFilterBarSlots = {
    default: ({ open, close, clear }) => {
      open();

      close();

      clear();
    },
    leading: (scope) => void scope,
    footer: ({ apply, clear, close }) => {
      apply();

      clear();

      close();
    }
  };
  const confirmation: WlConfirmApi = useWlConfirm();
  const confirmOptions: WlConfirmOptions = { message: "Proceed?", group: "workspace", accept: () => {} };
  confirmation.confirm(confirmOptions);
  confirmation.close();
  confirmation.closeGroup("workspace");
  confirmation.closeGroup(undefined);
  const toastOptions: WlToastOptions = { group: "workspace" };
  const scopedToast: WlToastApi = useWlToast(toastOptions);
  useWlToast().ok("Saved");
  scopedToast.info("Ready", "Details");
  scopedToast.clear();
  const dialog: DialogProps = { visible: true, visibleModifiers: {} };
  const drawer: DrawerProps = { visible: false, visibleModifiers: {} };
  const bar: FilterProps = { open: true, openModifiers: {} };

  // @ts-expect-error Known locale messages reject non-text values.
  const wrongLocale: WlLocaleInput = { chooseMonth: false };
  // @ts-expect-error Popover anchor input is a DOM Event, not an arbitrary target-shaped object.
  exposedPopover.show({ target: document.body });
  // @ts-expect-error Filters expose no-argument actions rather than a boolean setter.
  exposedFilters.open(true);
  // @ts-expect-error The group name remains a string.
  const wrongGroup: WlConfirmOptions = { message: "Proceed?", group: 7 };
  // @ts-expect-error Explicit group selection prevents accidental event-object routing.
  confirmation.closeGroup(new MouseEvent("click"));
  // @ts-expect-error No-payload dialog models do not support text conversion modifiers.
  const trimmedDialog: DialogProps = { visibleModifiers: { trim: true } };
  // @ts-expect-error Boolean drawer models cannot support numeric conversion.
  const numberedDrawer: DrawerProps = { visibleModifiers: { number: true } };
  // @ts-expect-error Filter-bar visibility is not an input event's lazy model.
  const lazyBar: FilterProps = { openModifiers: { lazy: true } };

  void [input, calendar, knownText, legacyLocale, legacyResolvedLocale, optionalControl, normalizedControl, localizedText,
    emptyActionLabel, omittedFileLabel, customDateLabel, customEmptyText,
    wrongSpinnerLabel, wrongTableText, wrongApplyLabel, slots, dialog, drawer, bar,
    wrongLocale, wrongGroup, trimmedDialog, numberedDrawer, lazyBar];
}

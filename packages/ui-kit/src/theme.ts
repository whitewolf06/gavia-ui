import { deepMerge } from "./utils/merge";

export interface WlPtCallbackOptions {
  context: {
    checked?: boolean;
    indeterminate?: boolean;
    selected?: boolean;
    inRange?: boolean;
    focused?: boolean;
    disabled?: boolean;
    active?: boolean;
    today?: boolean;
    otherMonth?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export type WlPtSection =
  | Record<string, unknown>
  | ((options: WlPtCallbackOptions) => Record<string, unknown>);

export type WlPtConfig = Record<string, Record<string, WlPtSection>>;

const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(" ");

/**
 * Default DOM section attributes of the kit.
 *
 * Wire it once at the app level:
 *   app.use(WlConfig, { pt: createWlPt() })
 *
 * `overrides` is deep-merged on top of the defaults. Component-level `pt`
 * attributes are applied by Gavia UI after app-level attributes.
 */
export function createWlPt(overrides: Record<string, unknown> = {}): WlPtConfig {
  const base: WlPtConfig = {
    checkbox: {
      input: { class: "wl-check-input" },
      box: (o) => ({
        class: cx(
          "wl-checkbox__box",
          o.context.checked && "is-checked",
          o.context.indeterminate && "is-indeterminate"
        )
      }),
      icon: { class: "wl-checkbox__icon" }
    },
    radiobutton: {
      input: { class: "wl-check-input" },
      box: (o) => ({ class: cx("wl-radio__box", o.context.checked && "is-checked") }),
      icon: { class: "wl-radio__icon" }
    },
    toggleswitch: {
      input: { class: "wl-check-input" },
      slider: (o) => ({ class: cx("wl-switch__slider", o.context.checked && "is-checked") }),
      handle: { class: "wl-switch__handle" }
    },
    select: {
      label: { class: "wl-select__label" },
      clearIcon: { class: "wl-select__clear" },
      dropdown: { class: "wl-select__dropdown" },
      dropdownIcon: { class: "wl-select__dropdown-icon" },
      overlay: { class: "wl-overlay wl-select-overlay" },
      listContainer: { class: "wl-select__list-container" },
      list: { class: "wl-select__list" },
      option: { class: "wl-select__option" },
      optionLabel: { class: "wl-select__option-label" },
      emptyMessage: { class: "wl-select__empty" }
    },
    multiselect: {
      labelContainer: { class: "wl-multiselect__label-container" },
      label: { class: "wl-multiselect__label" },
      clearIcon: { class: "wl-multiselect__clear" },
      chipItem: { class: "wl-multiselect__chip-item" },
      pcChip: {
        root: { class: "wl-multiselect__chip" },
        label: { class: "wl-multiselect__chip-label" },
        removeIcon: { class: "wl-multiselect__chip-remove" }
      },
      dropdown: { class: "wl-multiselect__dropdown" },
      dropdownIcon: { class: "wl-multiselect__dropdown-icon" },
      overlay: { class: "wl-overlay wl-multiselect-overlay" },
      header: { class: "wl-multiselect__header" },
      pcFilter: { root: { class: "wl-input wl-input--sm wl-multiselect__filter" } },
      filterIcon: { class: "wl-multiselect__filter-icon" },
      listContainer: { class: "wl-select__list-container" },
      list: { class: "wl-select__list" },
      option: { class: "wl-select__option" },
      optionLabel: { class: "wl-select__option-label" },
      emptyMessage: { class: "wl-select__empty" }
    },
    autocomplete: {
      inputMultiple: { class: "wl-autocomplete__multiple" },
      chipItem: { class: "wl-multiselect__chip-item" },
      pcChip: {
        root: { class: "wl-multiselect__chip" },
        label: { class: "wl-multiselect__chip-label" },
        removeIcon: { class: "wl-multiselect__chip-remove" }
      },
      input: { class: "wl-autocomplete__inner-input" },
      inputChip: { class: "wl-autocomplete__inner-input" },
      dropdown: { class: "wl-btn wl-autocomplete__dropdown" },
      dropdownIcon: { class: "wl-autocomplete__dropdown-icon" },
      overlay: { class: "wl-overlay wl-autocomplete-overlay" },
      listContainer: { class: "wl-select__list-container" },
      list: { class: "wl-select__list" },
      option: { class: "wl-select__option" },
      emptyMessage: { class: "wl-select__empty" }
    },
    card: {
      header: { class: "wl-card__header" },
      body: { class: "wl-card__body" },
      caption: { class: "wl-card__caption" },
      title: { class: "wl-card__title" },
      subtitle: { class: "wl-card__subtitle" },
      content: { class: "wl-card__content" },
      footer: { class: "wl-card__footer" }
    },
    dialog: {
      mask: { class: "wl-mask wl-dialog-mask" },
      header: { class: "wl-dialog__header" },
      title: { class: "wl-dialog__title" },
      headerActions: { class: "wl-dialog__actions" },
      content: { class: "wl-dialog__content" },
      footer: { class: "wl-dialog__footer" },
      pcCloseButton: {
        root: { class: "wl-overlay-close" },
        icon: { class: "wl-overlay-close__icon" }
      }
    },
    confirmdialog: {
      mask: { class: "wl-mask wl-dialog-mask" },
      header: { class: "wl-dialog__header" },
      title: { class: "wl-dialog__title" },
      content: { class: "wl-dialog__content wl-confirm__content" },
      icon: { class: "wl-confirm__icon" },
      message: { class: "wl-confirm__message" },
      footer: { class: "wl-dialog__footer" }
    },
    drawer: {
      mask: { class: "wl-mask wl-drawer-mask" },
      header: { class: "wl-drawer__header" },
      title: { class: "wl-drawer__title" },
      content: { class: "wl-drawer__content" },
      footer: { class: "wl-drawer__footer" },
      pcCloseButton: {
        root: { class: "wl-overlay-close" },
        icon: { class: "wl-overlay-close__icon" }
      }
    },
    progressbar: {
      value: { class: "wl-progress__value" },
      label: { class: "wl-progress__label" }
    },
    avatar: {
      label: { class: "wl-avatar__label" },
      image: { class: "wl-avatar__img" }
    },
    tag: {
      label: { class: "wl-tag__label" }
    },
    divider: {
      content: { class: "wl-divider__content" }
    },
    tablist: {
      content: { class: "wl-tabs__content" },
      tabList: { class: "wl-tabs__list" },
      activeBar: { class: "wl-tabs__active-bar" }
    },
    tabpanels: {
      root: { class: "wl-tabs__panels" }
    },
    tabpanel: {
      root: { class: "wl-tabs__panel" }
    },
    tooltip: {
      root: { class: "wl-tooltip" },
      text: { class: "wl-tooltip__text" },
      arrow: { class: "wl-tooltip__arrow" }
    },
    selectbutton: {
      pcToggleButton: {
        root: (o: WlPtCallbackOptions) => ({
          class: cx("wl-segmented__item", o.context.active && "is-active")
        }),
        content: { class: "wl-segmented__item-content" }
      }
    },
    breadcrumb: {
      list: { class: "wl-breadcrumbs__list" },
      item: { class: "wl-breadcrumbs__item" },
      separator: { class: "wl-breadcrumbs__separator" }
    },
    menu: {
      list: { class: "wl-menu__list" },
      submenuLabel: { class: "wl-menu__head" },
      item: { class: "wl-menu__item" },
      itemContent: { class: "wl-menu__item-content" },
      itemLink: { class: "wl-menu__link" },
      separator: { class: "wl-menu__sep" }
    },
    popover: {
      content: { class: "wl-popover__content" }
    },
    toast: {
      message: { class: "wl-toast__message" },
      messageContent: { class: "wl-toast__content" },
      messageIcon: { class: "wl-toast__icon" },
      messageText: { class: "wl-toast__text" },
      summary: { class: "wl-toast__summary" },
      detail: { class: "wl-toast__detail" },
      closeButton: { class: "wl-toast__close" },
      closeIcon: { class: "wl-toast__close-icon" }
    },
    datatable: {
      table: { class: "wl-table__table" },
      thead: { class: "wl-table__head" },
      tbody: { class: "wl-table__body" },
      bodyRow: { class: "wl-table__row" },
      emptyMessage: { class: "wl-table__empty" },
      emptyMessageCell: { class: "wl-table__empty-cell" },
      mask: { class: "wl-table__mask" },
      loadingIcon: { class: "wl-table__loading" }
    },
    datepicker: {
      startLabel: { class: "wl-dp__endpoint-label" },
      endLabel: { class: "wl-dp__endpoint-label" },
      endInput: { class: "wl-input wl-dp__input" },
      rangeHint: { class: "wl-dp__range-hint" },
      dropdown: { class: "wl-dp__trigger" },
      dropdownIcon: { class: "wl-dp__trigger-icon" },
      panel: { class: "wl-overlay wl-dp__panel" },
      calendarContainer: { class: "wl-dp__container" },
      calendar: { class: "wl-dp__calendar" },
      header: { class: "wl-dp__header" },
      title: { class: "wl-dp__title" },
      selectMonth: { class: "wl-dp__view-btn" },
      selectYear: { class: "wl-dp__view-btn" },
      pcPrevButton: {
        root: { class: "wl-dp__nav" },
        icon: { class: "wl-dp__nav-icon" }
      },
      pcNextButton: {
        root: { class: "wl-dp__nav" },
        icon: { class: "wl-dp__nav-icon" }
      },
      dayView: { class: "wl-dp__table" },
      monthView: { class: "wl-dp__choices" },
      month: { class: "wl-dp__choice" },
      yearView: { class: "wl-dp__choices" },
      year: { class: "wl-dp__choice" },
      tableHeaderCell: { class: "wl-dp__wd-cell" },
      weekDay: { class: "wl-dp__weekday" },
      dayCell: { class: "wl-dp__day-cell" },
      day: (o) => ({
        class: cx(
          "wl-dp__day",
          o.context.selected && "is-selected",
          o.context.inRange && "is-in-range",
          o.context.today && "is-today",
          o.context.otherMonth && "is-muted",
          o.context.disabled && "is-disabled"
        )
      })
    }
  };

  return deepMerge(base as Record<string, unknown>, overrides) as unknown as WlPtConfig;
}

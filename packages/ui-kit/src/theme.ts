import { deepMerge } from "./utils/merge";

export interface WlPtCallbackOptions {
  context: {
    checked?: boolean;
    indeterminate?: boolean;
    selected?: boolean;
    focused?: boolean;
    disabled?: boolean;
    active?: boolean;
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
 * Default PrimeVue pass-through map of the kit.
 *
 * Wire it once at the app level:
 *   app.use(PrimeVue, { unstyled: true, pt: createWlPt() })
 *
 * `overrides` is deep-merged on top of the defaults, and a component-level
 * `pt` prop is merged by PrimeVue itself after both.
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
    }
  };

  return deepMerge(base as Record<string, unknown>, overrides) as unknown as WlPtConfig;
}

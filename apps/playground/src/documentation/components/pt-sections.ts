import type { DocumentationPtSection } from "../catalog";
import { localizeDocumentation } from "../localize";

/** Canonical public DOM sections for the 1.0 pass-through contract. */
export const documentationPtSections: Readonly<Record<string, readonly DocumentationPtSection[]>> = localizeDocumentation({
  WlAccordion: [
    {
      name: "root",
      element: "div.wl-acc",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "item",
      element: "details.wl-acc__item",
      description: "documentation.strings.ptReviewItem"
    },
    {
      name: "header",
      element: "summary.wl-acc__summary",
      description: "documentation.strings.ptReviewHeader"
    },
    {
      name: "content",
      element: "div.wl-acc__body",
      description: "documentation.strings.ptReviewContent"
    }
  ],
  WlAlert: [
    {
      name: "root",
      element: "div.wl-alert",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "icon",
      element: "span.wl-alert__icon",
      description: "documentation.strings.ptReviewIcon"
    },
    {
      name: "body",
      element: "div.wl-alert__body",
      description: "documentation.strings.ptReviewBody"
    },
    {
      name: "title",
      element: "div.wl-alert__title",
      description: "documentation.strings.ptReviewTitle"
    },
    {
      name: "text",
      element: "div.wl-alert__text",
      description: "documentation.strings.ptReviewText"
    },
    {
      name: "action",
      element: "div.wl-alert__action",
      description: "documentation.strings.ptReviewAction"
    },
    {
      name: "closeButton",
      element: "button.wl-alert__close",
      description: "documentation.strings.ptReviewCloseButton"
    },
    {
      name: "closeIcon",
      element: "span",
      description: "documentation.strings.ptReviewCloseIcon"
    }
  ],
  WlAutocomplete: [
    {
      name: "root",
      element: "div.wl-autocomplete",
      description: "documentation.strings.s0323"
    },
    {
      name: "inputMultiple",
      element: "div.wl-autocomplete__multiple",
      description: "documentation.strings.s0324"
    },
    {
      name: "chipItem",
      element: "span.wl-multiselect__chip",
      description: "documentation.strings.s0325"
    },
    {
      name: "chip.root",
      element: "span.wl-multiselect__chip",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "chip.label",
      element: "span.wl-multiselect__chip-label",
      description: "documentation.strings.ptReviewLabel"
    },
    {
      name: "chip.removeIcon",
      element: "button.wl-multiselect__chip-remove",
      description: "documentation.strings.ptReviewRemoveButton"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.s0329"
    },
    {
      name: "inputChip",
      element: "input",
      description: "documentation.strings.s0330"
    },
    {
      name: "inputText.root",
      element: "input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "clearButton",
      element: "button.wl-autocomplete__clear",
      description: "documentation.strings.ptReviewClearButton"
    },
    {
      name: "dropdown",
      element: "button.wl-autocomplete__dropdown",
      description: "documentation.strings.s0332"
    },
    {
      name: "dropdownIcon",
      element: "span.wl-autocomplete__dropdown-icon",
      description: "documentation.strings.s0333"
    },
    {
      name: "overlay",
      element: "div.wl-overlay",
      description: "documentation.strings.s0334"
    },
    {
      name: "listContainer",
      element: "div.wl-select__list-container",
      description: "documentation.strings.s0335"
    },
    {
      name: "loadingMessage",
      element: "div.wl-select__empty",
      description: "documentation.strings.ptReviewLoadingMessage"
    },
    {
      name: "option",
      element: "div.wl-select__option",
      description: "documentation.strings.s0337"
    },
    {
      name: "emptyMessage",
      element: "div.wl-select__empty",
      description: "documentation.strings.s0338"
    },
    {
      name: "list",
      element: "ul",
      description: "documentation.strings.s0336"
    }
  ],
  WlAvatar: [
    {
      name: "root",
      element: "span",
      description: "documentation.strings.s0339"
    },
    {
      name: "image",
      element: "img.wl-avatar__img",
      description: "documentation.strings.s0340"
    },
    {
      name: "label",
      element: "span",
      description: "documentation.strings.s0341"
    }
  ],
  WlBadge: [
    {
      name: "root",
      element: "span",
      description: "documentation.strings.s0342"
    }
  ],
  WlBreadcrumbs: [
    {
      name: "root",
      element: "nav.wl-breadcrumbs",
      description: "documentation.strings.s0343"
    },
    {
      name: "list",
      element: "ol.wl-breadcrumbs__list",
      description: "documentation.strings.s0344"
    },
    {
      name: "item",
      element: "li.wl-breadcrumbs__item",
      description: "documentation.strings.s0345"
    },
    {
      name: "collapseButton",
      element: "button.wl-breadcrumbs__collapse",
      description: "documentation.strings.ptReviewCollapseButton"
    },
    {
      name: "separator",
      element: "span.wl-breadcrumbs__sep",
      description: "documentation.strings.s0346"
    }
  ],
  WlButton: [
    {
      name: "root",
      element: "button / a",
      description: "documentation.strings.s0347"
    },
    {
      name: "loadingIcon",
      element: "span.wl-btn__spinner",
      description: "documentation.strings.s0348"
    },
    {
      name: "label",
      element: "span.wl-btn__label",
      description: "documentation.strings.s0349"
    }
  ],
  WlCalendar: [
    {
      name: "root",
      element: "div.wl-cal",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "header",
      element: "div.wl-cal__head",
      description: "documentation.strings.ptReviewHeader"
    },
    {
      name: "prevButton",
      element: "button.wl-cal__nav",
      description: "documentation.strings.ptReviewPrevButton"
    },
    {
      name: "title",
      element: "span.wl-cal__title",
      description: "documentation.strings.ptReviewTitle"
    },
    {
      name: "nextButton",
      element: "button.wl-cal__nav",
      description: "documentation.strings.ptReviewNextButton"
    },
    {
      name: "body",
      element: "div.wl-cal__body",
      description: "documentation.strings.ptReviewBody"
    },
    {
      name: "week",
      element: "div.wl-cal__week",
      description: "documentation.strings.ptReviewWeek"
    },
    {
      name: "weekday",
      element: "span.wl-cal__wd",
      description: "documentation.strings.ptReviewWeekday"
    },
    {
      name: "grid",
      element: "div.wl-cal__grid",
      description: "documentation.strings.ptReviewGrid"
    },
    {
      name: "row",
      element: "div.wl-cal__row",
      description: "documentation.strings.ptReviewRow"
    },
    {
      name: "day",
      element: "button.wl-cal__day",
      description: "documentation.strings.ptReviewDay"
    },
    {
      name: "dayNumber",
      element: "span.wl-cal__dnum",
      description: "documentation.strings.ptReviewDayNumber"
    },
    {
      name: "event",
      element: "span.wl-cal__ev",
      description: "documentation.strings.ptReviewEvent"
    }
  ],
  WlCard: [
    {
      name: "root",
      element: "button / a",
      description: "documentation.strings.s0350"
    },
    {
      name: "header",
      element: "div.wl-card__header",
      description: "documentation.strings.s0351"
    },
    {
      name: "body",
      element: "div.wl-card__body",
      description: "documentation.strings.s0352"
    },
    {
      name: "caption",
      element: "div.wl-card__caption",
      description: "documentation.strings.s0353"
    },
    {
      name: "title",
      element: "div.wl-card__title",
      description: "documentation.strings.s0354"
    },
    {
      name: "subtitle",
      element: "div.wl-card__subtitle",
      description: "documentation.strings.s0355"
    },
    {
      name: "content",
      element: "div.wl-card__content",
      description: "documentation.strings.s0356"
    },
    {
      name: "footer",
      element: "div.wl-card__footer",
      description: "documentation.strings.s0357"
    }
  ],
  WlCheckbox: [
    {
      name: "box",
      element: "span.wl-checkbox__box",
      description: "documentation.strings.s0359"
    },
    {
      name: "icon",
      element: "span.wl-checkbox__icon",
      description: "documentation.strings.s0360"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.s0358"
    }
  ],
  WlCheckboxGroup: [
    {
      name: "root",
      element: "fieldset.wl-choice-group",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "legend",
      element: "legend.wl-choice-group__legend",
      description: "documentation.strings.ptReviewLegend"
    },
    {
      name: "options",
      element: "div.wl-choice-group__options",
      description: "documentation.strings.ptReviewOptions"
    },
    {
      name: "option",
      element: "label.wl-checkline",
      description: "documentation.strings.ptReviewOption"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.ptReviewInput"
    }
  ],
  WlChip: [
    {
      name: "root",
      element: "button / a.wl-chip",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "action",
      element: "button / a.wl-chip__action",
      description: "documentation.strings.ptReviewAction"
    },
    {
      name: "label",
      element: "span.wl-chip__label",
      description: "documentation.strings.ptReviewLabel"
    },
    {
      name: "count",
      element: "span.wl-chip__count",
      description: "documentation.strings.ptReviewCount"
    },
    {
      name: "removeButton",
      element: "button.wl-chip__remove",
      description: "documentation.strings.ptReviewRemoveButton"
    },
    {
      name: "removeIcon",
      element: "span",
      description: "documentation.strings.ptReviewRemoveIcon"
    }
  ],
  WlColorPicker: [
    {
      name: "root",
      element: "div.wl-color-picker",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "grid",
      element: "div.wl-color-picker__grid",
      description: "documentation.strings.ptReviewGrid"
    },
    {
      name: "swatch",
      element: "button.wl-color-picker__sw",
      description: "documentation.strings.ptReviewSwatch"
    },
    {
      name: "controls",
      element: "div.wl-color-picker__controls",
      description: "documentation.strings.ptReviewControls"
    },
    {
      name: "channel",
      element: "label.wl-color-picker__channel",
      description: "documentation.strings.ptReviewChannel"
    },
    {
      name: "channelLabel",
      element: "span",
      description: "documentation.strings.ptReviewChannelLabel"
    },
    {
      name: "channelInput",
      element: "input.wl-color-picker__channel-input",
      description: "documentation.strings.ptReviewChannelInput"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.ptReviewInput"
    }
  ],
  WlCommandPalette: [
    {
      name: "root",
      element: "div.wl-command-palette",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "panel",
      element: "div.wl-command-palette__panel",
      description: "documentation.strings.ptReviewPanel"
    },
    {
      name: "input",
      element: "input.wl-command-palette__input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "list",
      element: "div.wl-command-palette__list",
      description: "documentation.strings.ptReviewList"
    },
    {
      name: "group",
      element: "section.wl-command-palette__group",
      description: "documentation.strings.ptReviewGroup"
    },
    {
      name: "groupLabel",
      element: "div.wl-command-palette__group-label",
      description: "documentation.strings.ptReviewGroupLabel"
    },
    {
      name: "item",
      element: "button / a.wl-command-palette__item",
      description: "documentation.strings.ptReviewItem"
    },
    {
      name: "itemIcon",
      element: "span.wl-command-palette__item-icon",
      description: "documentation.strings.ptReviewItemIcon"
    },
    {
      name: "status",
      element: "div.wl-command-palette__status",
      description: "documentation.strings.ptReviewStatus"
    },
    {
      name: "footer",
      element: "div.wl-command-palette__footer",
      description: "documentation.strings.ptReviewFooter"
    }
  ],
  WlConfirmDialog: [
    {
      name: "content",
      element: "div.wl-confirm__content",
      description: "documentation.strings.s0361"
    },
    {
      name: "icon",
      element: "span.wl-confirm__icon",
      description: "documentation.strings.s0362"
    },
    {
      name: "message",
      element: "span.wl-confirm__message",
      description: "documentation.strings.s0363"
    }
  ],
  WlContextMenu: [
    {
      name: "root",
      element: "div.wl-context-menu",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "menuPt.root",
      element: "div.wl-menu",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "menuPt.list",
      element: "ul.wl-menu__list",
      description: "documentation.strings.ptReviewList"
    },
    {
      name: "menuPt.item",
      element: "li.wl-menu__item",
      description: "documentation.strings.ptReviewItem"
    },
    {
      name: "menuPt.submenuLabel",
      element: "div.wl-menu__head",
      description: "documentation.strings.ptReviewSubmenuLabel"
    },
    {
      name: "menuPt.separator",
      element: "div.wl-menu__sep",
      description: "documentation.strings.ptReviewSeparator"
    },
    {
      name: "menuPt.itemContent",
      element: "div.wl-menu__item-content",
      description: "documentation.strings.ptReviewItemContent"
    },
    {
      name: "menuPt.itemLink",
      element: "button / a.wl-menu__link",
      description: "documentation.strings.ptReviewItemLink"
    },
    {
      name: "menuPt.checkIcon",
      element: "span.wl-menu__check",
      description: "documentation.strings.ptReviewCheckIcon"
    },
    {
      name: "menuPt.submenuIcon",
      element: "span.wl-menu__submenu-icon",
      description: "documentation.strings.ptReviewSubmenuIcon"
    }
  ],
  WlDatePicker: [
    {
      name: "root",
      element: "div.wl-dp",
      description: "documentation.strings.s0364"
    },
    {
      name: "startLabel",
      element: "span.wl-dp__endpoint-label",
      description: "documentation.strings.s0389"
    },
    {
      name: "inputText.root",
      element: "input.wl-input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "endLabel",
      element: "span.wl-dp__endpoint-label",
      description: "documentation.strings.s0391"
    },
    {
      name: "endInput",
      element: "input.wl-input",
      description: "documentation.strings.s0393"
    },
    {
      name: "dropdown",
      element: "button.wl-dp__trigger",
      description: "documentation.strings.s0366"
    },
    {
      name: "dropdownIcon",
      element: "span.wl-dp__trigger-icon",
      description: "documentation.strings.s0367"
    },
    {
      name: "panel",
      element: "div.wl-overlay",
      description: "documentation.strings.s0368"
    },
    {
      name: "presets",
      element: "div.wl-dp__presets",
      description: "documentation.strings.ptReviewPresets"
    },
    {
      name: "preset",
      element: "button.wl-dp__preset",
      description: "documentation.strings.ptReviewPreset"
    },
    {
      name: "calendarContainer",
      element: "div.wl-dp__container",
      description: "documentation.strings.s0369"
    },
    {
      name: "calendar",
      element: "div.wl-dp__calendar",
      description: "documentation.strings.s0370"
    },
    {
      name: "header",
      element: "div.wl-dp__header",
      description: "documentation.strings.s0371"
    },
    {
      name: "prevButton.root",
      element: "button.wl-dp__nav",
      description: "documentation.strings.ptReviewPrevButton"
    },
    {
      name: "prevButton.icon",
      element: "span",
      description: "documentation.strings.ptReviewIcon"
    },
    {
      name: "title",
      element: "div.wl-dp__title",
      description: "documentation.strings.s0374"
    },
    {
      name: "selectMonth",
      element: "button.wl-dp__view-btn",
      description: "documentation.strings.s0375"
    },
    {
      name: "selectYear",
      element: "button.wl-dp__view-btn",
      description: "documentation.strings.s0376"
    },
    {
      name: "nextButton.root",
      element: "button.wl-dp__nav",
      description: "documentation.strings.ptReviewNextButton"
    },
    {
      name: "nextButton.icon",
      element: "span",
      description: "documentation.strings.ptReviewIcon"
    },
    {
      name: "rangeHint",
      element: "p.wl-dp__range-hint",
      description: "documentation.strings.s0395"
    },
    {
      name: "dayView",
      element: "table.wl-dp__table",
      description: "documentation.strings.s0379"
    },
    {
      name: "tableHeaderCell",
      element: "th.wl-dp__wd-cell",
      description: "documentation.strings.s0380"
    },
    {
      name: "weekDay",
      element: "span.wl-dp__weekday",
      description: "documentation.strings.s0381"
    },
    {
      name: "dayCell",
      element: "td.wl-dp__day-cell",
      description: "documentation.strings.s0382"
    },
    {
      name: "day",
      element: "button.wl-dp__day",
      description: "documentation.strings.s0383"
    },
    {
      name: "monthView",
      element: "div.wl-dp__choices",
      description: "documentation.strings.s0384"
    },
    {
      name: "month",
      element: "button.wl-dp__choice",
      description: "documentation.strings.s0385"
    },
    {
      name: "yearView",
      element: "div.wl-dp__choices",
      description: "documentation.strings.s0386"
    },
    {
      name: "year",
      element: "button.wl-dp__choice",
      description: "documentation.strings.s0387"
    }
  ],
  WlDialog: [
    {
      name: "mask",
      element: "div.wl-dialog-mask",
      description: "documentation.strings.s0396"
    },
    {
      name: "root",
      element: "section.wl-dialog",
      description: "documentation.strings.s0397"
    },
    {
      name: "header",
      element: "header.wl-dialog__header",
      description: "documentation.strings.s0398"
    },
    {
      name: "title",
      element: "span.wl-dialog__title",
      description: "documentation.strings.s0399"
    },
    {
      name: "headerActions",
      element: "div.wl-dialog__actions",
      description: "documentation.strings.s0400"
    },
    {
      name: "closeButton.root",
      element: "button.wl-overlay-close",
      description: "documentation.strings.ptReviewCloseButton"
    },
    {
      name: "closeButton.icon",
      element: "span",
      description: "documentation.strings.ptReviewCloseIcon"
    },
    {
      name: "content",
      element: "div.wl-dialog__content",
      description: "documentation.strings.s0403"
    },
    {
      name: "footer",
      element: "footer.wl-dialog__footer",
      description: "documentation.strings.s0404"
    }
  ],
  WlDivider: [
    {
      name: "root",
      element: "div",
      description: "documentation.strings.s0405"
    },
    {
      name: "content",
      element: "span",
      description: "documentation.strings.s0406"
    }
  ],
  WlDrawer: [
    {
      name: "mask",
      element: "div.wl-drawer-mask",
      description: "documentation.strings.s0407"
    },
    {
      name: "root",
      element: "aside.wl-drawer",
      description: "documentation.strings.s0408"
    },
    {
      name: "header",
      element: "header.wl-drawer__header",
      description: "documentation.strings.s0409"
    },
    {
      name: "title",
      element: "span.wl-drawer__title",
      description: "documentation.strings.s0410"
    },
    {
      name: "closeButton.root",
      element: "button.wl-overlay-close",
      description: "documentation.strings.ptReviewCloseButton"
    },
    {
      name: "closeButton.icon",
      element: "span",
      description: "documentation.strings.ptReviewCloseIcon"
    },
    {
      name: "content",
      element: "div.wl-drawer__content",
      description: "documentation.strings.s0413"
    },
    {
      name: "footer",
      element: "footer.wl-drawer__footer",
      description: "documentation.strings.s0414"
    }
  ],
  WlField: [
    {
      name: "root",
      element: "div.wl-field",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "label",
      element: "label.wl-field__label",
      description: "documentation.strings.ptReviewLabel"
    },
    {
      name: "required",
      element: "span.wl-field__req",
      description: "documentation.strings.ptReviewRequired"
    },
    {
      name: "hint",
      element: "span.wl-field__hint",
      description: "documentation.strings.ptReviewHint"
    },
    {
      name: "error",
      element: "span.wl-field__err",
      description: "documentation.strings.ptReviewError"
    }
  ],
  WlFilePicker: [
    {
      name: "root",
      element: "div.wl-file-picker",
      description: "documentation.strings.s0415"
    },
    {
      name: "trigger",
      element: "button",
      description: "documentation.strings.s0416"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.s0417"
    }
  ],
  WlFileUpload: [
    {
      name: "root",
      element: "div.wl-upload",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "drop",
      element: "div.wl-upload__drop",
      description: "documentation.strings.ptReviewDrop"
    },
    {
      name: "input",
      element: "input.wl-upload__input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "errors",
      element: "ul.wl-upload__errors",
      description: "documentation.strings.ptReviewErrors"
    },
    {
      name: "list",
      element: "ul.wl-upload__list",
      description: "documentation.strings.ptReviewList"
    },
    {
      name: "row",
      element: "li.wl-upload__row",
      description: "documentation.strings.ptReviewRow"
    },
    {
      name: "preview",
      element: "img.wl-upload__preview",
      description: "documentation.strings.ptReviewPreview"
    },
    {
      name: "progress",
      element: "progress.wl-upload__progress",
      description: "documentation.strings.ptReviewProgress"
    },
    {
      name: "removeButton",
      element: "button.wl-upload__remove",
      description: "documentation.strings.ptReviewRemoveButton"
    }
  ],
  WlFilterBar: [
    {
      name: "root",
      element: "section.wl-filter-bar",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "mobileToggle",
      element: "div.wl-filter-bar__mobile-toggle",
      description: "documentation.strings.ptReviewMobileToggle"
    },
    {
      name: "panel",
      element: "div.wl-filter-bar__panel",
      description: "documentation.strings.ptReviewPanel"
    },
    {
      name: "mobileHead",
      element: "div.wl-filter-bar__mobile-head",
      description: "documentation.strings.ptReviewMobileHead"
    },
    {
      name: "title",
      element: "strong.wl-filter-bar__title",
      description: "documentation.strings.ptReviewTitle"
    },
    {
      name: "closeButton",
      element: "button",
      description: "documentation.strings.ptReviewCloseButton"
    },
    {
      name: "toolbar",
      element: "div.wl-filter-bar__toolbar",
      description: "documentation.strings.ptReviewToolbar"
    },
    {
      name: "leading",
      element: "div.wl-filter-bar__leading",
      description: "documentation.strings.ptReviewLeading"
    },
    {
      name: "controls",
      element: "div.wl-filter-bar__controls",
      description: "documentation.strings.ptReviewControls"
    },
    {
      name: "actions",
      element: "div.wl-filter-bar__actions",
      description: "documentation.strings.ptReviewActions"
    },
    {
      name: "footer",
      element: "div.wl-filter-bar__footer",
      description: "documentation.strings.ptReviewFooter"
    },
    {
      name: "summary",
      element: "div.wl-filter-bar__summary",
      description: "documentation.strings.ptReviewSummary"
    },
    {
      name: "backdrop",
      element: "button.wl-filter-bar__backdrop",
      description: "documentation.strings.ptReviewBackdrop"
    }
  ],
  WlIconButton: [
    {
      name: "loadingIcon",
      element: "span.wl-btn__spinner",
      description: "documentation.strings.ptReviewLoadingIcon"
    },
    {
      name: "root",
      element: "button / a",
      description: "documentation.strings.s0347"
    }
  ],
  WlInput: [
    {
      name: "root",
      element: "input",
      description: "documentation.strings.s0418"
    },
    {
      name: "loadingIcon",
      element: "span.wl-input-wrap__spinner",
      description: "documentation.strings.ptReviewLoadingIcon"
    },
    {
      name: "clearButton",
      element: "button.wl-input-wrap__btn",
      description: "documentation.strings.ptReviewClearButton"
    },
    {
      name: "counter",
      element: "span.wl-input-counter",
      description: "documentation.strings.ptReviewCounter"
    }
  ],
  WlLink: [
    {
      name: "root",
      element: "a",
      description: "documentation.strings.ptReviewRoot"
    }
  ],
  WlMenu: [
    {
      name: "root",
      element: "div.wl-menu",
      description: "documentation.strings.s0419"
    },
    {
      name: "list",
      element: "ul.wl-menu__list",
      description: "documentation.strings.s0420"
    },
    {
      name: "item",
      element: "li.wl-menu__item",
      description: "documentation.strings.s0421"
    },
    {
      name: "submenuLabel",
      element: "div.wl-menu__head",
      description: "documentation.strings.s0422"
    },
    {
      name: "separator",
      element: "div.wl-menu__sep",
      description: "documentation.strings.s0423"
    },
    {
      name: "itemContent",
      element: "div.wl-menu__item-content",
      description: "documentation.strings.s0424"
    },
    {
      name: "itemLink",
      element: "button / a.wl-menu__link",
      description: "documentation.strings.s0425"
    },
    {
      name: "checkIcon",
      element: "span.wl-menu__check",
      description: "documentation.strings.ptReviewCheckIcon"
    },
    {
      name: "submenuIcon",
      element: "span.wl-menu__submenu-icon",
      description: "documentation.strings.ptReviewSubmenuIcon"
    }
  ],
  WlMultiSelect: [
    {
      name: "root",
      element: "div.wl-multiselect",
      description: "documentation.strings.s0426"
    },
    {
      name: "labelContainer",
      element: "div.wl-multiselect__label-container",
      description: "documentation.strings.s0427"
    },
    {
      name: "chipItem",
      element: "span.wl-multiselect__chip",
      description: "documentation.strings.s0428"
    },
    {
      name: "chip.root",
      element: "span.wl-multiselect__chip",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "chip.label",
      element: "span.wl-multiselect__chip-label",
      description: "documentation.strings.ptReviewLabel"
    },
    {
      name: "chip.removeIcon",
      element: "button.wl-multiselect__chip-remove",
      description: "documentation.strings.ptReviewRemoveButton"
    },
    {
      name: "label",
      element: "span.wl-multiselect__label",
      description: "documentation.strings.s0432"
    },
    {
      name: "hiddenInput",
      element: "input",
      description: "documentation.strings.s0433"
    },
    {
      name: "dropdown",
      element: "span.wl-multiselect__dropdown",
      description: "documentation.strings.s0434"
    },
    {
      name: "dropdownIcon",
      element: "span.wl-multiselect__dropdown-icon",
      description: "documentation.strings.s0435"
    },
    {
      name: "overlay",
      element: "div.wl-overlay",
      description: "documentation.strings.s0436"
    },
    {
      name: "header",
      element: "div.wl-multiselect__header",
      description: "documentation.strings.s0437"
    },
    {
      name: "selectAll",
      element: "label.wl-multiselect__select-all",
      description: "documentation.strings.ptReviewSelectAll"
    },
    {
      name: "selectAllInput",
      element: "input",
      description: "documentation.strings.ptReviewSelectAllInput"
    },
    {
      name: "filterIcon",
      element: "span",
      description: "documentation.strings.s0438"
    },
    {
      name: "filter.root",
      element: "input.wl-input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "listContainer",
      element: "div.wl-select__list-container",
      description: "documentation.strings.s0440"
    },
    {
      name: "loadingMessage",
      element: "div.wl-select__empty",
      description: "documentation.strings.ptReviewLoadingMessage"
    },
    {
      name: "optionGroup",
      element: "div.wl-select__group-label",
      description: "documentation.strings.ptReviewOptionGroup"
    },
    {
      name: "option",
      element: "div.wl-select__option",
      description: "documentation.strings.s0442"
    },
    {
      name: "optionLabel",
      element: "span",
      description: "documentation.strings.s0443"
    },
    {
      name: "emptyMessage",
      element: "div.wl-select__empty",
      description: "documentation.strings.s0444"
    },
    {
      name: "footer",
      element: "div",
      description: "documentation.strings.ptReviewFooter"
    },
    {
      name: "list",
      element: "ul",
      description: "documentation.strings.s0441"
    }
  ],
  WlNavItem: [
    {
      name: "root",
      element: "button / a.wl-nav-item",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "icon",
      element: "span.wl-nav-item__icon",
      description: "documentation.strings.ptReviewIcon"
    },
    {
      name: "label",
      element: "span.wl-nav-item__label",
      description: "documentation.strings.ptReviewLabel"
    },
    {
      name: "badge",
      element: "span.wl-nav-item__badge",
      description: "documentation.strings.ptReviewBadge"
    }
  ],
  WlNumberInput: [
    {
      name: "root",
      element: "div.wl-stepper",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "decrementButton",
      element: "button.wl-stepper__btn",
      description: "documentation.strings.ptReviewDecrementButton"
    },
    {
      name: "decrementIcon",
      element: "span",
      description: "documentation.strings.ptReviewDecrementIcon"
    },
    {
      name: "prefix",
      element: "span.wl-stepper__prefix",
      description: "documentation.strings.ptReviewPrefix"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "suffix",
      element: "span.wl-stepper__suffix",
      description: "documentation.strings.ptReviewSuffix"
    },
    {
      name: "incrementButton",
      element: "button.wl-stepper__btn",
      description: "documentation.strings.ptReviewIncrementButton"
    },
    {
      name: "incrementIcon",
      element: "span",
      description: "documentation.strings.ptReviewIncrementIcon"
    }
  ],
  WlPageHeader: [
    {
      name: "root",
      element: "header.wl-page-header",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "breadcrumbs",
      element: "div.wl-page-header__breadcrumbs",
      description: "documentation.strings.ptReviewBreadcrumbs"
    },
    {
      name: "main",
      element: "div.wl-page-header__main",
      description: "documentation.strings.ptReviewMain"
    },
    {
      name: "content",
      element: "div.wl-page-header__content",
      description: "documentation.strings.ptReviewContent"
    },
    {
      name: "eyebrow",
      element: "div.wl-page-header__eyebrow",
      description: "documentation.strings.ptReviewEyebrow"
    },
    {
      name: "title",
      element: "h1 / h2.wl-page-header__title",
      description: "documentation.strings.ptReviewTitle"
    },
    {
      name: "description",
      element: "div.wl-page-header__description",
      description: "documentation.strings.ptReviewDescription"
    },
    {
      name: "meta",
      element: "div.wl-page-header__meta",
      description: "documentation.strings.ptReviewMeta"
    },
    {
      name: "actions",
      element: "div.wl-page-header__actions",
      description: "documentation.strings.ptReviewActions"
    },
    {
      name: "navigation",
      element: "div.wl-page-header__navigation",
      description: "documentation.strings.ptReviewNavigation"
    }
  ],
  WlPagination: [
    {
      name: "root",
      element: "nav.wl-pagination",
      description: "documentation.strings.s0445"
    }
  ],
  WlPasswordInput: [
    {
      name: "root",
      element: "div.wl-input-wrap",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "toggleButton",
      element: "button.wl-input-wrap__btn",
      description: "documentation.strings.ptReviewToggleButton"
    },
    {
      name: "toggleIcon",
      element: "span",
      description: "documentation.strings.ptReviewToggleIcon"
    },
    {
      name: "strength",
      element: "meter.wl-password-strength",
      description: "documentation.strings.ptReviewStrength"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.ptReviewInput"
    }
  ],
  WlPill: [
    {
      name: "root",
      element: "span.wl-pill",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "dot",
      element: "span.wl-pill__dot",
      description: "documentation.strings.ptReviewDot"
    },
    {
      name: "label",
      element: "span",
      description: "documentation.strings.ptReviewLabel"
    }
  ],
  WlPopover: [
    {
      name: "arrow",
      element: "span.wl-popover__arrow",
      description: "documentation.strings.ptReviewArrow"
    },
    {
      name: "content",
      element: "div.wl-popover__content",
      description: "documentation.strings.s0447"
    },
    {
      name: "root",
      element: "div.wl-popover",
      description: "documentation.strings.s0446"
    }
  ],
  WlProgress: [
    {
      name: "value",
      element: "div.wl-progress__value",
      description: "documentation.strings.s0449"
    },
    {
      name: "label",
      element: "span.wl-progress__label",
      description: "documentation.strings.s0450"
    },
    {
      name: "root",
      element: "div",
      description: "documentation.strings.s0448"
    }
  ],
  WlRadio: [
    {
      name: "input",
      element: "input.wl-check-input",
      description: "documentation.strings.s0451"
    },
    {
      name: "box",
      element: "span.wl-radio__box",
      description: "documentation.strings.s0452"
    },
    {
      name: "icon",
      element: "span.wl-radio__icon",
      description: "documentation.strings.s0453"
    }
  ],
  WlRadioGroup: [
    {
      name: "root",
      element: "fieldset.wl-choice-group",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "legend",
      element: "legend.wl-choice-group__legend",
      description: "documentation.strings.ptReviewLegend"
    },
    {
      name: "options",
      element: "div.wl-choice-group__options",
      description: "documentation.strings.ptReviewOptions"
    },
    {
      name: "option",
      element: "label.wl-checkline",
      description: "documentation.strings.ptReviewOption"
    },
    {
      name: "input",
      element: "input.wl-check-input",
      description: "documentation.strings.ptReviewInput"
    }
  ],
  WlSegmented: [
    {
      name: "root",
      element: "div.wl-segmented",
      description: "documentation.strings.s0454"
    },
    {
      name: "item.root",
      element: "button.wl-segmented__item",
      description: "documentation.strings.ptReviewItem"
    },
    {
      name: "item.content",
      element: "span.wl-segmented__item-content",
      description: "documentation.strings.ptReviewContent"
    }
  ],
  WlSelect: [
    {
      name: "root",
      element: "div.wl-select",
      description: "documentation.strings.s0457"
    },
    {
      name: "label",
      element: "span.wl-select__label",
      description: "documentation.strings.s0458"
    },
    {
      name: "clearButton",
      element: "button.wl-select__clear",
      description: "documentation.strings.ptReviewClearButton"
    },
    {
      name: "dropdown",
      element: "span.wl-select__dropdown",
      description: "documentation.strings.s0459"
    },
    {
      name: "dropdownIcon",
      element: "span.wl-select__dropdown-icon",
      description: "documentation.strings.s0460"
    },
    {
      name: "overlay",
      element: "div.wl-overlay",
      description: "documentation.strings.s0461"
    },
    {
      name: "header",
      element: "div.wl-select__header",
      description: "documentation.strings.ptReviewHeader"
    },
    {
      name: "filterInput",
      element: "input.wl-input",
      description: "documentation.strings.ptReviewFilterInput"
    },
    {
      name: "listContainer",
      element: "div.wl-select__list-container",
      description: "documentation.strings.s0462"
    },
    {
      name: "loadingMessage",
      element: "div.wl-select__empty",
      description: "documentation.strings.ptReviewLoadingMessage"
    },
    {
      name: "optionGroup",
      element: "div.wl-select__group-label",
      description: "documentation.strings.ptReviewOptionGroup"
    },
    {
      name: "option",
      element: "div.wl-select__option",
      description: "documentation.strings.s0464"
    },
    {
      name: "optionLabel",
      element: "span.wl-select__option-label",
      description: "documentation.strings.s0465"
    },
    {
      name: "emptyMessage",
      element: "div.wl-select__empty",
      description: "documentation.strings.s0466"
    },
    {
      name: "footer",
      element: "div",
      description: "documentation.strings.ptReviewFooter"
    },
    {
      name: "list",
      element: "ul",
      description: "documentation.strings.s0463"
    }
  ],
  WlSidebar: [
    {
      name: "root",
      element: "div.wl-sidebar-shell",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "aside",
      element: "aside.wl-sidebar",
      description: "documentation.strings.ptReviewAside"
    },
    {
      name: "inner",
      element: "div.wl-sidebar__inner",
      description: "documentation.strings.ptReviewInner"
    },
    {
      name: "brand",
      element: "div.wl-sidebar__brand",
      description: "documentation.strings.ptReviewBrand"
    },
    {
      name: "brandMark",
      element: "span.wl-sidebar__brand-mark",
      description: "documentation.strings.ptReviewBrandMark"
    },
    {
      name: "nav",
      element: "nav.wl-sidebar__nav",
      description: "documentation.strings.ptReviewNav"
    },
    {
      name: "group",
      element: "section.wl-sidebar__group",
      description: "documentation.strings.ptReviewGroup"
    },
    {
      name: "divider",
      element: "div.wl-sidebar__divider",
      description: "documentation.strings.ptReviewDivider"
    },
    {
      name: "groupLabel",
      element: "div.wl-sidebar__group-label",
      description: "documentation.strings.ptReviewGroupLabel"
    },
    {
      name: "item",
      element: "button / a",
      description: "documentation.strings.ptReviewItem"
    },
    {
      name: "footer",
      element: "div.wl-sidebar__footer",
      description: "documentation.strings.ptReviewFooter"
    },
    {
      name: "footerItem",
      element: "button / a",
      description: "documentation.strings.ptReviewFooterItem"
    },
    {
      name: "pinButton",
      element: "button / a",
      description: "documentation.strings.ptReviewPinButton"
    },
    {
      name: "backdrop",
      element: "button.wl-sidebar__backdrop",
      description: "documentation.strings.ptReviewBackdrop"
    }
  ],
  WlSkeleton: [
    {
      name: "root",
      element: "span",
      description: "documentation.strings.s0467"
    },
    {
      name: "line",
      element: "span.wl-skeleton",
      description: "documentation.strings.ptReviewLine"
    }
  ],
  WlSlider: [
    {
      name: "root",
      element: "input.wl-slider",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "input",
      element: "input",
      description: "documentation.strings.ptReviewInput"
    },
    {
      name: "marks",
      element: "div.wl-slider__marks",
      description: "documentation.strings.ptReviewMarks"
    },
    {
      name: "mark",
      element: "span.wl-slider__mark",
      description: "documentation.strings.ptReviewMark"
    },
    {
      name: "label",
      element: "span",
      description: "documentation.strings.ptReviewLabel"
    }
  ],
  WlSwitch: [
    {
      name: "input",
      element: "input.wl-check-input",
      description: "documentation.strings.s0468"
    },
    {
      name: "slider",
      element: "span.wl-switch__slider",
      description: "documentation.strings.s0469"
    },
    {
      name: "handle",
      element: "span.wl-switch__handle",
      description: "documentation.strings.s0470"
    }
  ],
  WlTable: [
    {
      name: "root",
      element: "div.wl-table",
      description: "documentation.strings.s0471"
    },
    {
      name: "table",
      element: "table.wl-table__table",
      description: "documentation.strings.s0472"
    },
    {
      name: "caption",
      element: "caption.wl-table__caption",
      description: "documentation.strings.ptReviewCaption"
    },
    {
      name: "thead",
      element: "thead.wl-table__head",
      description: "documentation.strings.s0473"
    },
    {
      name: "selectionHeader",
      element: "th.wl-table__th",
      description: "documentation.strings.ptReviewSelectionHeader"
    },
    {
      name: "selectionInput",
      element: "input",
      description: "documentation.strings.ptReviewSelectionInput"
    },
    {
      name: "headerCell",
      element: "th.wl-table__th",
      description: "documentation.strings.ptReviewHeaderCell"
    },
    {
      name: "sortButton",
      element: "button.wl-table__sort",
      description: "documentation.strings.ptReviewSortButton"
    },
    {
      name: "tbody",
      element: "tbody.wl-table__body",
      description: "documentation.strings.s0474"
    },
    {
      name: "bodyRow",
      element: "tr.wl-table__row",
      description: "documentation.strings.s0475"
    },
    {
      name: "selectionCell",
      element: "td.wl-table__td",
      description: "documentation.strings.ptReviewSelectionCell"
    },
    {
      name: "emptyMessage",
      element: "tr",
      description: "documentation.strings.s0476"
    },
    {
      name: "emptyMessageCell",
      element: "td.wl-table__empty-cell",
      description: "documentation.strings.s0477"
    },
    {
      name: "mask",
      element: "div.wl-table__mask",
      description: "documentation.strings.s0478"
    },
    {
      name: "loadingIcon",
      element: "span.wl-table__loading",
      description: "documentation.strings.s0479"
    }
  ],
  WlTabs: [
    {
      name: "content",
      element: "div.wl-tabs__content",
      description: "documentation.strings.ptReviewContent"
    },
    {
      name: "tabList",
      element: "div.wl-tabs__list",
      description: "documentation.strings.ptReviewTabList"
    },
    {
      name: "activeBar",
      element: "span.wl-tabs__active-bar",
      description: "documentation.strings.ptReviewActiveBar"
    },
    {
      name: "panels.root",
      element: "div.wl-tabs__panels",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "panel.root",
      element: "div.wl-tabs__panel",
      description: "documentation.strings.ptReviewRoot"
    }
  ],
  WlTag: [
    {
      name: "root",
      element: "span",
      description: "documentation.strings.s0485"
    },
    {
      name: "icon",
      element: "span.wl-tag__icon",
      description: "documentation.strings.ptReviewIcon"
    },
    {
      name: "label",
      element: "span.wl-tag__text",
      description: "documentation.strings.s0486"
    },
    {
      name: "removeButton",
      element: "button.wl-tag__remove",
      description: "documentation.strings.ptReviewRemoveButton"
    },
    {
      name: "removeIcon",
      element: "span",
      description: "documentation.strings.ptReviewRemoveIcon"
    }
  ],
  WlTagsInput: [
    {
      name: "root",
      element: "div.wl-tags-input",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "tag",
      element: "span.wl-tags-input__tag",
      description: "documentation.strings.ptReviewTag"
    },
    {
      name: "label",
      element: "span.wl-tags-input__label",
      description: "documentation.strings.ptReviewLabel"
    },
    {
      name: "removeButton",
      element: "button.wl-tags-input__remove",
      description: "documentation.strings.ptReviewRemoveButton"
    },
    {
      name: "input",
      element: "input.wl-tags-input__input",
      description: "documentation.strings.ptReviewInput"
    }
  ],
  WlTextarea: [
    {
      name: "counter",
      element: "span.wl-input-counter",
      description: "documentation.strings.ptReviewCounter"
    },
    {
      name: "root",
      element: "textarea",
      description: "documentation.strings.s0487"
    }
  ],
  WlTimePicker: [
    {
      name: "root",
      element: "div.wl-time-picker",
      description: "documentation.strings.s0488"
    },
    {
      name: "input",
      element: "input.wl-input",
      description: "documentation.strings.s0489"
    }
  ],
  WlToast: [
    {
      name: "root",
      element: "div.wl-toast",
      description: "documentation.strings.s0490"
    },
    {
      name: "message",
      element: "div.wl-toast__message",
      description: "documentation.strings.s0491"
    },
    {
      name: "messageContent",
      element: "div.wl-toast__content",
      description: "documentation.strings.s0492"
    },
    {
      name: "messageIcon",
      element: "span.wl-toast__icon",
      description: "documentation.strings.s0493"
    },
    {
      name: "messageText",
      element: "div.wl-toast__text",
      description: "documentation.strings.s0494"
    },
    {
      name: "summary",
      element: "div.wl-toast__summary",
      description: "documentation.strings.s0495"
    },
    {
      name: "detail",
      element: "div.wl-toast__detail",
      description: "documentation.strings.s0496"
    },
    {
      name: "actionButton",
      element: "button.wl-toast__action",
      description: "documentation.strings.ptReviewActionButton"
    },
    {
      name: "closeButton",
      element: "button.wl-toast__close",
      description: "documentation.strings.s0497"
    },
    {
      name: "closeIcon",
      element: "span",
      description: "documentation.strings.s0498"
    }
  ],
  WlToolbar: [
    {
      name: "root",
      element: "div.wl-toolbar",
      description: "documentation.strings.ptReviewRoot"
    }
  ],
  WlTooltip: [
    {
      name: "trigger",
      element: "span.wl-tooltip-component__trigger",
      description: "documentation.strings.ptReviewTrigger"
    },
    {
      name: "root",
      element: "span.wl-tooltip",
      description: "documentation.strings.ptReviewRoot"
    },
    {
      name: "text",
      element: "span.wl-tooltip__text",
      description: "documentation.strings.ptReviewText"
    },
    {
      name: "arrow",
      element: "span.wl-tooltip__arrow",
      description: "documentation.strings.ptReviewArrow"
    }
  ]
});

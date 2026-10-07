import type { DocumentationPtSection } from "../catalog";

/** Named DOM sections currently used by each component. */
export const documentationPtSections: Readonly<Record<string, readonly DocumentationPtSection[]>> = {
  "WlAutocomplete": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "inputMultiple",
      "element": "DOM-секция",
      "description": "Секция inputMultiple в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "chipItem",
      "element": "DOM-секция",
      "description": "Секция chipItem в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "pcChip.root",
      "element": "DOM-секция",
      "description": "Секция pcChip.root в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "pcChip.label",
      "element": "DOM-секция",
      "description": "Секция pcChip.label в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "pcChip.removeIcon",
      "element": "DOM-секция",
      "description": "Секция pcChip.removeIcon в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "input",
      "element": "DOM-секция",
      "description": "Секция input в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "inputChip",
      "element": "DOM-секция",
      "description": "Секция inputChip в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "pcInputText.root",
      "element": "DOM-секция",
      "description": "Секция pcInputText.root в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "dropdown",
      "element": "DOM-секция",
      "description": "Секция dropdown в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "dropdownIcon",
      "element": "DOM-секция",
      "description": "Секция dropdownIcon в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "overlay",
      "element": "DOM-секция",
      "description": "Секция overlay в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "listContainer",
      "element": "DOM-секция",
      "description": "Секция listContainer в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "list",
      "element": "DOM-секция",
      "description": "Секция list в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "option",
      "element": "DOM-секция",
      "description": "Секция option в конфигурации WlConfig.pt.autocomplete."
    },
    {
      "name": "emptyMessage",
      "element": "DOM-секция",
      "description": "Секция emptyMessage в конфигурации WlConfig.pt.autocomplete."
    }
  ],
  "WlAvatar": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.avatar."
    },
    {
      "name": "image",
      "element": "DOM-секция",
      "description": "Секция image в конфигурации WlConfig.pt.avatar."
    },
    {
      "name": "label",
      "element": "DOM-секция",
      "description": "Секция label в конфигурации WlConfig.pt.avatar."
    }
  ],
  "WlBadge": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.badge."
    }
  ],
  "WlBreadcrumbs": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.breadcrumb."
    },
    {
      "name": "list",
      "element": "DOM-секция",
      "description": "Секция list в конфигурации WlConfig.pt.breadcrumb."
    },
    {
      "name": "item",
      "element": "DOM-секция",
      "description": "Секция item в конфигурации WlConfig.pt.breadcrumb."
    },
    {
      "name": "separator",
      "element": "DOM-секция",
      "description": "Секция separator в конфигурации WlConfig.pt.breadcrumb."
    }
  ],
  "WlButton": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.button."
    },
    {
      "name": "loadingIcon",
      "element": "DOM-секция",
      "description": "Секция loadingIcon в конфигурации WlConfig.pt.button."
    },
    {
      "name": "label",
      "element": "DOM-секция",
      "description": "Секция label в конфигурации WlConfig.pt.button."
    }
  ],
  "WlCard": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.card."
    },
    {
      "name": "header",
      "element": "DOM-секция",
      "description": "Секция header в конфигурации WlConfig.pt.card."
    },
    {
      "name": "body",
      "element": "DOM-секция",
      "description": "Секция body в конфигурации WlConfig.pt.card."
    },
    {
      "name": "caption",
      "element": "DOM-секция",
      "description": "Секция caption в конфигурации WlConfig.pt.card."
    },
    {
      "name": "title",
      "element": "DOM-секция",
      "description": "Секция title в конфигурации WlConfig.pt.card."
    },
    {
      "name": "subtitle",
      "element": "DOM-секция",
      "description": "Секция subtitle в конфигурации WlConfig.pt.card."
    },
    {
      "name": "content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.card."
    },
    {
      "name": "footer",
      "element": "DOM-секция",
      "description": "Секция footer в конфигурации WlConfig.pt.card."
    }
  ],
  "WlCheckbox": [
    {
      "name": "input",
      "element": "DOM-секция",
      "description": "Секция input в конфигурации WlConfig.pt.checkbox."
    },
    {
      "name": "box",
      "element": "DOM-секция",
      "description": "Секция box в конфигурации WlConfig.pt.checkbox."
    },
    {
      "name": "icon",
      "element": "DOM-секция",
      "description": "Секция icon в конфигурации WlConfig.pt.checkbox."
    }
  ],
  "WlConfirmDialog": [
    {
      "name": "content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.confirmdialog."
    },
    {
      "name": "icon",
      "element": "DOM-секция",
      "description": "Секция icon в конфигурации WlConfig.pt.confirmdialog."
    },
    {
      "name": "message",
      "element": "DOM-секция",
      "description": "Секция message в конфигурации WlConfig.pt.confirmdialog."
    }
  ],
  "WlDatePicker": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "pcInputText.root",
      "element": "DOM-секция",
      "description": "Секция pcInputText.root в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "dropdown",
      "element": "DOM-секция",
      "description": "Секция dropdown в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "dropdownIcon",
      "element": "DOM-секция",
      "description": "Секция dropdownIcon в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "panel",
      "element": "DOM-секция",
      "description": "Секция panel в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "calendarContainer",
      "element": "DOM-секция",
      "description": "Секция calendarContainer в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "calendar",
      "element": "DOM-секция",
      "description": "Секция calendar в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "header",
      "element": "DOM-секция",
      "description": "Секция header в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "pcPrevButton.root",
      "element": "DOM-секция",
      "description": "Секция pcPrevButton.root в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "pcPrevButton.icon",
      "element": "DOM-секция",
      "description": "Секция pcPrevButton.icon в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "title",
      "element": "DOM-секция",
      "description": "Секция title в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "selectMonth",
      "element": "DOM-секция",
      "description": "Секция selectMonth в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "selectYear",
      "element": "DOM-секция",
      "description": "Секция selectYear в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "pcNextButton.root",
      "element": "DOM-секция",
      "description": "Секция pcNextButton.root в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "pcNextButton.icon",
      "element": "DOM-секция",
      "description": "Секция pcNextButton.icon в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "dayView",
      "element": "DOM-секция",
      "description": "Секция dayView в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "tableHeaderCell",
      "element": "DOM-секция",
      "description": "Секция tableHeaderCell в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "weekDay",
      "element": "DOM-секция",
      "description": "Секция weekDay в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "dayCell",
      "element": "DOM-секция",
      "description": "Секция dayCell в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "day",
      "element": "DOM-секция",
      "description": "Секция day в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "monthView",
      "element": "DOM-секция",
      "description": "Секция monthView в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "month",
      "element": "DOM-секция",
      "description": "Секция month в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "yearView",
      "element": "DOM-секция",
      "description": "Секция yearView в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "year",
      "element": "DOM-секция",
      "description": "Секция year в конфигурации WlConfig.pt.datepicker."
    },
    {
      "name": "startLabel",
      "element": "Подпись начала диапазона",
      "description": "Видимая подпись startLabel в режиме range."
    },
    {
      "name": "endLabel",
      "element": "Подпись конца диапазона",
      "description": "Видимая подпись endLabel в режиме range."
    },
    {
      "name": "endInput",
      "element": "Ввод конца диапазона",
      "description": "Второе текстовое поле в режиме range; первое сохраняет pcInputText.root."
    },
    {
      "name": "rangeHint",
      "element": "Подсказка в календаре",
      "description": "Текущий шаг выбора диапазона, aria-live=polite."
    }
  ],
  "WlDialog": [
    {
      "name": "mask",
      "element": "DOM-секция",
      "description": "Секция mask в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "header",
      "element": "DOM-секция",
      "description": "Секция header в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "title",
      "element": "DOM-секция",
      "description": "Секция title в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "headerActions",
      "element": "DOM-секция",
      "description": "Секция headerActions в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "pcCloseButton.root",
      "element": "DOM-секция",
      "description": "Секция pcCloseButton.root в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "pcCloseButton.icon",
      "element": "DOM-секция",
      "description": "Секция pcCloseButton.icon в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.dialog."
    },
    {
      "name": "footer",
      "element": "DOM-секция",
      "description": "Секция footer в конфигурации WlConfig.pt.dialog."
    }
  ],
  "WlDivider": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.divider."
    },
    {
      "name": "content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.divider."
    }
  ],
  "WlDrawer": [
    {
      "name": "mask",
      "element": "DOM-секция",
      "description": "Секция mask в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "header",
      "element": "DOM-секция",
      "description": "Секция header в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "title",
      "element": "DOM-секция",
      "description": "Секция title в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "pcCloseButton.root",
      "element": "DOM-секция",
      "description": "Секция pcCloseButton.root в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "pcCloseButton.icon",
      "element": "DOM-секция",
      "description": "Секция pcCloseButton.icon в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.drawer."
    },
    {
      "name": "footer",
      "element": "DOM-секция",
      "description": "Секция footer в конфигурации WlConfig.pt.drawer."
    }
  ],
  "WlFilePicker": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.filepicker."
    },
    {
      "name": "trigger",
      "element": "DOM-секция",
      "description": "Секция trigger в конфигурации WlConfig.pt.filepicker."
    },
    {
      "name": "input",
      "element": "DOM-секция",
      "description": "Секция input в конфигурации WlConfig.pt.filepicker."
    }
  ],
  "WlIconButton": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.button."
    }
  ],
  "WlInput": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.inputtext."
    }
  ],
  "WlMenu": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.menu."
    },
    {
      "name": "list",
      "element": "DOM-секция",
      "description": "Секция list в конфигурации WlConfig.pt.menu."
    },
    {
      "name": "item",
      "element": "DOM-секция",
      "description": "Секция item в конфигурации WlConfig.pt.menu."
    },
    {
      "name": "submenuLabel",
      "element": "DOM-секция",
      "description": "Секция submenuLabel в конфигурации WlConfig.pt.menu."
    },
    {
      "name": "separator",
      "element": "DOM-секция",
      "description": "Секция separator в конфигурации WlConfig.pt.menu."
    },
    {
      "name": "itemContent",
      "element": "DOM-секция",
      "description": "Секция itemContent в конфигурации WlConfig.pt.menu."
    },
    {
      "name": "itemLink",
      "element": "DOM-секция",
      "description": "Секция itemLink в конфигурации WlConfig.pt.menu."
    }
  ],
  "WlMultiSelect": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "labelContainer",
      "element": "DOM-секция",
      "description": "Секция labelContainer в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "chipItem",
      "element": "DOM-секция",
      "description": "Секция chipItem в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "pcChip.root",
      "element": "DOM-секция",
      "description": "Секция pcChip.root в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "pcChip.label",
      "element": "DOM-секция",
      "description": "Секция pcChip.label в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "pcChip.removeIcon",
      "element": "DOM-секция",
      "description": "Секция pcChip.removeIcon в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "label",
      "element": "DOM-секция",
      "description": "Секция label в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "hiddenInput",
      "element": "DOM-секция",
      "description": "Секция hiddenInput в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "dropdown",
      "element": "DOM-секция",
      "description": "Секция dropdown в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "dropdownIcon",
      "element": "DOM-секция",
      "description": "Секция dropdownIcon в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "overlay",
      "element": "DOM-секция",
      "description": "Секция overlay в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "header",
      "element": "DOM-секция",
      "description": "Секция header в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "filterIcon",
      "element": "DOM-секция",
      "description": "Секция filterIcon в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "pcFilter.root",
      "element": "DOM-секция",
      "description": "Секция pcFilter.root в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "listContainer",
      "element": "DOM-секция",
      "description": "Секция listContainer в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "list",
      "element": "DOM-секция",
      "description": "Секция list в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "option",
      "element": "DOM-секция",
      "description": "Секция option в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "optionLabel",
      "element": "DOM-секция",
      "description": "Секция optionLabel в конфигурации WlConfig.pt.multiselect."
    },
    {
      "name": "emptyMessage",
      "element": "DOM-секция",
      "description": "Секция emptyMessage в конфигурации WlConfig.pt.multiselect."
    }
  ],
  "WlPagination": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.paginator."
    }
  ],
  "WlPopover": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.popover."
    },
    {
      "name": "content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.popover."
    }
  ],
  "WlProgress": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.progressbar."
    },
    {
      "name": "value",
      "element": "DOM-секция",
      "description": "Секция value в конфигурации WlConfig.pt.progressbar."
    },
    {
      "name": "label",
      "element": "DOM-секция",
      "description": "Секция label в конфигурации WlConfig.pt.progressbar."
    }
  ],
  "WlRadio": [
    {
      "name": "input",
      "element": "DOM-секция",
      "description": "Секция input в конфигурации WlConfig.pt.radiobutton."
    },
    {
      "name": "box",
      "element": "DOM-секция",
      "description": "Секция box в конфигурации WlConfig.pt.radiobutton."
    },
    {
      "name": "icon",
      "element": "DOM-секция",
      "description": "Секция icon в конфигурации WlConfig.pt.radiobutton."
    }
  ],
  "WlSegmented": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.selectbutton."
    },
    {
      "name": "pcToggleButton.root",
      "element": "DOM-секция",
      "description": "Секция pcToggleButton.root в конфигурации WlConfig.pt.selectbutton."
    },
    {
      "name": "pcToggleButton.content",
      "element": "DOM-секция",
      "description": "Секция pcToggleButton.content в конфигурации WlConfig.pt.selectbutton."
    }
  ],
  "WlSelect": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.select."
    },
    {
      "name": "label",
      "element": "DOM-секция",
      "description": "Секция label в конфигурации WlConfig.pt.select."
    },
    {
      "name": "dropdown",
      "element": "DOM-секция",
      "description": "Секция dropdown в конфигурации WlConfig.pt.select."
    },
    {
      "name": "dropdownIcon",
      "element": "DOM-секция",
      "description": "Секция dropdownIcon в конфигурации WlConfig.pt.select."
    },
    {
      "name": "overlay",
      "element": "DOM-секция",
      "description": "Секция overlay в конфигурации WlConfig.pt.select."
    },
    {
      "name": "listContainer",
      "element": "DOM-секция",
      "description": "Секция listContainer в конфигурации WlConfig.pt.select."
    },
    {
      "name": "list",
      "element": "DOM-секция",
      "description": "Секция list в конфигурации WlConfig.pt.select."
    },
    {
      "name": "option",
      "element": "DOM-секция",
      "description": "Секция option в конфигурации WlConfig.pt.select."
    },
    {
      "name": "optionLabel",
      "element": "DOM-секция",
      "description": "Секция optionLabel в конфигурации WlConfig.pt.select."
    },
    {
      "name": "emptyMessage",
      "element": "DOM-секция",
      "description": "Секция emptyMessage в конфигурации WlConfig.pt.select."
    }
  ],
  "WlSkeleton": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.skeleton."
    }
  ],
  "WlSwitch": [
    {
      "name": "input",
      "element": "DOM-секция",
      "description": "Секция input в конфигурации WlConfig.pt.toggleswitch."
    },
    {
      "name": "slider",
      "element": "DOM-секция",
      "description": "Секция slider в конфигурации WlConfig.pt.toggleswitch."
    },
    {
      "name": "handle",
      "element": "DOM-секция",
      "description": "Секция handle в конфигурации WlConfig.pt.toggleswitch."
    }
  ],
  "WlTable": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "table",
      "element": "DOM-секция",
      "description": "Секция table в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "thead",
      "element": "DOM-секция",
      "description": "Секция thead в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "tbody",
      "element": "DOM-секция",
      "description": "Секция tbody в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "bodyRow",
      "element": "DOM-секция",
      "description": "Секция bodyRow в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "emptyMessage",
      "element": "DOM-секция",
      "description": "Секция emptyMessage в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "emptyMessageCell",
      "element": "DOM-секция",
      "description": "Секция emptyMessageCell в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "mask",
      "element": "DOM-секция",
      "description": "Секция mask в конфигурации WlConfig.pt.datatable."
    },
    {
      "name": "loadingIcon",
      "element": "DOM-секция",
      "description": "Секция loadingIcon в конфигурации WlConfig.pt.datatable."
    }
  ],
  "WlTabs": [
    {
      "name": "tablist.content",
      "element": "DOM-секция",
      "description": "Секция content в конфигурации WlConfig.pt.tablist."
    },
    {
      "name": "tablist.tabList",
      "element": "DOM-секция",
      "description": "Секция tabList в конфигурации WlConfig.pt.tablist."
    },
    {
      "name": "tablist.activeBar",
      "element": "DOM-секция",
      "description": "Секция activeBar в конфигурации WlConfig.pt.tablist."
    },
    {
      "name": "tabpanels.root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.tabpanels."
    },
    {
      "name": "tabpanel.root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.tabpanel."
    }
  ],
  "WlTag": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.tag."
    },
    {
      "name": "label",
      "element": "DOM-секция",
      "description": "Секция label в конфигурации WlConfig.pt.tag."
    }
  ],
  "WlTextarea": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.textarea."
    }
  ],
  "WlTimePicker": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.timepicker."
    },
    {
      "name": "input",
      "element": "DOM-секция",
      "description": "Секция input в конфигурации WlConfig.pt.timepicker."
    }
  ],
  "WlToast": [
    {
      "name": "root",
      "element": "DOM-секция",
      "description": "Секция root в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "message",
      "element": "DOM-секция",
      "description": "Секция message в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "messageContent",
      "element": "DOM-секция",
      "description": "Секция messageContent в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "messageIcon",
      "element": "DOM-секция",
      "description": "Секция messageIcon в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "messageText",
      "element": "DOM-секция",
      "description": "Секция messageText в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "summary",
      "element": "DOM-секция",
      "description": "Секция summary в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "detail",
      "element": "DOM-секция",
      "description": "Секция detail в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "closeButton",
      "element": "DOM-секция",
      "description": "Секция closeButton в конфигурации WlConfig.pt.toast."
    },
    {
      "name": "closeIcon",
      "element": "DOM-секция",
      "description": "Секция closeIcon в конфигурации WlConfig.pt.toast."
    }
  ]
};

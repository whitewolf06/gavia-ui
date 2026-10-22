import type { HTMLAttributes, VNodeProps } from "vue";
import type { WlToastSeverity } from "./services/toast";
import type { WlTone } from "./types";

/** DOM attributes stay extensible, including data/ARIA attributes and Vue event or vnode hooks. */
export type WlPtAttributes = HTMLAttributes & VNodeProps & Record<string, unknown>;

/** Tooltip DOM is managed by its directive, so Vue listeners and vnode hooks are not supported. */
export type WlTooltipPtAttributes = Omit<HTMLAttributes, `on${string}`> & Record<string, unknown>
  & { [Key in `on${string}`]?: never }
  & { key?: never; ref?: never; ref_for?: never; ref_key?: never };

/** Only `context` is supplied to section callbacks; no component props or internal state are exposed. */
export interface WlPtContext {
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
}

/** Resolved semantic state of one toast message, including its legacy severity. */
export interface WlPtToastContext extends WlPtContext {
  id: number;
  tone: WlTone;
  severity: WlToastSeverity;
}

/** Semantic state shared by the confirmation surface and its internal sections. */
export interface WlPtConfirmationContext extends WlPtContext {
  tone: WlTone;
  danger: boolean;
}

export interface WlPtCallbackOptions<TContext extends WlPtContext = WlPtContext> {
  context: TContext;
  [key: string]: unknown;
}

export type WlPtSection<
  TContext extends WlPtContext = WlPtContext,
  TAttributes extends Record<string, unknown> = WlPtAttributes
> = TAttributes | ((options: WlPtCallbackOptions<TContext>) => TAttributes);

export interface WlPtCheckboxContext extends WlPtContext {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
}
export interface WlPtCheckedContext extends WlPtContext {
  checked: boolean;
  disabled: boolean;
}
export interface WlPtOptionContext extends WlPtContext {
  focused: boolean;
  selected: boolean;
}
export interface WlPtFocusedContext extends WlPtContext {
  focused: boolean;
}
export interface WlPtActiveContext extends WlPtContext {
  active: boolean;
  disabled: boolean;
}
export interface WlPtSelectedContext extends WlPtContext {
  selected: boolean;
  disabled: boolean;
}
export interface WlPtDayContext extends WlPtSelectedContext {
  inRange: boolean;
  today: boolean;
  otherMonth: boolean;
}

type Sections<T, TOpen extends boolean> = Partial<T>
  & (TOpen extends true ? Record<string, unknown> : Record<never, never>);
type Root<TOpen extends boolean> = Sections<{ root: WlPtSection }, TOpen>;
type IconButton<TOpen extends boolean> = Sections<{
  root: WlPtSection;
  icon: WlPtSection;
}, TOpen>;
type Chip<TOpen extends boolean> = Sections<{
  root: WlPtSection;
  label: WlPtSection;
  removeIcon: WlPtSection;
}, TOpen>;

/** Names and nesting mirror the DOM sections actually resolved by the kit. */
export interface WlPtMap<TOpen extends boolean = true> {
  commandpalette?: Sections<{
    root: WlPtSection;
    panel: WlPtSection;
    input: WlPtSection;
    list: WlPtSection;
    group: WlPtSection;
    groupLabel: WlPtSection;
    item: WlPtSection;
    itemIcon: WlPtSection;
    status: WlPtSection;
    footer: WlPtSection;
  }, TOpen>;
  filterbar?: Sections<{
    root: WlPtSection;
    mobileToggle: WlPtSection;
    panel: WlPtSection;
    mobileHead: WlPtSection;
    title: WlPtSection;
    closeButton: WlPtSection;
    toolbar: WlPtSection;
    leading: WlPtSection;
    controls: WlPtSection;
    actions: WlPtSection;
    footer: WlPtSection;
    summary: WlPtSection;
    backdrop: WlPtSection;
  }, TOpen>;
  pageheader?: Sections<{
    root: WlPtSection;
    breadcrumbs: WlPtSection;
    main: WlPtSection;
    content: WlPtSection;
    eyebrow: WlPtSection;
    title: WlPtSection;
    description: WlPtSection;
    meta: WlPtSection;
    actions: WlPtSection;
    navigation: WlPtSection;
  }, TOpen>;
  sidebar?: Sections<{
    root: WlPtSection;
    aside: WlPtSection;
    inner: WlPtSection;
    brand: WlPtSection;
    brandMark: WlPtSection;
    nav: WlPtSection;
    group: WlPtSection;
    divider: WlPtSection;
    groupLabel: WlPtSection;
    item: WlPtSection;
    footer: WlPtSection;
    footerItem: WlPtSection;
    pinButton: WlPtSection;
    backdrop: WlPtSection;
  }, TOpen>;
  calendar?: Sections<{
    root: WlPtSection;
    header: WlPtSection;
    prevButton: WlPtSection;
    nextButton: WlPtSection;
    title: WlPtSection;
    body: WlPtSection;
    week: WlPtSection;
    weekday: WlPtSection;
    grid: WlPtSection;
    row: WlPtSection;
    day: WlPtSection<WlPtDayContext>;
    dayNumber: WlPtSection;
    event: WlPtSection;
  }, TOpen>;
  colorpicker?: Sections<{
    root: WlPtSection;
    grid: WlPtSection;
    swatch: WlPtSection;
    input: WlPtSection;
    controls: WlPtSection;
    channel: WlPtSection;
    channelLabel: WlPtSection;
    channelInput: WlPtSection;
  }, TOpen>;
  contextmenu?: Root<TOpen>;
  tagsinput?: Sections<{
    root: WlPtSection;
    tag: WlPtSection;
    label: WlPtSection;
    removeButton: WlPtSection;
    input: WlPtSection;
  }, TOpen>;
  toolbar?: Root<TOpen>;
  radiogroup?: Sections<{
    root: WlPtSection;
    legend: WlPtSection;
    options: WlPtSection;
    option: WlPtSection;
    input: WlPtSection;
  }, TOpen>;
  checkboxgroup?: Sections<{
    input: WlPtSection;
    root: WlPtSection;
    legend: WlPtSection;
    options: WlPtSection;
    option: WlPtSection;
  }, TOpen>;
  link?: Root<TOpen>;
  iconButton?: Sections<{ root: WlPtSection; label: WlPtSection; loadingIcon: WlPtSection }, TOpen>;
  button: Sections<{
    root: WlPtSection;
    label: WlPtSection;
    loadingIcon: WlPtSection;
  }, TOpen>;
  checkbox: Sections<{
    input: WlPtSection<WlPtCheckboxContext>;
    box: WlPtSection<WlPtCheckboxContext>;
    icon: WlPtSection<WlPtCheckboxContext>;
  }, TOpen>;
  radio: Sections<{
    input: WlPtSection<WlPtCheckedContext>;
    box: WlPtSection<WlPtCheckedContext>;
    icon: WlPtSection;
  }, TOpen>;
  switch: Sections<{
    input: WlPtSection<WlPtCheckedContext>;
    slider: WlPtSection<WlPtCheckedContext>;
    handle: WlPtSection;
  }, TOpen>;
  select: Sections<{
    filterInput: WlPtSection; optionGroup: WlPtSection; loadingMessage: WlPtSection;
    root: WlPtSection;
    label: WlPtSection;
    clearButton: WlPtSection;
    header: WlPtSection;
    footer: WlPtSection;
    dropdown: WlPtSection;
    dropdownIcon: WlPtSection;
    overlay: WlPtSection;
    listContainer: WlPtSection;
    list: WlPtSection;
    option: WlPtSection<WlPtOptionContext>;
    optionLabel: WlPtSection;
    emptyMessage: WlPtSection;
  }, TOpen>;
  multiselect: Sections<{
    optionGroup: WlPtSection; loadingMessage: WlPtSection; selectAll: WlPtSection; selectAllInput: WlPtSection;
    root: WlPtSection;
    hiddenInput: WlPtSection;
    labelContainer: WlPtSection;
    label: WlPtSection;
    chipItem: WlPtSection;
    chip: Chip<TOpen>;
    dropdown: WlPtSection;
    dropdownIcon: WlPtSection;
    overlay: WlPtSection;
    header: WlPtSection;
    footer: WlPtSection;
    filter: Root<TOpen>;
    filterIcon: WlPtSection;
    listContainer: WlPtSection;
    list: WlPtSection;
    option: WlPtSection<WlPtOptionContext>;
    optionLabel: WlPtSection;
    emptyMessage: WlPtSection;
  }, TOpen>;
  autocomplete: Sections<{
    loadingMessage: WlPtSection;
    root: WlPtSection;
    clearButton: WlPtSection;
    inputMultiple: WlPtSection;
    chipItem: WlPtSection;
    chip: Chip<TOpen>;
    input: WlPtSection;
    inputChip: WlPtSection;
    inputText: Root<TOpen>;
    dropdown: WlPtSection;
    dropdownIcon: WlPtSection;
    overlay: WlPtSection;
    listContainer: WlPtSection;
    list: WlPtSection;
    option: WlPtSection<WlPtFocusedContext>;
    emptyMessage: WlPtSection;
  }, TOpen>;
  field?: Sections<{
    root: WlPtSection;
    label: WlPtSection;
    required: WlPtSection;
    hint: WlPtSection;
    error: WlPtSection;
  }, TOpen>;
  fileupload?: Sections<{
    root: WlPtSection;
    drop: WlPtSection;
    input: WlPtSection;
    errors: WlPtSection;
    list: WlPtSection;
    row: WlPtSection;
    preview: WlPtSection;
    progress: WlPtSection;
    removeButton: WlPtSection;
  }, TOpen>;
  accordion?: Sections<{ root: WlPtSection; item: WlPtSection; header: WlPtSection; content: WlPtSection }, TOpen>;
  password?: Sections<{
    root: WlPtSection;
    input: WlPtSection;
    toggleButton: WlPtSection;
    toggleIcon: WlPtSection;
    strength: WlPtSection;
  }, TOpen>;
  numberinput?: Sections<{
    root: WlPtSection;
    input: WlPtSection;
    decrementButton: WlPtSection;
    incrementButton: WlPtSection;
    decrementIcon: WlPtSection;
    incrementIcon: WlPtSection;
    prefix: WlPtSection;
    suffix: WlPtSection;
  }, TOpen>;
  slider?: Sections<{
    root: WlPtSection;
    input: WlPtSection;
    startInput: WlPtSection;
    endInput: WlPtSection;
    marks: WlPtSection;
    mark: WlPtSection;
    label: WlPtSection;
  }, TOpen>;
  pill?: Sections<{ root: WlPtSection; label: WlPtSection; dot: WlPtSection }, TOpen>;
  alert?: Sections<{
    root: WlPtSection;
    icon: WlPtSection;
    body: WlPtSection;
    title: WlPtSection;
    text: WlPtSection;
    action: WlPtSection;
    closeButton: WlPtSection;
    closeIcon: WlPtSection;
  }, TOpen>;
  card: Sections<{
    root: WlPtSection;
    header: WlPtSection;
    body: WlPtSection;
    caption: WlPtSection;
    title: WlPtSection;
    subtitle: WlPtSection;
    content: WlPtSection;
    footer: WlPtSection;
  }, TOpen>;
  dialog: Sections<{
    root: WlPtSection;
    mask: WlPtSection;
    header: WlPtSection;
    title: WlPtSection;
    headerActions: WlPtSection;
    content: WlPtSection;
    footer: WlPtSection;
    closeButton: IconButton<TOpen>;
  }, TOpen>;
  confirmdialog: Sections<{
    root: WlPtSection<WlPtConfirmationContext>;
    mask: WlPtSection<WlPtConfirmationContext>;
    header: WlPtSection<WlPtConfirmationContext>;
    title: WlPtSection<WlPtConfirmationContext>;
    content: WlPtSection<WlPtConfirmationContext>;
    icon: WlPtSection<WlPtConfirmationContext>;
    message: WlPtSection<WlPtConfirmationContext>;
    footer: WlPtSection<WlPtConfirmationContext>;
  }, TOpen>;
  drawer: Sections<{
    root: WlPtSection;
    mask: WlPtSection;
    header: WlPtSection;
    title: WlPtSection;
    content: WlPtSection;
    footer: WlPtSection;
    closeButton: IconButton<TOpen>;
  }, TOpen>;
  progress: Sections<{
    root: WlPtSection;
    value: WlPtSection;
    label: WlPtSection;
  }, TOpen>;
  avatar: Sections<{
    root: WlPtSection;
    label: WlPtSection;
    image: WlPtSection;
  }, TOpen>;
  tag: Sections<{
    root: WlPtSection;
    label: WlPtSection;
    icon: WlPtSection;
    removeButton: WlPtSection;
    removeIcon: WlPtSection;
  }, TOpen>;
  chip?: Sections<{
    root: WlPtSection;
    label: WlPtSection;
    count: WlPtSection;
    action: WlPtSection;
    removeButton: WlPtSection;
    removeIcon: WlPtSection;
  }, TOpen>;
  navitem?: Sections<{ root: WlPtSection; icon: WlPtSection; label: WlPtSection; badge: WlPtSection }, TOpen>;
  divider: Sections<{ root: WlPtSection; content: WlPtSection }, TOpen>;
  tabs: Sections<{
    panels: Root<TOpen>;
    panel: Root<TOpen>;
    content: WlPtSection;
    tabList: WlPtSection;
    activeBar: WlPtSection;
  }, TOpen>;
  tooltip: Sections<{
    trigger: WlPtSection;
    root: WlPtSection<WlPtContext, WlTooltipPtAttributes>;
    text: WlPtSection<WlPtContext, WlTooltipPtAttributes>;
    arrow: WlPtSection<WlPtContext, WlTooltipPtAttributes>;
  }, TOpen>;
  segmented: Sections<{
    root: WlPtSection;
    item: Sections<{
      root: WlPtSection<WlPtActiveContext>;
      content: WlPtSection;
    }, TOpen>;
  }, TOpen>;
  breadcrumbs: Sections<{
    collapseButton: WlPtSection;
    root: WlPtSection;
    list: WlPtSection;
    item: WlPtSection;
    separator: WlPtSection;
  }, TOpen>;
  menu: Sections<{
    checkIcon: WlPtSection; submenuIcon: WlPtSection;
    root: WlPtSection;
    list: WlPtSection;
    submenuLabel: WlPtSection;
    item: WlPtSection;
    itemContent: WlPtSection;
    itemLink: WlPtSection;
    separator: WlPtSection;
  }, TOpen>;
  popover: Sections<{
    arrow: WlPtSection; root: WlPtSection; content: WlPtSection; }, TOpen>;
  toast: Sections<{
    root: WlPtSection;
    actionButton: WlPtSection;
    message: WlPtSection<WlPtToastContext>;
    messageContent: WlPtSection;
    messageIcon: WlPtSection<WlPtToastContext>;
    messageText: WlPtSection;
    summary: WlPtSection;
    detail: WlPtSection;
    closeButton: WlPtSection;
    closeIcon: WlPtSection;
  }, TOpen>;
  table: Sections<{
    caption: WlPtSection;
    headerCell: WlPtSection;
    sortButton: WlPtSection;
    selectionHeader: WlPtSection;
    selectionCell: WlPtSection;
    selectionInput: WlPtSection;
    root: WlPtSection;
    table: WlPtSection;
    thead: WlPtSection;
    tbody: WlPtSection;
    bodyRow: WlPtSection;
    emptyMessage: WlPtSection;
    emptyMessageCell: WlPtSection;
    mask: WlPtSection;
    loadingIcon: WlPtSection;
  }, TOpen>;
  datepicker: Sections<{
    presets: WlPtSection;
    preset: WlPtSection;
    root: WlPtSection;
    startLabel: WlPtSection;
    endLabel: WlPtSection;
    inputText: Root<TOpen>;
    endInput: WlPtSection;
    rangeHint: WlPtSection;
    dropdown: WlPtSection;
    dropdownIcon: WlPtSection;
    panel: WlPtSection;
    calendarContainer: WlPtSection;
    calendar: WlPtSection;
    header: WlPtSection;
    title: WlPtSection;
    selectMonth: WlPtSection;
    selectYear: WlPtSection;
    prevButton: IconButton<TOpen>;
    nextButton: IconButton<TOpen>;
    dayView: WlPtSection;
    monthView: WlPtSection;
    month: WlPtSection<WlPtSelectedContext>;
    yearView: WlPtSection;
    year: WlPtSection<WlPtSelectedContext>;
    tableHeaderCell: WlPtSection;
    weekDay: WlPtSection;
    dayCell: WlPtSection;
    day: WlPtSection<WlPtDayContext>;
  }, TOpen>;
  badge: Root<TOpen>;
  input: Sections<{
    root: WlPtSection;
    clearButton: WlPtSection;
    loadingIcon: WlPtSection;
    counter: WlPtSection;
  }, TOpen>;
  textarea: Sections<{ root: WlPtSection; counter: WlPtSection }, TOpen>;
  skeleton: Sections<{ root: WlPtSection; line: WlPtSection }, TOpen>;
  pagination: Root<TOpen>;
  timepicker: Sections<{ root: WlPtSection; input: WlPtSection }, TOpen>;
  filepicker: Sections<{ root: WlPtSection; input: WlPtSection; trigger: WlPtSection }, TOpen>;
}

export type WlPtComponent = keyof WlPtMap;

/** Autocompletes known sections while retaining the existing open extension contract. */
export type WlPt<TComponent extends WlPtComponent> = NonNullable<WlPtMap[TComponent]>;

/** Opt in with `satisfies` to reject misspelled sections, including nested nodes. */
export type WlPtStrict<
  TComponent extends WlPtComponent,
  TExtensions extends object = Record<never, never>
> = NonNullable<WlPtMap<false>[TComponent]> & TExtensions;

/** Application configuration has the same known sections as local component props. */
export type WlPtConfig = {
  [TComponent in WlPtComponent]?: WlPt<TComponent>;
} & Record<string, unknown>;

/** Opt-in validation of application component names and their section trees. */
export type WlPtConfigStrict = {
  [TComponent in WlPtComponent]?: WlPtStrict<TComponent>;
};

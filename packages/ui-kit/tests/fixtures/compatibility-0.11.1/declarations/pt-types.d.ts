import { HTMLAttributes, VNodeProps } from 'vue';
/** DOM attributes stay extensible, including data/ARIA attributes and Vue event or vnode hooks. */
export type WlPtAttributes = HTMLAttributes & VNodeProps & Record<string, unknown>;
/** Tooltip DOM is managed by its directive, so Vue listeners and vnode hooks are not supported. */
export type WlTooltipPtAttributes = Omit<HTMLAttributes, `on${string}`> & Record<string, unknown> & {
    [Key in `on${string}`]?: never;
} & {
    key?: never;
    ref?: never;
    ref_for?: never;
    ref_key?: never;
};
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
export interface WlPtCallbackOptions<TContext extends WlPtContext = WlPtContext> {
    context: TContext;
    [key: string]: unknown;
}
export type WlPtSection<TContext extends WlPtContext = WlPtContext, TAttributes extends Record<string, unknown> = WlPtAttributes> = TAttributes | ((options: WlPtCallbackOptions<TContext>) => TAttributes);
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
type Sections<T, TOpen extends boolean> = Partial<T> & (TOpen extends true ? Record<string, unknown> : Record<never, never>);
type Root<TOpen extends boolean> = Sections<{
    root: WlPtSection;
}, TOpen>;
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
    radiobutton: Sections<{
        input: WlPtSection<WlPtCheckedContext>;
        box: WlPtSection<WlPtCheckedContext>;
        icon: WlPtSection;
    }, TOpen>;
    toggleswitch: Sections<{
        input: WlPtSection<WlPtCheckedContext>;
        slider: WlPtSection<WlPtCheckedContext>;
        handle: WlPtSection;
    }, TOpen>;
    select: Sections<{
        root: WlPtSection;
        label: WlPtSection;
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
        root: WlPtSection;
        hiddenInput: WlPtSection;
        labelContainer: WlPtSection;
        label: WlPtSection;
        chipItem: WlPtSection;
        pcChip: Chip<TOpen>;
        dropdown: WlPtSection;
        dropdownIcon: WlPtSection;
        overlay: WlPtSection;
        header: WlPtSection;
        pcFilter: Root<TOpen>;
        filterIcon: WlPtSection;
        listContainer: WlPtSection;
        list: WlPtSection;
        option: WlPtSection<WlPtOptionContext>;
        optionLabel: WlPtSection;
        emptyMessage: WlPtSection;
    }, TOpen>;
    autocomplete: Sections<{
        root: WlPtSection;
        inputMultiple: WlPtSection;
        chipItem: WlPtSection;
        pcChip: Chip<TOpen>;
        input: WlPtSection;
        inputChip: WlPtSection;
        pcInputText: Root<TOpen>;
        dropdown: WlPtSection;
        dropdownIcon: WlPtSection;
        overlay: WlPtSection;
        listContainer: WlPtSection;
        list: WlPtSection;
        option: WlPtSection<WlPtFocusedContext>;
        emptyMessage: WlPtSection;
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
        pcCloseButton: IconButton<TOpen>;
    }, TOpen>;
    confirmdialog: Sections<{
        root: WlPtSection;
        mask: WlPtSection;
        header: WlPtSection;
        title: WlPtSection;
        content: WlPtSection;
        icon: WlPtSection;
        message: WlPtSection;
        footer: WlPtSection;
    }, TOpen>;
    drawer: Sections<{
        root: WlPtSection;
        mask: WlPtSection;
        header: WlPtSection;
        title: WlPtSection;
        content: WlPtSection;
        footer: WlPtSection;
        pcCloseButton: IconButton<TOpen>;
    }, TOpen>;
    progressbar: Sections<{
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
    }, TOpen>;
    divider: Sections<{
        root: WlPtSection;
        content: WlPtSection;
    }, TOpen>;
    tablist: Sections<{
        content: WlPtSection;
        tabList: WlPtSection;
        activeBar: WlPtSection;
        /** Local WlTabs panel configuration; app-level configuration uses the sibling component keys. */
        tabpanels: Root<TOpen>;
        tabpanel: Root<TOpen>;
    }, TOpen>;
    tabpanels: Root<TOpen>;
    tabpanel: Root<TOpen>;
    tooltip: Sections<{
        root: WlPtSection<WlPtContext, WlTooltipPtAttributes>;
        text: WlPtSection<WlPtContext, WlTooltipPtAttributes>;
        arrow: WlPtSection<WlPtContext, WlTooltipPtAttributes>;
    }, TOpen>;
    selectbutton: Sections<{
        root: WlPtSection;
        pcToggleButton: Sections<{
            root: WlPtSection<WlPtActiveContext>;
            content: WlPtSection;
        }, TOpen>;
    }, TOpen>;
    breadcrumb: Sections<{
        root: WlPtSection;
        list: WlPtSection;
        item: WlPtSection;
        separator: WlPtSection;
    }, TOpen>;
    menu: Sections<{
        root: WlPtSection;
        list: WlPtSection;
        submenuLabel: WlPtSection;
        item: WlPtSection;
        itemContent: WlPtSection;
        itemLink: WlPtSection;
        separator: WlPtSection;
    }, TOpen>;
    popover: Sections<{
        root: WlPtSection;
        content: WlPtSection;
    }, TOpen>;
    toast: Sections<{
        root: WlPtSection;
        message: WlPtSection;
        messageContent: WlPtSection;
        messageIcon: WlPtSection;
        messageText: WlPtSection;
        summary: WlPtSection;
        detail: WlPtSection;
        closeButton: WlPtSection;
        closeIcon: WlPtSection;
    }, TOpen>;
    datatable: Sections<{
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
        root: WlPtSection;
        startLabel: WlPtSection;
        endLabel: WlPtSection;
        pcInputText: Root<TOpen>;
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
        pcPrevButton: IconButton<TOpen>;
        pcNextButton: IconButton<TOpen>;
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
    inputtext: Root<TOpen>;
    textarea: Root<TOpen>;
    skeleton: Root<TOpen>;
    paginator: Root<TOpen>;
    timepicker: Sections<{
        root: WlPtSection;
        input: WlPtSection;
    }, TOpen>;
    filepicker: Sections<{
        root: WlPtSection;
        input: WlPtSection;
        trigger: WlPtSection;
    }, TOpen>;
}
export type WlPtComponent = keyof WlPtMap;
/** Autocompletes known sections while retaining the existing open extension contract. */
export type WlPt<TComponent extends WlPtComponent> = WlPtMap[TComponent];
/** Opt in with `satisfies` to reject misspelled sections, including nested nodes. */
export type WlPtStrict<TComponent extends WlPtComponent, TExtensions extends object = Record<never, never>> = WlPtMap<false>[TComponent] & TExtensions;
/** Application configuration has the same known sections as local component props. */
export type WlPtConfig = {
    [TComponent in WlPtComponent]?: WlPt<TComponent>;
} & Record<string, unknown>;
/** Opt-in validation of application component names and their section trees. */
export type WlPtConfigStrict = {
    [TComponent in WlPtComponent]?: WlPtStrict<TComponent>;
};
export {};

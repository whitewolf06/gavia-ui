import { WlPt } from '../pt-types';
import { WlTableColumn, WlTableRow } from '../table-types';
declare const _default: <Row extends object = WlTableRow>(__VLS_props: NonNullable<Awaited<typeof __VLS_setup>>["props"], __VLS_ctx?: __VLS_PrettifyLocal<Pick<NonNullable<Awaited<typeof __VLS_setup>>, "attrs" | "emit" | "slots">>, __VLS_expose?: NonNullable<Awaited<typeof __VLS_setup>>["expose"], __VLS_setup?: Promise<{
    props: __VLS_PrettifyLocal<Pick<Partial<{}> & Omit<{} & import('vue').VNodeProps & import('vue').AllowedComponentProps & import('vue').ComponentCustomProps & Readonly<import('vue').ExtractPropTypes<{}>>, never>, never> & {
        value?: readonly Row[];
        columns?: readonly WlTableColumn<NoInfer<Row>>[];
        loading?: boolean;
        emptyMessage?: string;
        pt?: WlPt<"datatable">;
    } & Partial<{}>> & import('vue').PublicProps;
    expose(exposed: import('vue').ShallowUnwrapRef<{}>): void;
    attrs: any;
    slots: Readonly<{
        [name: `cell-${string}`]: ((props: import('..').WlTableCellSlotProps<Row, string>) => unknown) | undefined;
        default?: (props: {}) => unknown;
        empty?: (props: {}) => unknown;
    } & { [Key in Extract<keyof Row, string> as `cell-${Key}`]?: ((props: import('..').WlTableCellSlotProps<Row, Key>) => unknown) | undefined; }> & {
        [name: `cell-${string}`]: ((props: import('..').WlTableCellSlotProps<Row, string>) => unknown) | undefined;
        default?: (props: {}) => unknown;
        empty?: (props: {}) => unknown;
    } & { [Key in Extract<keyof Row, string> as `cell-${Key}`]?: ((props: import('..').WlTableCellSlotProps<Row, Key>) => unknown) | undefined; };
    emit: {};
}>) => import('vue').VNode & {
    __ctx?: Awaited<typeof __VLS_setup>;
};
export default _default;
type __VLS_PrettifyLocal<T> = {
    [K in keyof T]: T[K];
} & {};

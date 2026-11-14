import { WlNoModelModifiers } from "../model-types.js";
import { WlPt } from "../pt-types.js";
import { WlFileReject } from "../types.js";
type __VLS_Props = {
    /** Modifier flags accepted by the component's typed model contract. */
    modelModifiers?: WlNoModelModifiers;
    /** Type filter (comma-separated extensions/MIME types). */
    accept?: string;
    /**
     * Multiple files (otherwise a new file replaces the current one).
     * @default true
     */
    multiple?: boolean;
    /** File count limit. */
    maxFiles?: number;
    /** Bytes. */
    maxSize?: number;
    /**
     * Disables file selection and drag-and-drop.
     * @default false
     */
    disabled?: boolean;
    /** Create local image previews while files remain selected. */
    preview?: boolean;
    /** Consumer-provided upload status, progress and message for each file. */
    fileState?: (file: File) => {
        progress?: number;
        status?: "pending" | "uploading" | "success" | "error";
        message?: string;
    };
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"fileupload">;
};
type __VLS_Slots = {
    /** Custom selected-file row with removal, preview and status information. */
    row?(props: {
        file: File;
        index: number;
        remove: () => void;
        size: string;
        previewUrl: string | undefined;
        state: {
            progress?: number;
            status?: "pending" | "uploading" | "success" | "error";
            message?: string;
        } | undefined;
    }): unknown;
};
type __VLS_ModelProps = {
    /**
     * v-model — plain File objects. Files are NOT uploaded anywhere:
     * the component only keeps the list; the consumer handles the upload.
     * With multiple=false a new pick replaces the current file.
     */
    modelValue?: File[];
    'modelModifiers'?: Partial<Record<never, true>>;
};
type __VLS_PublicProps = __VLS_Props & __VLS_ModelProps;
declare const __VLS_base: import('vue').DefineComponent<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    accept: undefined;
    multiple: boolean;
    maxFiles: undefined;
    maxSize: undefined;
    disabled: boolean;
}>, unknown, unknown, {}, {}, import('vue').ComponentOptionsMixin, import('vue').ComponentOptionsMixin, {
    reject: (payload: WlFileReject) => void;
    "update:modelValue": (value: File[]) => void;
}, string, import('vue').PublicProps, Readonly<import('vue').ExtractPropTypes<__VLS_WithDefaults<__VLS_TypePropsToOption<__VLS_PublicProps>, {
    accept: undefined;
    multiple: boolean;
    maxFiles: undefined;
    maxSize: undefined;
    disabled: boolean;
}>>> & {
    "onUpdate:modelValue"?: ((value: File[]) => any) | undefined;
    onReject?: ((payload: WlFileReject) => any) | undefined;
}, {
    multiple: boolean;
    accept: string;
    disabled: boolean;
    maxFiles: number;
    maxSize: number;
}, {}>;
declare const __VLS_export: __VLS_WithSlots<typeof __VLS_base, __VLS_Slots>;
declare const _default: typeof __VLS_export;
export default _default;
type __VLS_TypePropsToOption<T> = {
    [K in keyof T & string]-?: {} extends Pick<T, K> ? {
        type: import('vue').PropType<Required<T>[K]>;
    } : {
        type: import('vue').PropType<T[K]>;
        required: true;
    };
};
type __VLS_WithDefaults<P, D> = {
    [K in keyof P & string]: K extends keyof D ? __VLS_PrettifyLocal<P[K] & {
        default: D[K];
    }> : P[K];
};
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
type __VLS_PrettifyLocal<T> = (T extends any ? {
    [K in keyof T]: T[K];
} : {
    [K in keyof T as K]: T[K];
}) & {};

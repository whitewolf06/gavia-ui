import { ComputedRef, Ref } from 'vue';
export declare function useWlInputCounter(model: Ref<string>, attrs: () => Record<string, unknown>, enabled: () => boolean): {
    id: string;
    text: ComputedRef<string>;
    describedBy: ComputedRef<string | undefined>;
};

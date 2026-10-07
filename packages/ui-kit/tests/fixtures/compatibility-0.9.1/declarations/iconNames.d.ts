import { WlIconName } from './icons.generated';
/** A canonical name or a persisted icon identifier from a consumer. */
export type WlIconInput = WlIconName | (string & {});
/** Resolve names for display only; callers retain their original stored value. */
export declare function resolveWlIconName(input?: string | null): WlIconName | undefined;

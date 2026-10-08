/** Built-in modifiers are unsupported on domain, array, date and boolean models. */
export interface WlNoModelModifiers {
  trim?: never;
  number?: never;
  lazy?: never;
}

/** Text fields support Vue's string-preserving trim modifier only. */
export interface WlTextModelModifiers {
  trim?: true;
  number?: never;
  lazy?: never;
}

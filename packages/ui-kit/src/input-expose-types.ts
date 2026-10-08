/** Imperative browser file selection; these methods never upload files. */
export interface WlFilePickerExpose {
  choose(): void;
  clear(): void;
}

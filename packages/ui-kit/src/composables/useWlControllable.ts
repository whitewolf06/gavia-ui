import { computed, shallowRef, type WritableComputedRef } from "vue";

/** Undefined means uncontrolled; the first default is captured once per instance. */
export function useWlControllable<T>(options: {
  value: () => T | undefined;
  defaultValue: T;
  onChange?: (value: T) => void;
}): WritableComputedRef<T> {
  const internal = shallowRef<T>(options.defaultValue);
  return computed({
    get: () => options.value() === undefined ? internal.value : options.value()!,
    set: (value) => {
      if (options.value() === undefined)
        internal.value = value;
      options.onChange?.(value);
    }
  });
}

export function useWlDisclosure(options: {
  value?: () => boolean | undefined;
  defaultValue?: boolean;
  onChange?: (value: boolean) => void;
} = {}) {
  const isOpen = useWlControllable({
    value: options.value ?? (() => undefined),
    defaultValue: options.defaultValue ?? false,
    onChange: options.onChange
  });
  return { isOpen, open: () => {
    isOpen.value = true;
  }, close: () => {
    isOpen.value = false;
  }, toggle: () => {
    isOpen.value = !isOpen.value;
  } };
}

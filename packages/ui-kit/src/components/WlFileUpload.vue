<script setup lang="ts">
import { formatWlLocaleText } from "../locale";
import { useWlLocale } from "../config";
import { computed, ref } from "vue";
import { useNativeFilePicker } from "../composables/useNativeFilePicker";
import WlIcon from "./WlIcon.vue";
import type { WlFileReject, WlFileRejectReason, WlIconName } from "../types";
import type { WlNoModelModifiers } from "../model-types";
const locale = useWlLocale();

const props = withDefaults(
  defineProps<{
    modelModifiers?: WlNoModelModifiers;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    /** Bytes. */
    maxSize?: number;
    disabled?: boolean;
  }>(),
  {
    accept: undefined,
    multiple: true,
    maxFiles: undefined,
    maxSize: undefined,
    disabled: false
  }
);

const emit = defineEmits<{
  reject: [payload: WlFileReject];
}>();

/**
 * v-model — plain File objects. Files are NOT uploaded anywhere:
 * the component only keeps the list; the consumer handles the upload.
 * With multiple=false a new pick replaces the current file.
 */
const model = defineModel<File[], never>({ default: () => [] });

const { input, choose: openPicker, onChange: onPick } = useNativeFilePicker(() => props.disabled, addFiles);
const dragDepth = ref(0);
const dragOver = ref(false);
const errors = ref<Array<{ name: string; message: string }>>([]);
const fileLimit = computed(() => {
  const value = props.maxFiles;
  const limit = value !== undefined && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined;
  return props.multiple ? limit : Math.min(limit ?? 1, 1);
});
const sizeLimit = computed(() => {
  const value = props.maxSize;
  return value !== undefined && Number.isFinite(value) && value >= 0 ? value : undefined;
});

function formatNum(n: number): string {
  const r = n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return String(r).replace(".", locale.value.decimalSeparator);
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} ${locale.value.fileByteUnit}`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${formatNum(kb)} ${locale.value.fileKilobyteUnit}`;
  return `${formatNum(kb / 1024)} ${locale.value.fileMegabyteUnit}`;
}

function reasonMessage(reason: WlFileRejectReason): string {
  if (reason === "type") return locale.value.fileUnsupportedType;
  if (reason === "size") {
    return sizeLimit.value !== undefined ? formatWlLocaleText(locale.value.fileSizeLimit, { size: humanSize(sizeLimit.value) }) : locale.value.fileTooLarge;
  }
  return fileLimit.value !== undefined ? formatWlLocaleText(locale.value.fileCountLimit, { count: fileLimit.value }) : locale.value.fileTooMany;
}

function acceptMatches(file: File): boolean {
  if (!props.accept) return true;
  const parts = props.accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0) return true;
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return parts.some((p) => {
    if (p.startsWith(".")) return name.endsWith(p);
    if (p.endsWith("/*")) return mime.startsWith(p.slice(0, -1));
    return mime === p;
  });
}

function addFiles(list: Iterable<File>): void {
  if (props.disabled) return;
  errors.value = [];
  const next = props.multiple ? [...model.value] : [];
  for (const file of Array.from(list)) {
    let reason: WlFileRejectReason | null = null;
    if (!acceptMatches(file)) reason = "type";
    else if (sizeLimit.value !== undefined && file.size > sizeLimit.value) reason = "size";
    else if (fileLimit.value !== undefined && next.length >= fileLimit.value) reason = "count";

    if (reason) {
      emit("reject", { file, reason });
      errors.value.push({ name: file.name, message: reasonMessage(reason) });
      continue;
    }
    // duplicates (same name + size) are skipped silently
    if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
    next.push(file);
  }
  // A rejected replacement must not discard the previously accepted single file.
  if (props.multiple || next.length > 0) model.value = next;
}

function onDragEnter(event: DragEvent): void {
  event.preventDefault();
  if (props.disabled) return;
  dragDepth.value += 1;
  dragOver.value = true;
}

function onDragOver(event: DragEvent): void {
  event.preventDefault(); // allows the drop
}

function onDragLeave(): void {
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  if (dragDepth.value === 0) dragOver.value = false;
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  dragDepth.value = 0;
  dragOver.value = false;
  if (props.disabled) return;
  const files = event.dataTransfer?.files;
  if (files?.length) addFiles(files);
}

function removeAt(index: number): void {
  if (props.disabled) return;
  const next = model.value.slice();
  next.splice(index, 1);
  model.value = next;
}

function iconFor(file: File): WlIconName {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "music";
  return "file";
}
</script>

<template>
  <div class="wl-upload" data-wl="file-upload" :data-disabled="disabled || undefined">
    <div
      class="wl-upload__drop"
      :class="{ 'is-dragover': dragOver, 'is-disabled': disabled }"
      role="button"
      :aria-label="locale.fileDropLabel"
      :aria-disabled="disabled"
      :tabindex="disabled ? -1 : 0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <WlIcon name="upload" :size="22" class="wl-upload__icon" />
      <span class="wl-upload__text">{{ locale.dropFiles }}</span>
      <span
        class="wl-btn wl-btn--sm wl-upload__btn"
        aria-hidden="true"
      >
        {{ locale.chooseFiles }}
      </span>
      <input
        ref="input"
        type="file"
        class="wl-upload__input"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        tabindex="-1"
        @click.stop
        @change="onPick"
      />
    </div>

    <ul v-if="errors.length" class="wl-upload__errors" role="alert">
      <li v-for="(err, i) in errors" :key="i" class="wl-upload__error">
        <WlIcon name="warn" :size="13" />
        <span class="wl-upload__error-name">{{ err.name }}</span>
        <span>— {{ err.message }}</span>
      </li>
    </ul>

    <ul v-if="model.length" class="wl-upload__list">
      <li v-for="(file, i) in model" :key="`${file.name}:${file.size}:${i}`" class="wl-upload__row">
        <WlIcon :name="iconFor(file)" :size="16" class="wl-upload__file-icon" />
        <span class="wl-upload__name" :title="file.name">{{ file.name }}</span>
        <span class="wl-upload__size">{{ humanSize(file.size) }}</span>
        <button
          type="button"
          class="wl-upload__remove"
          :aria-label="formatWlLocaleText(locale.removeItem, { label: file.name })"
          :disabled="disabled"
          @click="removeAt(i)"
        >
          <WlIcon name="x" :size="13" />
        </button>
      </li>
    </ul>
  </div>
</template>

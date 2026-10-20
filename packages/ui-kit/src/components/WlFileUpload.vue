<script setup lang="ts">
/** WlFileUpload public component contract.
 * @since 0.1.0
 * @slot row - Custom row content.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import type { WlNoModelModifiers } from "../model-types";
import type { WlPt } from "../pt-types";
import type { WlFileReject, WlFileRejectReason, WlIconName } from "../types";
import { useNativeFilePicker } from "../composables/useNativeFilePicker";
import { useWlLocale, useWlPt } from "../config";
import { formatWlLocaleText } from "../locale";
import { formatWlBytes } from "../utils/format";
import { useWlId } from "../utils/useWlId";
import WlIcon from "./WlIcon.vue";
const props = withDefaults(
  defineProps<{
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
    fileState?: (file: File) => { progress?: number; status?: "pending" | "uploading" | "success" | "error"; message?: string };
    /** Attributes and callbacks for the component's documented pass-through sections. */
    pt?: WlPt<"fileupload">;
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
  /** File rejected: { file, reason: "type" | "size" | "count" }. */
  reject: [payload: WlFileReject];
}>();

/**
 * v-model — plain File objects. Files are NOT uploaded anywhere:
 * the component only keeps the list; the consumer handles the upload.
 * With multiple=false a new pick replaces the current file.
 */
const model = defineModel<File[], never>({ default: () => [] });
defineSlots<{
  /** Custom selected-file row with removal, preview and status information. */
  row?(props: {
    file: File;
    index: number;
    remove: () => void;
    size: string;
    previewUrl: string | undefined;
    state: { progress?: number; status?: "pending" | "uploading" | "success" | "error"; message?: string } | undefined;
  }): unknown; }>();

const locale = useWlLocale();
const section = useWlPt("fileupload", computed(() => props.pt));
const uid = useWlId();
const keys = new WeakMap<File, string>();
let nextKey = 0;
function fileKey(file: File): string {
  let key = keys.get(file);
  if (!key) {
    key = `wl-file-${uid}-${++nextKey}`;

    keys.set(file, key);
  }
  return key;
}
const previews = ref(new Map<File, string>());
let mounted = false;
function syncPreviews(): void {
  if (!mounted)
    return;
  const next = new Map(previews.value);
  for (const [file, url] of next) {
    if (props.preview && model.value.includes(file))
      continue;
    URL.revokeObjectURL(url);
    next.delete(file);
  }
  if (props.preview && typeof URL.createObjectURL === "function") {
    for (const file of model.value) {
      if (file.type.startsWith("image/") && !next.has(file))
        next.set(file, URL.createObjectURL(file));
    }
  }
  previews.value = next;
}
watch([() => [...model.value], () => props.preview], syncPreviews);
onMounted(() => {
  mounted = true;

  syncPreviews();
});
onBeforeUnmount(() => {
  for (const url of previews.value.values())
    URL.revokeObjectURL(url);

  previews.value.clear();
});
function progress(file: File): number | undefined {
  const value = props.fileState?.(file)?.progress;
  return value !== undefined && Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : undefined;
}

const { input, choose: openPicker, onChange: onPick } = useNativeFilePicker(() => props.disabled, addFiles);
const dragDepth = ref(0);
const dragOver = ref(false);
const dropTabIndex = computed(() => props.disabled ? -1 : 0);
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

function humanSize(bytes: number): string {
  // Fractional sub-kilobyte limits retain the released raw decimal text in 0.x.
  if (bytes < 1024 && !Number.isInteger(bytes)) return `${bytes} ${locale.value.fileByteUnit}`;
  return formatWlBytes(locale.value.localeCode, bytes, {
    maxUnit: "megabyte",
    unitLabels: { byte: locale.value.fileByteUnit, kilobyte: locale.value.fileKilobyteUnit, megabyte: locale.value.fileMegabyteUnit },
    decimalSeparator: locale.value.decimalSeparator,
    useGrouping: false,
    maximumFractionDigits: (value) => value >= 100 ? 0 : 1
  });
}

function reasonMessage(reason: WlFileRejectReason): string {
  if (reason === "type")
    return locale.value.fileUnsupportedType;
  if (reason === "size") {
    return sizeLimit.value !== undefined
      ? formatWlLocaleText(locale.value.fileSizeLimit, { size: humanSize(sizeLimit.value) })
      : locale.value.fileTooLarge;
  }
  return fileLimit.value !== undefined
    ? formatWlLocaleText(locale.value.fileCountLimit, { count: fileLimit.value })
    : locale.value.fileTooMany;
}

function acceptMatches(file: File): boolean {
  if (!props.accept)
    return true;
  const parts = props.accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (parts.length === 0)
    return true;
  const name = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return parts.some((p) => {
    if (p.startsWith("."))
      return name.endsWith(p);
    if (p.endsWith("/*"))
      return mime.startsWith(p.slice(0, -1));
    return mime === p;
  });
}

function addFiles(list: Iterable<File>): void {
  if (props.disabled)
    return;
  errors.value = [];
  const next = props.multiple ? [...model.value] : [];
  for (const file of Array.from(list)) {
    let reason: WlFileRejectReason | null = null;
    if (!acceptMatches(file))
      reason = "type";
    else
      if (sizeLimit.value !== undefined && file.size > sizeLimit.value)
        reason = "size";
      else
        if (fileLimit.value !== undefined && next.length >= fileLimit.value)
          reason = "count";

    if (reason) {
      emit("reject", { file, reason });
      errors.value.push({ name: file.name, message: reasonMessage(reason) });
      continue;
    }
    // duplicates (same name + size) are skipped silently
    if (next.some((f) => f.name === file.name && f.size === file.size))
      continue;
    next.push(file);
  }
  // A rejected replacement must not discard the previously accepted single file.
  if (props.multiple || next.length > 0)
    model.value = next;
}

function onDragEnter(event: DragEvent): void {
  event.preventDefault();
  if (props.disabled)
    return;
  dragDepth.value += 1;
  dragOver.value = true;
}

function onDragOver(event: DragEvent): void {
  event.preventDefault();
  // allows the drop
}

function onDragLeave(): void {
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  if (dragDepth.value === 0)
    dragOver.value = false;
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  dragDepth.value = 0;
  dragOver.value = false;
  if (props.disabled)
    return;
  const files = event.dataTransfer?.files;
  if (files?.length)
    addFiles(files);
}

function removeAt(index: number): void {
  if (props.disabled)
    return;
  const next = model.value.slice();
  next.splice(index, 1);
  model.value = next;
}

function iconFor(file: File): WlIconName {
  if (file.type.startsWith("image/"))
    return "image";
  if (file.type.startsWith("audio/"))
    return "music";
  return "file";
}
</script>

<template>
  <div
    v-bind="section('root')"
    class="wl-upload"
    data-wl="file-upload"
    :data-disabled="disabled || undefined"
  >
    <!-- The accessibility rule cannot resolve bound tabindex; the keyboard contract tests both states. -->
    <!-- eslint-disable-next-line vuejs-accessibility/interactive-supports-focus -->
    <div
      v-bind="section('drop')"
      class="wl-upload__drop"
      :class="{ 'is-dragover': dragOver, 'is-disabled': disabled }"
      role="button"
      :aria-label="locale.fileDropLabel"
      :aria-disabled="disabled"
      :tabindex="dropTabIndex"
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
        v-bind="section('input')"
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

    <ul
      v-if="errors.length"
      v-bind="section('errors')"
      class="wl-upload__errors"
      role="alert"
    >
      <li v-for="(err, i) in errors" :key="i" class="wl-upload__error">
        <WlIcon name="warn" :size="13" />
        <span class="wl-upload__error-name">{{ err.name }}</span>
        <span>— {{ err.message }}</span>
      </li>
    </ul>

    <ul v-if="model.length" v-bind="section('list')" class="wl-upload__list">
      <li
        v-for="(file, i) in model"
        :key="fileKey(file)"
        v-bind="section('row')"
        class="wl-upload__row"
        :data-status="fileState?.(file)?.status"
      >
        <slot
          name="row"
          :file="file"
          :index="i"
          :remove="() => removeAt(i)"
          :size="humanSize(file.size)"
          :preview-url="previews.get(file)"
          :state="fileState?.(file)"
        >
          <img
            v-if="previews.get(file)"
            v-bind="section('preview')"
            class="wl-upload__preview"
            :src="previews.get(file)"
            alt=""
          />
          <WlIcon :name="iconFor(file)" :size="16" class="wl-upload__file-icon" />
          <span class="wl-upload__name" :title="file.name">{{ file.name }}</span>
          <span class="wl-upload__size">{{ humanSize(file.size) }}</span>
          <progress
            v-if="progress(file) !== undefined"
            v-bind="section('progress')"
            class="wl-upload__progress"
            :value="progress(file)"
            max="100"
            :aria-label="formatWlLocaleText(locale.fileProgress, { name: file.name })"
          ></progress>
          <span v-if="fileState?.(file)?.message" class="wl-upload__message">{{ fileState?.(file)?.message }}</span>
          <button
            v-bind="section('removeButton')"
            type="button"
            class="wl-upload__remove"
            :aria-label="formatWlLocaleText(locale.removeItem, { label: file.name })"
            :disabled="disabled"
            @click="removeAt(i)"
          >
            <WlIcon name="x" :size="13" />
          </button>
        </slot>
      </li>
    </ul>
  </div>
</template>

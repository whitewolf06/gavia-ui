<script setup lang="ts">
import { ref } from "vue";
import WlIcon from "./WlIcon.vue";
import type { WlFileReject, WlFileRejectReason, WlIconName } from "../types";

const props = withDefaults(
  defineProps<{
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
const model = defineModel<File[]>({ default: () => [] });

const input = ref<HTMLInputElement | null>(null);
const dragDepth = ref(0);
const dragOver = ref(false);
const errors = ref<Array<{ name: string; message: string }>>([]);

function formatNum(n: number): string {
  const r = n >= 100 ? Math.round(n) : Math.round(n * 10) / 10;
  return String(r).replace(".", ",");
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${formatNum(kb)} КБ`;
  return `${formatNum(kb / 1024)} МБ`;
}

function reasonMessage(reason: WlFileRejectReason): string {
  if (reason === "type") return "неподдерживаемый тип";
  if (reason === "size") {
    return props.maxSize !== undefined ? `больше ${humanSize(props.maxSize)}` : "слишком большой";
  }
  return props.maxFiles !== undefined ? `лимит — не больше ${props.maxFiles}` : "слишком много файлов";
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
    else if (props.maxSize !== undefined && file.size > props.maxSize) reason = "size";
    else if (props.maxFiles !== undefined && next.length >= props.maxFiles) reason = "count";

    if (reason) {
      emit("reject", { file, reason });
      errors.value.push({ name: file.name, message: reasonMessage(reason) });
      continue;
    }
    // duplicates (same name + size) are skipped silently
    if (next.some((f) => f.name === file.name && f.size === file.size)) continue;
    next.push(file);
  }
  model.value = next;
}

function openPicker(): void {
  if (props.disabled) return;
  input.value?.click();
}

function onPick(event: Event): void {
  const target = event.target as HTMLInputElement;
  if (target.files?.length) addFiles(target.files);
  target.value = ""; // picking the same file again still fires change
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
      :aria-disabled="disabled"
      tabindex="0"
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
      @keydown.space.prevent="openPicker"
      @dragenter="onDragEnter"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <WlIcon name="upload" :size="22" class="wl-upload__icon" />
      <span class="wl-upload__text">Перетащите файлы сюда или</span>
      <button
        type="button"
        class="wl-btn wl-btn--sm wl-upload__btn"
        :disabled="disabled"
        @click.stop="openPicker"
      >
        Выбрать файлы
      </button>
      <input
        ref="input"
        type="file"
        class="wl-upload__input"
        :accept="accept"
        :multiple="multiple"
        :disabled="disabled"
        tabindex="-1"
        @change="onPick"
      />
    </div>

    <ul v-if="errors.length" class="wl-upload__errors">
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
          :aria-label="`Удалить ${file.name}`"
          @click="removeAt(i)"
        >
          <WlIcon name="x" :size="13" />
        </button>
      </li>
    </ul>
  </div>
</template>

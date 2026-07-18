<script setup lang="ts">
import { computed, ref } from "vue";
import Menu from "primevue/menu";
import WlIcon from "./WlIcon.vue";
import type { WlIconName, WlMenuItem } from "../types";

const props = withDefaults(
  defineProps<{
    items?: WlMenuItem[];
    popup?: boolean;
    pt?: Record<string, unknown>;
  }>(),
  {
    items: () => [],
    popup: false
  }
);

interface MenuModelItem {
  label?: string;
  icon?: string;
  disabled?: boolean;
  separator?: boolean;
  shortcut?: string;
  danger?: boolean;
  items?: MenuModelItem[];
  class?: string;
  command?: () => void;
}

/** Flat { header / separator / item } list → PrimeVue's nested group model. */
const model = computed<MenuModelItem[]>(() => {
  const out: MenuModelItem[] = [];
  let group: MenuModelItem | null = null;
  for (const item of props.items) {
    if (item.header !== undefined) {
      group = { label: item.header, items: [] };
      out.push(group);
      continue;
    }
    const target = group && group.items ? group.items : out;
    if (item.separator) {
      target.push({ separator: true });
      continue;
    }
    target.push({
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      shortcut: item.shortcut,
      danger: item.danger,
      class: item.danger ? "is-danger" : undefined,
      command: item.command ? () => item.command?.(item) : undefined
    });
  }
  return out;
});

const menuRef = ref<InstanceType<typeof Menu> | null>(null);

function toggle(event: Event): void {
  (menuRef.value as unknown as { toggle: (e: Event) => void } | null)?.toggle(event);
}
function show(event: Event): void {
  (menuRef.value as unknown as { show: (e: Event) => void } | null)?.show(event);
}
function hide(): void {
  (menuRef.value as unknown as { hide: () => void } | null)?.hide();
}

defineExpose({ toggle, show, hide });
</script>

<template>
  <Menu ref="menuRef" :model="model" :popup="popup" :pt="pt" class="wl-menu" data-wl="menu">
    <template #item="{ item, props: itemProps }">
      <a
        v-bind="itemProps.action"
        class="wl-menu__link"
        :class="{ 'is-danger': item.danger, 'is-disabled': item.disabled }"
      >
        <WlIcon v-if="item.icon" :name="(item.icon as WlIconName)" :size="16" class="wl-menu__icon" />
        <span class="wl-menu__label">{{ item.label }}</span>
        <span v-if="item.shortcut" class="wl-menu__meta">{{ item.shortcut }}</span>
      </a>
    </template>
  </Menu>
</template>

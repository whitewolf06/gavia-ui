<script setup lang="ts">
import type { WlComponentManifest } from "../../../../packages/ui-kit/src/manifest";
import { propDefault, propType, type DocumentationPtSection } from "./catalog";

defineProps<{
  entry: WlComponentManifest;
  ptSections?: readonly DocumentationPtSection[];
  ptKey?: string;
  anchors?: Partial<Record<"props" | "events" | "slots" | "pt", string>>;
}>();
</script>

<template>
  <div class="docs-contract wl-stack" data-space="xl">
    <section class="wl-stack" data-space="md">
      <h2 :id="anchors?.props" class="wl-text-heading">Props</h2>
      <p class="wl-text-small wl-text-muted">Типы, допустимые значения и значения по умолчанию взяты из публичного манифеста. «—» означает, что prop не задан.</p>
      <p v-if="entry.model" class="docs-model">
        <code>v-model{{ entry.model.name === 'modelValue' ? '' : ':' + entry.model.name }}: {{ entry.model.type }}</code>
        <span v-if="entry.model.description">{{ entry.model.description }}</span>
      </p>
      <div v-if="entry.props.length" class="docs-table-scroll" tabindex="0" role="region" :aria-label="'Props ' + entry.name">
        <table class="docs-contract-table">
          <thead><tr><th scope="col">Prop</th><th scope="col">Тип / значения</th><th scope="col">По умолчанию</th><th scope="col">Назначение</th></tr></thead>
          <tbody>
            <tr v-for="prop in entry.props" :key="prop.name" :data-prop="prop.name">
              <th scope="row"><code>{{ prop.name }}{{ prop.required ? ' *' : '' }}</code></th>
              <td><code>{{ propType(prop) }}</code></td>
              <td><code>{{ propDefault(prop) }}</code></td>
              <td>{{ prop.description ?? '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="wl-text-small wl-text-muted">Публичных props нет.</p>
    </section>

    <section class="wl-stack" data-space="md">
      <h2 :id="anchors?.events" class="wl-text-heading">События</h2>
      <div v-if="entry.emits.length" class="docs-table-scroll" tabindex="0" role="region" :aria-label="'События ' + entry.name">
        <table class="docs-contract-table">
          <thead><tr><th scope="col">Событие</th><th scope="col">Payload</th><th scope="col">Когда возникает</th></tr></thead>
          <tbody><tr v-for="event in entry.emits" :key="event.name"><th scope="row"><code>{{ event.name }}</code></th><td><code>{{ event.payload ?? '—' }}</code></td><td>{{ event.description ?? '—' }}</td></tr></tbody>
        </table>
      </div>
      <p v-else class="wl-text-small wl-text-muted">Публичных событий нет.</p>
    </section>

    <section class="wl-stack" data-space="md">
      <h2 :id="anchors?.slots" class="wl-text-heading">Слоты</h2>
      <div v-if="entry.slots.length" class="docs-table-scroll" tabindex="0" role="region" :aria-label="'Слоты ' + entry.name">
        <table class="docs-contract-table">
          <thead><tr><th scope="col">Слот</th><th scope="col">Содержимое</th></tr></thead>
          <tbody><tr v-for="slot in entry.slots" :key="slot.name"><th scope="row"><code>{{ slot.name }}</code></th><td>{{ slot.description ?? '—' }}</td></tr></tbody>
        </table>
      </div>
      <p v-else class="wl-text-small wl-text-muted">Публичных слотов нет.</p>
    </section>

    <section v-if="ptSections?.length" class="wl-stack" data-space="md">
      <h2 :id="anchors?.pt" class="wl-text-heading">Pass-through: pt</h2>
      <p class="wl-text-small wl-text-muted">Секции {{ entry.name }} перечислены ниже. Атрибуты объединяются в порядке <code>createWlPt()</code> → <code>WlConfig.pt{{ ptKey ? '.' + ptKey : '' }}</code> → <code>pt</code> экземпляра. Class и style объединяются; последнее заданное значение другого атрибута имеет приоритет.</p>
      <div class="docs-table-scroll" tabindex="0" role="region" :aria-label="'PT ' + entry.name">
        <table class="docs-contract-table">
          <thead><tr><th scope="col">Секция</th><th scope="col">DOM</th><th scope="col">Назначение</th></tr></thead>
          <tbody><tr v-for="section in ptSections" :key="section.name"><th scope="row"><code>{{ section.name }}</code></th><td><code>{{ section.element }}</code></td><td>{{ section.description }}</td></tr></tbody>
        </table>
      </div>
      <p v-if="entry.name !== 'WlButton'" class="wl-text-small wl-text-muted">Секции относятся к DOM компонента. Названия с точкой указывают группу конфигурации и её секцию; составные части используют свои pt-группы. Глобальные и локальные атрибуты объединяются, а class и style дополняются.</p>
      <p v-if="entry.name === 'WlButton'" class="wl-text-small wl-text-muted">Иконка передаётся через слот <code>icon</code>; отдельной pt-секции для неё нет. Class, style, aria-* и data-* можно передать самой кнопке. Корень сохраняет <code>data-wl="button"</code>, <code>data-variant</code>, <code>data-size</code> и <code>data-density</code>.</p>
    </section>
  </div>
</template>

<style>
.docs-contract { min-width: 0; }
.docs-table-scroll { max-width: 100%; min-width: 0; overflow: auto; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); }
.docs-table-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.docs-contract-table { width: 100%; border-collapse: collapse; font-size: var(--wl-type-small-size); line-height: var(--wl-type-small-line-height); text-align: left; }
.docs-contract-table th, .docs-contract-table td { padding: var(--wl-space-md); border-bottom: 1px solid var(--wl-border); vertical-align: top; min-width: 110px; overflow-wrap: anywhere; }
.docs-contract-table thead { background: var(--wl-bg-soft); }
.docs-contract-table tbody tr:last-child th, .docs-contract-table tbody tr:last-child td { border-bottom: 0; }
.docs-contract-table code { font-family: var(--wl-mono); white-space: normal; }
.docs-model { display: grid; gap: var(--wl-space-xs); padding: var(--wl-space-md); background: var(--wl-bg-soft); border-radius: var(--wl-corner-control); font-size: var(--wl-type-small-size); overflow-wrap: anywhere; }
</style>

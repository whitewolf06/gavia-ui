import assert from "node:assert/strict";
import { test } from "node:test";
import { extractComponentApi } from "./sync-api.mjs";

test("retains generic unions, callbacks and model names without evaluating source", () => {
  const metadata = extractComponentApi(`<script setup lang="ts" generic="T extends Record<string, unknown>>">
  const props = withDefaults(defineProps<{ rows?: readonly T[]; resolve?: (row: T) => string; placement?: "top" | "bottom" }>(), { rows: () => [] });
  const model = defineModel<T | null>();
  const sort = defineModel<{ key: string }>("sort");
  defineSlots<{ row?(props: { row: T; index: number }): unknown }>();
  defineEmits<{ complete: [query: string] }>();
  throw new Error("must never evaluate");
  </script>`);
  assert.equal(metadata.props.rows, "readonly T[]");
  assert.equal(metadata.props.resolve, "(row: T) => string");
  assert.equal(metadata.props.placement, '"top" | "bottom"');
  assert.equal(metadata.models.sort, "{ key: string }");
  assert.equal(metadata.models.modelValue, "T | null");
  assert.match(metadata.slots.row, /row: T/);
  assert.equal(metadata.emits.complete, "[query: string]");
});

test("fails explicitly for an unsupported source instead of generating empty docs", () => {
  assert.throws(() => extractComponentApi("<template></template>"), /Missing setup script/);
});

test("resolves local prop interfaces and literal defaults without executing factories", () => {
  const metadata = extractComponentApi(`<script setup lang="ts">
    interface Props { /** Accessible name. */ label: string; disabled?: boolean; count?: number; rows?: string[] }
    withDefaults(defineProps<Props>(), { disabled: false, count: 3, rows: () => [] });
    defineModel<string[]>("selection", { default: () => [] });
    defineEmits<{ (event: "change", value: string): void }>();
  </script>`);
  assert.deepEqual(metadata.required, ["label"]);
  assert.deepEqual(metadata.defaults, { disabled: false, count: 3, rows: [], selection: [] });
  assert.equal(metadata.descriptions.label, "Accessible name.");
  assert.equal(metadata.emits.change, "[value: string]");
});

test("reads imported generic slot contracts and dynamic slot names without evaluating modules", () => {
  const metadata = extractComponentApi(`<script setup lang="ts" generic="Row extends object">
    import type { Slots as TableSlots } from "./table-types";
    defineSlots<TableSlots<Row>>();
  </script>`, "/fixtures/Table.vue", (path) => path.replaceAll("\\", "/").endsWith("/table-types.ts")
    ? `
    export type Slots<Row> = {
      /** Replacement for empty rows. */ empty?: (props: {}) => unknown;
      /** The current row. */ [name: \`cell-\${string}\`]: ((props: { row: Row }) => unknown) | undefined;
    } & { caption?(props: {}): unknown } & {
      /** Preserve each known field value. */
      [Key in keyof Row as \`cell-\${Key & string}\`]?: (props: { row: Row; value: Row[Key] }) => unknown;
    };
    throw new Error("do not execute imported modules");
  `
    : undefined);
  assert.match(metadata.slots.empty, /props: \{\}/);
  assert.match(metadata.slots["cell-${string}"], /row: Row/);
  assert.match(metadata.slots.caption, /caption/);
  assert.match(metadata.slots["cell-${Key & string}"], /value: Row\[Key\]/);
  assert.equal(metadata.slotDescriptions["cell-${Key & string}"], "Preserve each known field value.");
  assert.equal(metadata.slotDescriptions.empty, "Replacement for empty rows.");
  assert.equal(metadata.slotDescriptions["cell-${string}"], "The current row.");
});

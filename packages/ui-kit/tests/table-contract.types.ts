/** Compile-only table contracts; execution is deferred until explicitly requested. */
import { WlTable } from "../src";
import type { WlTableColumn, WlTableRow, WlTableCellSlotProps, WlTableSlots } from "../src";
import Consumer from "./fixtures/table-contract-consumer.vue";

// No dictionary index signature: spelling checks must work on ordinary interfaces.
interface Person { id: number; name: string; score: number; note?: string; }
type PersonProps = Parameters<typeof WlTable<Person>>[0];
type LegacyProps = Parameters<typeof WlTable<WlTableRow>>[0];
type NameScope = Parameters<NonNullable<WlTableSlots<Person>["cell-name"]>>[0];
type ScoreScope = Parameters<NonNullable<WlTableSlots<Person>["cell-score"]>>[0];

export function tableConsumerTypes(): void {
  const rows: readonly Person[] = [{ id: 1, name: "Дмитрий", score: 8 }];
  const columns = [{ key: "name", label: "Имя" }, { key: "score", label: "Оценка", numeric: true }] as const satisfies readonly WlTableColumn<Person>[];
  const props: PersonProps = { value: rows, columns };
  const virtualColumns = [{ key: "name", label: "Имя" }, { key: "actions", label: "Действия", kind: "virtual" }] as const satisfies readonly WlTableColumn<Person, "actions">[];
  const virtualProps: PersonProps = { value: rows, columns: virtualColumns };
  const legacyRows: WlTableRow[] = [{ name: "Дмитрий", score: 8 }];
  const legacyColumns: WlTableColumn[] = [{ key: "actions", label: "Действия" }];
  const legacyProps: LegacyProps = { value: legacyRows, columns: legacyColumns };
  const nameScope: NameScope = { row: rows[0]!, value: "Дмитрий" };
  const scoreScope: ScoreScope = { row: rows[0]!, value: 8 };
  const optionalScope: WlTableCellSlotProps<Person, "note"> = { row: rows[0]!, value: undefined };
  // @ts-expect-error Field spelling is checked in the component prop, not only in a helper.
  const typoProps: PersonProps = { value: rows, columns: [{ key: "naem", label: "Имя" }] };
  // @ts-expect-error An undeclared field cannot silently become a virtual column.
  const implicitVirtual: PersonProps = { value: rows, columns: [{ key: "actions", label: "Действия" }] };
  // @ts-expect-error Broad dictionary columns cannot bypass a known interface row contract.
  const broadBypass: PersonProps = { value: rows, columns: legacyColumns };
  // @ts-expect-error An explicit virtual key domain is still checked.
  const wrongVirtual: WlTableColumn<Person, "actions"> = { key: "other", label: "Other", kind: "virtual" };
  // @ts-expect-error Rows keep their consumer interface.
  const wrongRows: PersonProps = { value: [{ id: "one", name: "Дмитрий", score: 8 }] };
  // @ts-expect-error Known name slots do not become an all-column union or unknown.
  const wrongName: NameScope = { row: rows[0]!, value: 8 };
  // @ts-expect-error Known score slots remain numeric.
  const wrongScore: ScoreScope = { row: rows[0]!, value: "eight" };
  // @ts-expect-error Cell row fields remain checked.
  const wrongRow: WlTableCellSlotProps<Person, "score"> = { row: { id: 1, name: "Дмитрий", score: "eight" }, value: 8 };
  void [props, virtualProps, legacyProps, nameScope, scoreScope, optionalScope, typoProps, implicitVirtual, broadBypass, wrongVirtual, wrongRows, wrongName, wrongScore, wrongRow, Consumer];
}

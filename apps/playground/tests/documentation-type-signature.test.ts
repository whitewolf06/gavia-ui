import { describe, expect, it } from "vitest";
import { formatDocumentationType } from "../src/documentation/type-signature";

describe("public API type presentation", () => {
  it.each([
    ["NoInfer<TOption>", "TOption"],
    ["ReadonlyArray<NoInfer<Record<string, NoInfer<TValue>>>>", "ReadonlyArray<Record<string, TValue>>"],
    ['NoInfer<() => Array<NoInfer<T>>> | "NoInfer<T>"', '() => Array<T> | "NoInfer<T>"'],
    ['CustomNoInfer<T> | NoInfer<"x>y" | "a,b">', 'CustomNoInfer<T> | "x>y" | "a,b"']
  ])("hides inference wrappers while preserving %s", (typescriptType, expected) => {
    expect(formatDocumentationType(typescriptType)).toBe(expected);
  });

  it("retains literal unions and unannotated types", () => {
    expect(formatDocumentationType('"info" | "danger"')).toBe('"info" | "danger"');
    expect(formatDocumentationType("boolean")).toBe("boolean");
  });

  it("preserves namespace members and incomplete type source", () => {
    expect(formatDocumentationType("Custom.NoInfer<T> | NoInfer<U>")).toBe("Custom.NoInfer<T> | U");
    expect(formatDocumentationType("NoInfer<Array<T>")).toBe("NoInfer<Array<T>");
    expect(formatDocumentationType('NoInfer<"unterminated>')).toBe('NoInfer<"unterminated>');
  });
});

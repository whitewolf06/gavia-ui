interface SegmenterLike {
  segment: (value: string) => Iterable<{ segment: string }>;
}

function firstGrapheme(value: string): string {
  const Constructor = (Intl as unknown as {
    Segmenter?: new (locale?: string, options?: { granularity: string }) => SegmenterLike;
  }).Segmenter;
  if (Constructor) return new Constructor(undefined, { granularity: "grapheme" }).segment(value)[Symbol.iterator]().next().value?.segment ?? "";
  return Array.from(value)[0] ?? "";
}

export function getWlInitials(name: string, max = 2): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const count = Math.max(1, Math.floor(max));
  const selected = words.length > 1 && count === 2 ? [words[0]!, words[words.length - 1]!] : words.slice(0, count);
  return selected.map(firstGrapheme).join("").toLocaleUpperCase();
}

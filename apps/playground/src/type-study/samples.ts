export type SpecimenLanguage = "ru" | "en";

export interface TextSample {
  headings: string;
  body: string;
  line: string;
}
export const samples: Readonly<Record<SpecimenLanguage, TextSample>> = {
  ru: {
    headings: "Шрифт для интерфейсов\nЗаголовки, абзацы и подписи\nПроверьте шрифт на своём тексте",
    body: "Gavia Sans используется для заголовков, абзацев и коротких подписей. В семействе шесть весов: Thin, Light, Regular, Medium, SemiBold и Bold. Для каждого есть прямое и наклонное начертание. Шрифт содержит кириллицу, латиницу, цифры, знаки препинания и валют.\n\nВыберите вес и размер, затем посмотрите на несколько строк подряд. Сравните короткую подпись с длинным предложением. Обратите внимание на похожие знаки: букву O и цифру 0, латинские I и l, цифру 1. Для таблиц и сумм используйте табличные цифры одинаковой ширины, для чисел в тексте можно выбрать пропорциональные.",
    line: "Сохранить проект · Настройки · Поиск · 12 480 ₽ · 06.10.2026 · Ёё Йй"
  },
  en: {
    headings: "A typeface for interfaces\nHeadings, paragraphs and labels\nTry the typeface with your own text",
    body: "Gavia Sans is used for headings, paragraphs and short labels. The family has six weights: Thin, Light, Regular, Medium, SemiBold and Bold. Each has upright and oblique styles. The typeface includes Cyrillic, Latin, numerals, punctuation and currency symbols.\n\nChoose a weight and size, then look at several lines together. Compare a short label with a longer sentence. Look at similar characters: the letter O and numeral 0, the letters I and l, and numeral 1. Use equal-width tabular numerals for tables and amounts, or proportional numerals for numbers within text.",
    line: "Save project · Settings · Search · €128.40 · 06 Oct 2026 · I l 1 O 0"
  }
};

export type SpecimenLanguage = "ru" | "en";

export interface TextSample {
  headings: string;
  body: string;
  line: string;
}
export const samples: Readonly<Record<SpecimenLanguage, TextSample>> = {
  ru: {
    headings: "Ясность в каждой детали\nСеверный ритм. Чистая геометрия.\nПространство для важных решений",
    body: "Гагара скользит по спокойной воде. Её силуэт собран и точен: плавная линия шеи, уверенное движение и ничего лишнего. Этот ритм мы ищем в Gavia Sans — ясные формы, ровные пропорции и свободное пространство между буквами.\n\nХороший интерфейс помогает замечать главное. Заголовки задают порядок, текст читается легко, а кнопки подсказывают следующий шаг. Шрифт должен одинаково уверенно звучать в короткой подписи, длинном абзаце и строке с числами.",
    line: "Сохранить проект · Настройки · Поиск · 12 480 ₽ · 06.10.2026 · Ёё Йй"
  },
  en: {
    headings: "Clarity in every detail\nNorthern rhythm. Pure geometry.\nSpace for thoughtful decisions",
    body: "A loon glides across still water. Its silhouette is precise and composed: a flowing neck, a steady movement, every detail in place. This is the rhythm we want for Gavia Sans — clear forms, balanced proportions and room for letters to breathe.\n\nA good interface brings the essentials into focus. Headings establish order, paragraphs feel easy to read, and buttons make the next step clear. The typeface should feel equally confident in a short label, a longer passage and a row of numbers.",
    line: "Save project · Settings · Search · €128.40 · 06 Oct 2026 · I l 1 O 0"
  }
};

export type GaviaFontStyle = "normal" | "italic";
export type GaviaFontWeight = 100 | 300 | 400 | 500 | 600 | 700;

export const gaviaFontFamily = '"Gavia", "Segoe UI", Arial, sans-serif';
export const gaviaRelease = "0.6";
export const gaviaWeights = [
  { value: 100, name: "Thin", ru: "Тонкий" },
  { value: 300, name: "Light", ru: "Лёгкий" },
  { value: 400, name: "Regular", ru: "Обычный" },
  { value: 500, name: "Medium", ru: "Средний" },
  { value: 600, name: "SemiBold", ru: "Полужирный" },
  { value: 700, name: "Bold", ru: "Жирный" }
] as const;

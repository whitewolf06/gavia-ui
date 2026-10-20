const derivatives = import.meta.glob<string>("./*.webp", { eager: true, query: "?url", import: "default" });
type BrandImage = "gavia-lake-hero-v2" | "gavia-lake-night-v2" | "gavia-forest-card-v1" | "gavia-reeds-card-v1";

/** Eager URL strings do not request image bytes; the browser selects one candidate. */
export function responsiveBrandSet(name: BrandImage, original: string): string {
  return [...[640, 1024, 1600].map((width) => {
    const url = derivatives[`./${name}-${width}.webp`];
    if (!url) throw new Error("Missing responsive image: " + name + " " + width);
    return url + " " + width + "w";
  }), original + " 2172w"].join(", ");
}

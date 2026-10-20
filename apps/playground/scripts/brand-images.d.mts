export function checkBrandImages(workspace?: string): Promise<{
  images: { file: string; source: string; sourceSha256: string; sha256: string; width: number; height: number; bytes: number }[];
}>;

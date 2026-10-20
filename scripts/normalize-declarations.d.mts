export interface DeclarationPaths { sourceRoot: string; outDir: string }
export function declarationSpecifier(specifier: string, filePath: string, options: DeclarationPaths): string;
export function normalizeDeclarationSpecifiers(content: string, filePath: string, options: DeclarationPaths): string;

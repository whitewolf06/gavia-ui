const layers = ["foundation", "semantic", "component"];
const types = ["color", "dimension", "number", "fontFamily", "duration", "shadow", "string"];
const tokenPattern = /var\((--wl-[a-z0-9-]+)\)/g;

export function resolveToken(catalog, name, theme = "white", trail = []) {
  if (trail.includes(name)) throw new Error(`Circular token reference: ${[...trail, name].join(" -> ")}`);
  const token = catalog.tokens.find((item) => item.name === name);
  if (!token) throw new Error(`Unknown token: ${name}`);
  const value = token.themes?.[theme] ?? token.value;
  return value.replace(tokenPattern, (_, reference) => resolveToken(catalog, reference, theme, [...trail, name]));
}

export function contrastRatio(foreground, background) {
  function luminance(color) {
    if (!/^#[0-9a-f]{6}$/i.test(color)) throw new Error(`Contrast color must be an opaque hex value: ${color}`);
    const channels = [1, 3, 5].map((start) => parseInt(color.slice(start, start + 2), 16) / 255)
      .map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function validateCatalog(catalog) {
  if (catalog.schemaVersion !== 1) throw new Error("Unsupported token schemaVersion");
  const themes = catalog.themes.map((theme) => theme.name);
  if (themes.slice().sort().join(",") !== "gavia,graphite,newspaper,white"
    || catalog.themes.some((theme) => !theme.label || !theme.description || !["light", "dark"].includes(theme.colorScheme))) {
    throw new Error("Invalid theme catalog");
  }
  const names = new Set();
  for (const token of catalog.tokens) {
    if (!/^--wl-[a-z0-9-]+$/.test(token.name) || names.has(token.name)) throw new Error(`Invalid or duplicate token: ${token.name}`);
    names.add(token.name);
    if (!layers.includes(token.layer) || !types.includes(token.type) || !token.category || !token.description) {
      throw new Error(`Missing token metadata: ${token.name}`);
    }
    for (const [theme, value] of Object.entries({ default: token.value, ...token.themes })) {
      if (theme !== "default" && !themes.includes(theme)) throw new Error(`Unknown theme ${theme} for ${token.name}`);
      if (typeof value !== "string" || !value.trim() || /[;{}@]|\/\*|\*\/|url\(|var\(\s*--(?!wl-)/i.test(value)) {
        throw new Error(`Invalid value for ${token.name}`);
      }
      const references = [...value.matchAll(tokenPattern)].map((match) => match[1]);
      if (/var\(/i.test(value.replace(tokenPattern, ""))) throw new Error(`Unsupported token reference syntax: ${token.name}`);
      if (token.layer !== "foundation" && references.length === 0) throw new Error(`Role token must reference a token: ${token.name}`);
      for (const reference of references) {
        const target = catalog.tokens.find((item) => item.name === reference);
        if (!target) throw new Error(`Unknown reference ${reference} in ${token.name}`);
        if (layers.indexOf(target.layer) > layers.indexOf(token.layer)) throw new Error(`Token layer inversion: ${token.name} -> ${reference}`);
        if (token.layer === "component" && target.layer !== "semantic") throw new Error(`Component token must reference semantic: ${token.name}`);
      }
    }
    const formats = {
      color: /^(#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\([\d.,%\s]+\)|transparent)$/i,
      dimension: /^-?(?:\d+\.?\d*|\.\d+)(?:px|rem|em|vh|vw|%|ch)?$/,
      number: /^-?(?:\d+\.?\d*|\.\d+)$/,
      duration: /^(?:\d+\.?\d*|\.\d+)(?:ms|s)$/
    };
    for (const theme of themes) {
      const value = resolveToken(catalog, token.name, theme);
      if (formats[token.type] && !formats[token.type].test(value)) throw new Error(`Invalid ${token.type} value for ${token.name}: ${value}`);
    }
  }
  for (const token of Object.values(catalog.spacing)) {
    if (!names.has(token)) throw new Error(`Unknown spacing token: ${token}`);
  }
  const roleNames = new Set();
  for (const role of catalog.typography) {
    if (!/^[a-z][a-z-]*$/.test(role.name) || roleNames.has(role.name) || !role.label || !role.description) throw new Error("Invalid typography role");
    roleNames.add(role.name);
    for (const key of ["fontSize", "lineHeight", "fontWeight", "fontFamily"]) {
      if (!names.has(role[key])) throw new Error(`Unknown typography token: ${role[key]}`);
    }
  }
  const breakpointValues = Object.values(catalog.breakpoints);
  if (breakpointValues.some((value, index) => !Number.isInteger(value) || value <= 0 || (index > 0 && value <= breakpointValues[index - 1]))) {
    throw new Error("Breakpoints must be increasing positive integers");
  }
  const contrast = [];
  const contrastNames = new Set();
  for (const pair of catalog.contrast) {
    if (!pair.name || !pair.label || contrastNames.has(pair.name) || !(pair.minimum >= 3 && pair.minimum <= 21)) throw new Error("Invalid contrast pair");
    contrastNames.add(pair.name);
  }
  for (const theme of themes) {
    for (const pair of catalog.contrast) {
      const ratio = contrastRatio(resolveToken(catalog, pair.foreground, theme), resolveToken(catalog, pair.background, theme));
      if (ratio < pair.minimum) throw new Error(`Contrast fails: ${theme}/${pair.name} ${ratio.toFixed(2)} < ${pair.minimum}`);
      contrast.push({ ...pair, theme, ratio: Math.round(ratio * 100) / 100 });
    }
  }
  return contrast;
}

export function renderTokenCss(catalog) {
  const lines = ["/* @wl-tokens:start — generated by tokens:sync */", "@layer wl.tokens {", "  :root {"];
  for (const layer of layers) {
    lines.push(`    /* ${layer} */`);
    for (const token of catalog.tokens.filter((item) => item.layer === layer)) lines.push(`    ${token.name}: ${token.value};`);
  }
  lines.push("  }", "}", "/* @wl-tokens:end */");
  return lines.join("\n");
}

export function renderThemeCss(catalog, theme) {
  const selector = theme.name === "white" ? ':root,\n[data-wl-theme="white"]' : `[data-wl-theme="${theme.name}"]`;
  const lines = [`/* Gavia UI ${theme.label} — generated by tokens:sync. */`, "@layer wl.tokens {", `${selector} {`];
  lines.push(`  color-scheme: ${theme.colorScheme};`);
  for (const token of catalog.tokens) {
    lines.push(`  ${token.name}: ${token.themes?.[theme.name] ?? token.value};`);
  }
  lines.push("}", "@media (prefers-reduced-motion: reduce) {", `${selector} {`);
  for (const token of catalog.tokens.filter((item) => /^--wl-dur-[1-5]$/.test(item.name))) {
    lines.push(`  ${token.name}: 0.01ms;`);
  }
  lines.push("}", "}", "}", "");
  return lines.join("\n");
}

export function renderTokenModule(catalog, contrast) {
  return `// Generated by tokens:sync. Edit tokens/source.json.\nimport type { WlDesignTokenDefinition, WlDesignTheme, WlTypographyRole, WlContrastPair } from "./types";\n\nexport const wlDesignTokens = ${JSON.stringify(catalog.tokens, null, 2)} as const satisfies readonly WlDesignTokenDefinition[];\nexport type WlDesignTokenName = (typeof wlDesignTokens)[number]["name"];\n\nexport const wlDesignThemes = ${JSON.stringify(catalog.themes, null, 2)} as const satisfies readonly WlDesignTheme[];\nexport const wlSpacing = ${JSON.stringify(catalog.spacing, null, 2)} as const;\nexport type WlSpace = keyof typeof wlSpacing;\nexport const wlTypography = ${JSON.stringify(catalog.typography, null, 2)} as const satisfies readonly WlTypographyRole[];\nexport type WlTypographyName = (typeof wlTypography)[number]["name"];\nexport const wlBreakpoints = ${JSON.stringify(catalog.breakpoints, null, 2)} as const;\nexport const wlContrastPairs = ${JSON.stringify(catalog.contrast, null, 2)} as const satisfies readonly WlContrastPair[];\nexport const wlContrastReport = ${JSON.stringify(contrast, null, 2)} as const;\n`;
}

export function renderPrimitiveCss(catalog) {
  const lines = [
    "/* Generated by tokens:sync. Optional layout and typography primitives. */",
    "@layer wl.reset, wl.tokens, wl.components;",
    "@layer wl.components {",
    "  .wl-stack { display: flex; flex-direction: column; gap: var(--wl-space-lg); min-width: 0; }",
    "  .wl-inline { display: flex; flex-wrap: wrap; align-items: center; gap: var(--wl-space-lg); min-width: 0; }",
    "  .wl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, var(--wl-layout-grid-min)), 1fr)); gap: var(--wl-layout-grid-gap); min-width: 0; }",
    "  .wl-container { box-sizing: border-box; min-width: 0; width: 100%; max-width: var(--wl-layout-page-max); margin-inline: auto; padding-inline: var(--wl-layout-page-gutter); }",
    "  .wl-container--narrow { max-width: var(--wl-layout-reading-max); }",
    "  .wl-container--fluid { max-width: none; }",
    "  .wl-container--full { max-width: none; padding-inline: 0; }",
    "  .wl-rule { width: 100%; margin: 0; border: 0; border-block-start: 1px solid var(--wl-border); }",
    "  .wl-scroll-area { min-width: 0; max-width: 100%; overflow: auto; }",
    "  .wl-isolate { isolation: isolate; }",
    "  .wl-surface { background: var(--wl-bg); color: var(--wl-text); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); padding: var(--wl-space-xl); }",
    "  .wl-text-muted { color: var(--wl-text-muted); }",
    "  .wl-visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }"
  ];
  for (const [space, token] of Object.entries(catalog.spacing)) {
    lines.push(`  :where(.wl-stack, .wl-inline, .wl-grid)[data-space="${space}"] { gap: var(${token}); }`);
  }
  for (const role of catalog.typography) {
    lines.push(`  .wl-text-${role.name} { font-family: var(${role.fontFamily}); font-size: var(${role.fontSize}); line-height: var(${role.lineHeight}); font-weight: var(${role.fontWeight}); }`);
  }
  lines.push("}", "");
  return lines.join("\n");
}

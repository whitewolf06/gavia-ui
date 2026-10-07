/** A small lossless lexer for documentation, not a language parser. */
export type CodeLanguage = "auto" | "vue" | "html" | "ts" | "js" | "css" | "shell" | "json" | "text";
export type ResolvedCodeLanguage = Exclude<CodeLanguage, "auto">;
export type CodeTokenKind = "plain" | "comment" | "tag" | "attribute" | "directive" | "keyword" | "string" | "number" | "punctuation" | "selector" | "property" | "value" | "function" | "unit";
export interface CodeToken { kind: CodeTokenKind; text: string }
interface TokenRange { kind: CodeTokenKind; start: number; end: number }
const keywords = new Set(("as async await break case catch class const continue debugger declare default delete do else enum export extends false finally for from function get if implements import in instanceof interface let new null of private protected public readonly return satisfies set static super switch this throw true try type typeof undefined var void while with yield").split(" "));
const shellCommands = new Set(["pnpm", "node", "git", "cd", "echo", "export", "printf", "set", "test"]);
const punctuation = "{}[]().,;:=+-*/%<>!?&|~^";
const whitespace = (value: string): boolean => value !== "" && /\s/.test(value);
const digit = (value: string): boolean => value >= "0" && value <= "9" && value !== "";
const wordStart = (value: string): boolean => value !== "" && (/[A-Za-z_$]/.test(value) || value.charCodeAt(0) > 127);
const wordPart = (value: string): boolean => wordStart(value) || digit(value);
const tagPart = (value: string): boolean => value !== "" && /[A-Za-z0-9_$:.-]/.test(value);

/** Guess only familiar snippet shapes; callers may always specify the language. */
export function detectCodeLanguage(source: string): ResolvedCodeLanguage {
  const start = source.trimStart();
  if (start.startsWith("<")) return /<(?:script|template|style)\b/.test(start) || start.includes("{{") ? "vue" : "html";
  if (/^(?:pnpm|node|git|cd|echo|export|printf)\b/.test(start) || start.startsWith("#!")) return "shell";
  if (start.startsWith("{") || start.startsWith("[")) return "json";
  if (/^(?:import|export|const|let|var|function|async|class|interface|type|declare|enum|return|throw|if|for|while|switch|try)\b/.test(start)) return "ts";
  if ((/^[.#:@]/.test(start) || /^[A-Za-z][\w-]*\s*\{/.test(start)) && start.includes("{")) return "css";
  return "ts";
}

/** Every character is consumed once; adjacent ranges merge before any text is sliced. */
export function highlightCode(source: string, language: CodeLanguage = "auto"): CodeToken[] {
  if (!source) return [];
  const resolved = language === "auto" ? detectCodeLanguage(source) : language;
  if (resolved === "text") return [{ kind: "plain", text: source }];
  const ranges: TokenRange[] = [];
  let cursor = 0;
  const char = (offset = 0): string => source.charAt(cursor + offset);
  function push(kind: CodeTokenKind, start: number): void {
    if (start === cursor) return;
    const previous = ranges[ranges.length - 1];
    if (previous?.kind === kind && previous.end === start) previous.end = cursor;
    else ranges.push({ kind, start, end: cursor });
  }
  function spaces(): void {
    const start = cursor;
    while (whitespace(char())) cursor++;
    push("plain", start);
  }
  function quoted(): void {
    const quote = char();
    cursor++;
    while (cursor < source.length) {
      if (char() === "\\") { cursor = Math.min(cursor + 2, source.length); continue; }
      if (char() === quote) { cursor++; break; }
      cursor++;
    }
  }
  function comment(open: string, close?: string): void {
    const start = cursor;
    cursor += open.length;
    if (close) {
      while (cursor < source.length && !source.startsWith(close, cursor)) cursor++;
      if (cursor < source.length) cursor += close.length;
    } else while (cursor < source.length && char() !== "\n" && char() !== "\r") cursor++;
    push("comment", start);
  }
  function nextNonSpace(): string {
    let next = cursor;
    while (whitespace(source.charAt(next))) next++;
    return source.charAt(next);
  }
  function number(allowBigInt = true): void {
    const start = cursor;
    if (char() === ".") cursor++;
    if (char() === "0" && /[xXbBoO]/.test(char(1)) && char(1)) {
      cursor += 2;
      while (char() && /[0-9a-fA-F_]/.test(char())) cursor++;
    } else {
      while (digit(char()) || char() === "_") cursor++;
      if (char() === "." && digit(char(1))) { cursor++; while (digit(char()) || char() === "_") cursor++; }
      if ((char() === "e" || char() === "E") && (digit(char(1)) || (char(1) === "+" || char(1) === "-") && digit(char(2)))) {
        cursor++; if (char() === "+" || char() === "-") cursor++;
        while (digit(char()) || char() === "_") cursor++;
      }
      if (allowBigInt && char() === "n") cursor++;
    }
    push("number", start);
  }
  function closesTag(tag: string): boolean {
    const prefix = `</${tag}`;
    return source.slice(cursor, cursor + prefix.length).toLowerCase() === prefix
      && (char(prefix.length) === ">" || whitespace(char(prefix.length)));
  }
  function css(stop?: "style"): void {
    const declarations: boolean[] = [];
    const groupRules = new Set(["@media", "@supports", "@container", "@layer", "@keyframes", "@-webkit-keyframes", "@scope", "@document", "@starting-style"]);
    let pendingBlock: boolean | undefined;
    let inValue = false;
    let expectsColon = false;
    let parentheses = 0;
    while (cursor < source.length) {
      if (stop && closesTag(stop)) return;
      const start = cursor;
      const isDeclaration = declarations[declarations.length - 1] ?? false;
      if (whitespace(char())) { spaces(); continue; }
      if (source.startsWith("/*", cursor)) { comment("/*", "*/"); continue; }
      if (char() === '"' || char() === "'") { quoted(); push("string", start); continue; }
      if (digit(char()) || char() === "." && digit(char(1))) {
        number(false);
        const unitStart = cursor;
        while (char() && /[A-Za-z%]/.test(char())) cursor++;
        push("unit", unitStart); continue;
      }
      if (char() === "@") {
        cursor++; while (wordPart(char()) || char() === "-") cursor++;
        pendingBlock = !groupRules.has(source.slice(start, cursor).toLowerCase());
        inValue = false; expectsColon = false;
        push("keyword", start); continue;
      }
      if ((char() === "." || char() === "#") && (wordPart(char(1)) || char(1) === "-")) {
        cursor++; while (wordPart(char()) || char() === "-") cursor++;
        const kind = inValue && /^#[\da-f]{3,8}$/i.test(source.slice(start, cursor)) ? "number" : inValue ? "value" : "selector";
        push(kind, start); continue;
      }
      if (char() === ":" && !expectsColon && !inValue && (wordStart(char(1)) || char(1) === ":")) {
        cursor++; if (char() === ":") cursor++;
        while (wordPart(char()) || char() === "-") cursor++;
        push("selector", start); continue;
      }
      if (wordStart(char()) || char() === "-" && (wordStart(char(1)) || char(1) === "-")) {
        cursor++; while (wordPart(char()) || char() === "-") cursor++;
        let kind: CodeTokenKind;
        if (!inValue && (isDeclaration || parentheses > 0) && nextNonSpace() === ":") { kind = "property"; expectsColon = true; }
        else if (nextNonSpace() === "(") kind = "function";
        else kind = inValue ? "value" : "selector";
        push(kind, start); continue;
      }
      const symbol = char();
      if (symbol === "{") { declarations.push(pendingBlock ?? true); pendingBlock = undefined; inValue = false; expectsColon = false; parentheses = 0; }
      else if (symbol === "}") { declarations.pop(); inValue = false; expectsColon = false; parentheses = 0; }
      else if (symbol === ";") { inValue = false; expectsColon = false; pendingBlock = undefined; }
      else if (symbol === ":" && expectsColon) { inValue = true; expectsColon = false; }
      else if (symbol === "(") parentheses++;
      else if (symbol === ")") { parentheses = Math.max(0, parentheses - 1); if (!parentheses && !isDeclaration) inValue = false; }
      cursor++; push(punctuation.includes(symbol) ? "punctuation" : "plain", start);
    }
  }
  function code(mode: "ts" | "js" | "css" | "shell" | "json", stop?: "}}" | "script" | "style"): void {
    if (mode === "css") { css(stop === "style" ? "style" : undefined); return; }
    while (cursor < source.length) {
      if (stop === "}}" ? source.startsWith("}}", cursor) : stop && closesTag(stop)) return;
      const start = cursor;
      if (whitespace(char())) { spaces(); continue; }
      if (mode !== "shell" && source.startsWith("/*", cursor)) { comment("/*", "*/"); continue; }
      if (mode !== "shell" && source.startsWith("//", cursor)) { comment("//"); continue; }
      if (mode === "shell" && char() === "#" && (cursor === 0 || whitespace(source.charAt(cursor - 1)))) { comment("#"); continue; }
      if (char() === '"' || char() === "'" || char() === "`") {
        quoted(); push(mode === "json" && nextNonSpace() === ":" ? "attribute" : "string", start); continue;
      }
      if (digit(char()) || char() === "." && digit(char(1))) { number(); continue; }
      if (mode === "shell" && char() === "-" && (wordStart(char(1)) || char(1) === "-")) {
        cursor++; while (wordPart(char()) || char() === "-") cursor++;
        push("attribute", start); continue;
      }
      if (wordStart(char())) {
        cursor++; while (wordPart(char())) cursor++;
        const word = source.slice(start, cursor);
        let kind: CodeTokenKind = "plain";
        if (mode === "shell") kind = word.startsWith("$") ? "directive" : shellCommands.has(word) ? "keyword" : "plain";
        else if (mode === "json") kind = word === "true" || word === "false" || word === "null" ? "keyword" : "plain";
        else if (keywords.has(word)) kind = "keyword";
        push(kind, start); continue;
      }
      cursor++; push(punctuation.includes(source.charAt(start)) ? "punctuation" : "plain", start);
    }
  }
  function tag(): void {
    const start = cursor;
    cursor++;
    const closing = char() === "/";
    if (closing) cursor++;
    push("punctuation", start);
    const nameStart = cursor;
    while (tagPart(char())) cursor++;
    const name = source.slice(nameStart, cursor).toLowerCase();
    push("tag", nameStart);
    let scriptMode: "ts" | "js" | "json" = "js";
    let complete = false;
    let selfClosing = false;
    while (cursor < source.length) {
      if (whitespace(char())) { spaces(); continue; }
      if (char() === "<") break;
      if (char() === ">" || source.startsWith("/>", cursor)) {
        const end = cursor;
        selfClosing = char() === "/";
        cursor += selfClosing ? 2 : 1;
        push("punctuation", end); complete = true; break;
      }
      const attributeStart = cursor;
      while (cursor < source.length && !whitespace(char()) && !"=><\"'".includes(char()) && !source.startsWith("/>", cursor)) cursor++;
      const attribute = source.slice(attributeStart, cursor);
      if (cursor > attributeStart) push(/^(?:v-|[:@#])/.test(attribute) ? "directive" : "attribute", attributeStart);
      if (whitespace(char())) spaces();
      if (char() === "=") { const equals = cursor++; push("punctuation", equals); if (whitespace(char())) spaces(); }
      else if (cursor > attributeStart) continue;
      const valueStart = cursor;
      const isQuote = char() === '"' || char() === "'";
      if (isQuote) quoted();
      else if (char() && char() !== ">" && char() !== "<" && !source.startsWith("/>", cursor)) {
        while (cursor < source.length && !whitespace(char()) && char() !== ">" && char() !== "<" && !source.startsWith("/>", cursor)) cursor++;
      }
      if (cursor > valueStart) {
        const value = source.slice(valueStart + (isQuote ? 1 : 0), cursor - (isQuote && source.charAt(cursor - 1) === source.charAt(valueStart) ? 1 : 0)).toLowerCase();
        if (attribute === "lang" && (value === "ts" || value === "typescript")) scriptMode = "ts";
        if (attribute === "type" && value.includes("json")) scriptMode = "json";
        push("string", valueStart);
      } else if (cursor === attributeStart) { cursor++; push("plain", attributeStart); }
    }
    if (complete && !closing && !selfClosing && name === "script") code(scriptMode, "script");
    if (complete && !closing && !selfClosing && name === "style") code("css", "style");
  }
  function markup(): void {
    while (cursor < source.length) {
      const start = cursor;
      if (source.startsWith("<!--", cursor)) { comment("<!--", "-->"); continue; }
      if (source.startsWith("<!", cursor) || source.startsWith("<?", cursor)) { comment(source.slice(cursor, cursor + 2), ">"); continue; }
      if (source.startsWith("{{", cursor)) {
        cursor += 2; push("punctuation", start); code("js", "}}");
        if (source.startsWith("}}", cursor)) { const end = cursor; cursor += 2; push("punctuation", end); }
        continue;
      }
      if (char() === "<" && (/[A-Za-z]/.test(char(1)) && char(1) || char(1) === "/")) { tag(); continue; }
      cursor++;
      while (cursor < source.length && char() !== "<" && !source.startsWith("{{", cursor)) cursor++;
      push("plain", start);
    }
  }
  if (resolved === "vue" || resolved === "html") markup();
  else code(resolved);
  return ranges.map(({ kind, start, end }) => ({ kind, text: source.slice(start, end) }));
}

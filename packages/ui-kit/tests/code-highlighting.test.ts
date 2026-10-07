import { afterEach, describe, expect, it, vi } from "vitest";
import { enableAutoUnmount, flushPromises, mount } from "@vue/test-utils";
import { detectCodeLanguage, highlightCode, type CodeLanguage } from "../../../apps/playground/src/design-system/highlighting/tokenizer";
import CodeHighlight from "../../../apps/playground/src/design-system/CodeHighlight.vue";
import CodePanel from "../../../apps/playground/src/design-system/CodePanel.vue";

enableAutoUnmount(afterEach);
afterEach(() => { vi.unstubAllGlobals(); });
const text = (source: string, language: CodeLanguage = "auto"): string => highlightCode(source, language).map((token) => token.text).join("");
const ofKind = (source: string, kind: string, language: CodeLanguage = "auto"): string[] => highlightCode(source, language).filter((token) => token.kind === kind).map((token) => token.text);
const sfc = [
  '<script setup lang="ts">',
  'import { ref } from "vue";',
  'interface Entry { label: string; count: number }',
  'const count = ref(12); // minute precision',
  'const message = `first line',
  'second line <img onerror="bad()">`;',
  '/* comment with <template> and {{ ignored }}',
  '   remains a comment */',
  '</script>',
  '<template>',
  '  <!-- {{ not an expression }} -->',
  '  <WlButton v-if="count > 0" :disabled="false" @click="count++">',
  '    {{ count + 1 }} · птица 🐦',
  '  </WlButton>',
  '</template>',
  '<style scoped>',
  '.sample { color: var(--wl-text); margin: 1.5rem; }',
  '@media (max-width: 640px) { .sample { padding: 8px; } }',
  '</style>',
  ''
].join("\r\n");

describe("lossless documentation highlighting", () => {
  it("keeps complete Vue SFC blocks, CRLF, indentation and Unicode while identifying their syntax", () => {
    expect(text(sfc, "vue")).toBe(sfc);
    expect(ofKind(sfc, "keyword")).toEqual(expect.arrayContaining(["import", "from", "interface", "const", "@media"]));
    expect(ofKind(sfc, "directive")).toEqual(expect.arrayContaining(["v-if", ":disabled", "@click"]));
    expect(ofKind(sfc, "attribute")).toContain("lang");
    expect(ofKind(sfc, "property")).toEqual(expect.arrayContaining(["color", "margin"]));
    expect(ofKind(sfc, "value")).toContain("--wl-text");
    expect(ofKind(sfc, "unit")).toEqual(expect.arrayContaining(["rem", "px"]));
    expect(ofKind(sfc, "number")).toEqual(expect.arrayContaining(["12", "1", "1.5", "640", "8"]));
    expect(ofKind(sfc, "comment")).toEqual(expect.arrayContaining(['<!-- {{ not an expression }} -->']));
    expect(ofKind(sfc, "string").some((value) => value.includes("second line <img"))).toBe(true);
  });

  it("does not end attributes, comments or interpolation at delimiters inside quoted text", () => {
    const source = '<template><p :title="a > b" @click="say(\'<!-- -->\')">{{ "}}" + 2 }}<!-- <script>bad()</script> --></p></template>';
    expect(text(source, "vue")).toBe(source);
    expect(ofKind(source, "string", "vue")).toEqual(expect.arrayContaining(['"a > b"', '"say(\'<!-- -->\')"', '"}}"']));
    expect(ofKind(source, "number", "vue")).toContain("2");
    expect(ofKind(source, "comment", "vue")).toEqual(['<!-- <script>bad()</script> -->']);
  });

  it("keeps multiline and escaped JS/TS strings and comments intact", () => {
    const source = [
      String.raw`const text = "say \"hi\"";`,
      'const multi = `line one',
      '${value}',
      'line three`;',
      '/* line one',
      'line two */',
      'return 1e-3 + 0xff;'
    ].join("\n");
    for (const language of ["ts", "js"] as const) {
      expect(text(source, language)).toBe(source);
      expect(ofKind(source, "string", language)).toContain('`line one\n${value}\nline three`');
      expect(ofKind(source, "comment", language)).toContain('/* line one\nline two */');
      expect(ofKind(source, "number", language)).toEqual(["1e-3", "0xff"]);
    }
  });

  it("supports CSS, HTML, shell and JSON without changing whitespace or values", () => {
    const samples = {
      css: '.card { --wl-size: 12px; color: #fff; content: "<script>"; /* note */ }',
      html: '<input name="message" value="a > b" disabled>\n<p>one &amp; two</p>',
      shell: '# install\npnpm --filter gavia-ui add "file name"\necho $VERSION # keep version\n',
      json: '{\n  "name": "gavia-ui", "version": 0.8, "ready": true, "value": null\n}'
    } as const;
    for (const language of Object.keys(samples) as (keyof typeof samples)[]) expect(text(samples[language], language)).toBe(samples[language]);
    expect(ofKind(samples.css, "property", "css")).toEqual(expect.arrayContaining(["--wl-size", "color", "content"]));
    expect(ofKind(samples.shell, "directive", "shell")).toContain("$VERSION");
    expect(ofKind(samples.shell, "comment", "shell")).toEqual(["# install", "# keep version"]);
    expect(ofKind(samples.json, "attribute", "json")).toEqual(['"name"', '"version"', '"ready"', '"value"']);
  });

  it("preserves unfinished snippets, isolated delimiters and an explicit plain-text mode", () => {
    for (const source of ["", "<", "</", '<WlButton :title="unfinished', '<script setup>const text = "unterminated', '<style>/* unfinished', '<template>{{ value + "}}', '\n\t  trailing spaces  ', '<!DOCTYPE html', '<?xml incomplete']) {
      expect(text(source, "vue")).toBe(source);
      expect(text(source, "text")).toBe(source);
    }
    expect(text('const x = "unterminated\\', "js")).toBe('const x = "unterminated\\');
    expect(highlightCode("", "text")).toEqual([]);
  });

  it("guesses common snippet shapes and allows an explicit language", () => {
    expect(detectCodeLanguage(sfc)).toBe("vue");
    expect(detectCodeLanguage('<button type="button">Send</button>')).toBe("html");
    expect(detectCodeLanguage('pnpm add gavia-ui@0.8.1 vue')).toBe("shell");
    expect(detectCodeLanguage('.card { padding: 8px; }')).toBe("css");
    expect(detectCodeLanguage('button { color: red; }')).toBe("css");
    expect(detectCodeLanguage('{"ready":true}')).toBe("json");
    expect(detectCodeLanguage('import { WlButton } from "gavia-ui";')).toBe("ts");
    expect(highlightCode('<script>bad()</script>', "text")).toEqual([{ kind: "plain", text: '<script>bad()</script>' }]);
  });

  it("renders malicious markup as inert span text, losslessly across updates", async () => {
    const source = '</code><img src=x onerror="bad()"><script>bad()</script>\n{{ "<iframe>" }}';
    const wrapper = mount(CodeHighlight, { props: { source, language: "vue" } });
    expect(wrapper.element.textContent).toBe(source);
    expect(wrapper.findAll("span").map((span) => span.element.textContent).join("")).toBe(source);
    expect(wrapper.find("img, script, iframe").exists()).toBe(false);
    expect(wrapper.find("[onerror]").exists()).toBe(false);
    expect(wrapper.attributes("data-language")).toBe("vue");
    const next = 'pnpm add "<img>"\n';
    await wrapper.setProps({ source: next, language: "shell" });
    expect(wrapper.element.textContent).toBe(next);
    expect(wrapper.findAll("span").map((span) => span.element.textContent).join("")).toBe(next);
    expect(wrapper.attributes("data-language")).toBe("shell");
  });

  it("copies the original source and retains manual fallback instead of copying rendered markup", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const wrapper = mount(CodePanel, { props: { source: sfc, expanded: true, language: "vue", title: "App.vue" } });
    expect(wrapper.get("pre code").element.textContent).toBe(sfc);
    expect(wrapper.get("pre").attributes()).toMatchObject({ tabindex: "0", role: "region", "aria-label": "App.vue" });
    await wrapper.get("button").trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith(sfc);
    expect(wrapper.get('[role="status"]').text()).toBe("Код скопирован.");
    writeText.mockRejectedValueOnce(new Error("Clipboard blocked"));
    await wrapper.get("button").trigger("click");
    await flushPromises();
    // Native textarea values normalize CRLF/CR to LF; clipboard and code above keep the original source.
    expect(wrapper.get("textarea").element.value).toBe(sfc.replace(/\r\n?/g, "\n"));
    expect(wrapper.get("pre code").element.textContent).toBe(sfc);
    expect(wrapper.get('[role="status"]').text()).toContain("Буфер обмена недоступен");
  });
  it("distinguishes CSS selectors, declaration properties, values, functions and adjacent units", () => {
    const source = '@media (max-width: 640px) { button:hover, .card { display: grid; padding: calc(1rem + 8px); color: var(--wl-accent); width: 50%; } }';
    expect(text(source, "css")).toBe(source);
    expect(ofKind(source, "selector", "css")).toEqual(expect.arrayContaining(["button:hover", ".card"]));
    expect(ofKind(source, "property", "css")).toEqual(["max-width", "display", "padding", "color", "width"]);
    expect(ofKind(source, "value", "css")).toEqual(expect.arrayContaining(["grid", "--wl-accent"]));
    expect(ofKind(source, "function", "css")).toEqual(["calc", "var"]);
    expect(ofKind(source, "unit", "css")).toEqual(["px", "rem", "px", "%"]);
    expect(ofKind(source, "number", "css")).toEqual(["640", "1", "8", "50"]);
    const incomplete = '.card { width: calc(.5rem +';
    expect(text(incomplete, "css")).toBe(incomplete);
    expect(ofKind(incomplete, "unit", "css")).toEqual(["rem"]);
  });

  it("keeps HTML tag names, plain attributes and Vue directives separate from their literal values", () => {
    const source = '<WlButton id="action" class="primary" :disabled="busy" @click.stop="save" v-bind="attrs">{{ label }}</WlButton>';
    expect(text(source, "html")).toBe(source);
    expect(ofKind(source, "tag", "html")).toEqual(["WlButton", "WlButton"]);
    expect(ofKind(source, "attribute", "html")).toEqual(["id", "class"]);
    expect(ofKind(source, "directive", "html")).toEqual([":disabled", "@click.stop", "v-bind"]);
    expect(ofKind(source, "string", "html")).toEqual(['"action"', '"primary"', '"busy"', '"save"', '"attrs"']);
  });

  it("keeps a labelled copy button inside the frame and outside collapsed or scrollable code", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const source = '<div>readable & inert</div>\n';
    const wrapper = mount(CodePanel, { props: { source, language: "html" } });
    const frame = wrapper.get(".ds-source-frame");
    const copy = wrapper.get('button[aria-label="Копировать код"]');
    expect(frame.element.contains(copy.element)).toBe(true);
    expect(copy.element.closest("details")).toBeNull();
    expect(wrapper.get("pre").element.contains(copy.element)).toBe(false);
    expect(wrapper.get("details").attributes("open")).toBeUndefined();
    expect(copy.attributes()).toMatchObject({ type: "button", title: "Копировать код" });
    expect((copy.element as HTMLElement).tabIndex).toBe(0);
    expect(copy.attributes("aria-hidden")).toBeUndefined();
    expect(copy.find('[data-icon="copy"]').exists()).toBe(true);
    await copy.trigger("click");
    await flushPromises();
    expect(writeText).toHaveBeenCalledWith(source);
    expect(wrapper.get('button[aria-label="Скопировано"]').find('[data-icon="check"]').exists()).toBe(true);
    expect(wrapper.get("pre code").element.textContent).toBe(source);
    await wrapper.setProps({ expanded: true });
    expect(wrapper.get("details").attributes("open")).toBeDefined();
    expect(wrapper.get("pre code").element.textContent).toBe(source);
  });
});

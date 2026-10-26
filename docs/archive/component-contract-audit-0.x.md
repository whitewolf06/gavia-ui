<a id="archived-section-1"></a>

# Component family contract audit

Archived on 2026-10-27. This record preserves earlier implementation, preparation or release evidence; its dated statuses and commands are historical. Use the [documentation index](../README.md) for current guides and the [archive index](README.md) for context.


This record covers the accepted T3.2/T4.6 review work in the unreleased 0.x
iteration. Public defaults and legacy aliases remain compatible. Component API
tables are generated from source; this document explains the deliberate limits
of the family contract.

<a id="archived-section-2"></a>

## Names and native attributes


Application code supplies the purpose of a form control through a visible label,
`aria-labelledby` or `aria-label`. A placeholder describes the expected input and
does not replace a label. `WlField` exposes `inputId`, `labelId`,
`ariaDescribedby`, `ariaInvalid`, `invalid` and `required`; bind these to the
control as shown in the Field examples. Its help and error remain separate,
referenced descriptions. Required markers are decorative.

`review-field-accessible-names.test.ts` checks Input, Textarea, PasswordInput,
NumberInput, Select, MultiSelect, Autocomplete, DatePicker (single/range),
TimePicker (native/formatted), ColorPicker, Slider (single/range), Checkbox,
Switch and IconButton with the same visible Field label, help and error. Range
endpoints append their own labels and use unique IDs. Native input attributes
and event handlers belong on the focusable control; wrapper class, style and
data attributes remain on the wrapper. Select uses a focusable combobox and
serializes its value through a hidden named input.

IconButton checks its rendered action name in development, including resolved
label references and slot text. A badge count is a separate description and
cannot name the action. `countLabel` and `dotLabel` override localized badge
descriptions; consumer description IDs are retained. Loading retains the named
slot text visually hidden. Unnamed decorative icons stay hidden from assistive
technology. A meaningful Badge dot needs `ariaLabel`, `aria-labelledby` or a PT
root label; an unnamed dot remains decorative. Avatar presence has a localized
name.

Progress accepts explicit label props or root ARIA attributes. Determinate
`showValue` exposes the percentage as `aria-valuetext`; an application-provided
value description takes precedence. Indeterminate progress omits a current
numeric value. Production consumers can remove diagnostics through the literal
`process.env.NODE_ENV` guards. Library production output still requires the
separately authorized package checks.

<a id="archived-section-3"></a>

## Supported axes and exceptions


| Family | Supported axes | Deliberate exceptions |
| --- | --- | --- |
| Button | `variant`, `tone`, `size`, `density`, disabled, loading | Validation belongs to fields, so no `invalid` action treatment. |
| ButtonGroup | `variant`, `size`, `density` | Container layout; disabled/loading belongs to its buttons. |
| IconButton | `variant`, `tone`, `size`, disabled, loading | Square sizes define its geometry; no separate density or invalid state. |
| Input, Textarea, PasswordInput, NumberInput | `size`, `density`, disabled, invalid | Text fields keep one input treatment. Loading is available on Input; strength is a PasswordInput meter. |
| Checkbox, Radio | `size`, `density`, disabled, invalid | Selection state is checked/indeterminate; no visual variant or loading API. |
| Switch | `size`, `density`, disabled, invalid, loading | Label placement is independent of selection state. |
| Select, MultiSelect, Autocomplete | `size`, `density`, disabled, invalid, loading | Loading belongs to results, not a second visual variant. |
| Slider, DatePicker, TimePicker | `size`, `density`, disabled, invalid | Native value/range behavior; no artificial loading or color variants. |
| ColorPicker | `size`, disabled, invalid | Color-grid geometry is defined by size; no separate density or loading state. |
| FilePicker | `size`, `density`, disabled | It delegates selection to a native input. FileUpload owns upload progress and rejection feedback. |
| FileUpload | disabled, per-file upload state | Composite drop area, without artificial variant/size/density axes. |
| NavItem, Segmented, Chip | `size`, `density`, disabled | Active/selected state supplies their treatment; Chip removal is a separate action. |
| Tag | `color`, `tone`, `size`, `density`, disabled | Legacy palette `variant` remains an alias. No loading/invalid state. |
| Badge, Pill, Progress | `tone` with legacy color aliases | Informational display; no disabled/invalid/density state. Progress has thin/indeterminate modes. |
| Avatar | pixel size, shape, presence | Identity content; image loading uses fallback content instead of a disabled/loading API. |
| Divider | orientation, spacing, label alignment | Structural separator; size/state/variant axes do not apply. |
| Skeleton | dimensions, shape, text/avatar preset, line count | A decorative placeholder, not an interactive control. |
| StatCard | `tone`, formatted number, delta/footer slots | Card content determines dimensions; no form/action state axes. |
| Link | `tone`, disabled, external/new-tab behavior | Native text link sizing follows surrounding typography. |

Size and density hooks map to actual classes or data selectors in the component
styles. Compact form controls retain the same semantic input behavior. Disabled
actions guard emitted events in addition to native disabled/ARIA state. Invalid
inputs expose `aria-invalid` and the existing danger focus treatment. Low
specificity selectors use existing semantic `--wl-*` variables; the additions
stylesheet audit found no unresolved variable references.

<a id="archived-section-4"></a>

## Verification boundaries


Focused interaction, forwarding and type fixtures are the current automated
evidence. Build, packaging, full suites, production browser behavior, visual
diffs in five themes, desktop/mobile review and NVDA/VoiceOver acceptance remain
separate release checks. This record does not mark those checks as completed.

import { localizeDocumentation } from "../localize";
export interface InputDocumentationExample {
  title: string;
  description: string;
  sourceName: string;
}

/** Additional examples accompany the shared controlled preview of each input. */
export const inputDocumentationExamples: Record<string, InputDocumentationExample> = localizeDocumentation({
  WlTimePicker: { title: "documentation.strings.s0220", description: "documentation.strings.s0221", sourceName: "inputs/WlTimePicker.vue" },
  WlFilePicker: { title: "documentation.strings.s0222", description: "documentation.strings.s0223", sourceName: "inputs/WlFilePicker.vue" },
  WlInput: { title: "documentation.strings.s0224", description: "documentation.strings.s0225", sourceName: "inputs/WlInput.vue" },
  WlPasswordInput: { title: "documentation.strings.s0226", description: "documentation.strings.s0227", sourceName: "inputs/WlPasswordInput.vue" },
  WlNumberInput: { title: "documentation.strings.s0228", description: "documentation.strings.s0229", sourceName: "inputs/WlNumberInput.vue" },
  WlTextarea: { title: "documentation.strings.s0230", description: "documentation.strings.s0231", sourceName: "inputs/WlTextarea.vue" },
  WlSelect: { title: "documentation.strings.s0232", description: "documentation.strings.s0233", sourceName: "inputs/WlSelect.vue" },
  WlMultiSelect: { title: "documentation.strings.s0234", description: "documentation.strings.s0235", sourceName: "inputs/WlMultiSelect.vue" },
  WlAutocomplete: { title: "documentation.strings.s0236", description: "documentation.strings.s0237", sourceName: "inputs/WlAutocomplete.vue" },
  WlCheckbox: { title: "documentation.strings.s0238", description: "documentation.strings.s0239", sourceName: "inputs/WlCheckbox.vue" },
  WlRadio: { title: "documentation.strings.s0240", description: "documentation.strings.s0241", sourceName: "inputs/WlRadio.vue" },
  WlSwitch: { title: "documentation.strings.s0242", description: "documentation.strings.s0243", sourceName: "inputs/WlSwitch.vue" },
  WlSlider: { title: "documentation.strings.s0244", description: "documentation.strings.s0245", sourceName: "inputs/WlSlider.vue" },
  WlDatePicker: { title: "documentation.strings.s0246", description: "documentation.strings.s0247", sourceName: "inputs/WlDatePicker.vue" },
  WlCalendar: { title: "documentation.strings.s0248", description: "documentation.strings.s0249", sourceName: "inputs/WlCalendar.vue" },
  WlColorPicker: { title: "documentation.strings.s0250", description: "documentation.strings.s0251", sourceName: "inputs/WlColorPicker.vue" },
  WlFileUpload: { title: "documentation.strings.s0252", description: "documentation.strings.s0253", sourceName: "inputs/WlFileUpload.vue" }
});

/** Rules describe each component's actual DOM and model contract. */
export const inputDocumentationAccessibility: Record<string, readonly string[]> = localizeDocumentation({
  WlTimePicker: [
    "documentation.strings.s0254",
    "documentation.strings.s0255",
    "documentation.strings.s0256",
    "documentation.strings.s0257"
  ],
  WlFilePicker: [
    "documentation.strings.s0258",
    "documentation.strings.s0259",
    "documentation.strings.s0260",
    "documentation.strings.s0261"
  ],
  WlInput: [
    "documentation.strings.s0262",
    "documentation.strings.s0263",
    "documentation.strings.s0264",
    "documentation.strings.s0265"
  ],
  WlPasswordInput: [
    "documentation.strings.s0266",
    "documentation.strings.s0267",
    "documentation.strings.s0268",
    "documentation.strings.s0269"
  ],
  WlNumberInput: [
    "documentation.strings.s0270",
    "documentation.strings.s0271",
    "documentation.strings.s0272",
    "documentation.strings.s0273"
  ],
  WlTextarea: [
    "documentation.strings.s0274",
    "documentation.strings.s0275",
    "documentation.strings.s0276",
    "documentation.strings.s0277"
  ],
  WlSelect: [
    "documentation.strings.s0278",
    "documentation.strings.s0279",
    "documentation.strings.s0280",
    "documentation.strings.s0281"
  ],
  WlMultiSelect: [
    "documentation.strings.s0282",
    "documentation.strings.s0283",
    "documentation.strings.s0284",
    "documentation.strings.s0285"
  ],
  WlAutocomplete: [
    "documentation.strings.s0286",
    "documentation.strings.s0287",
    "documentation.strings.s0288",
    "documentation.strings.s0289"
  ],
  WlCheckbox: [
    "documentation.strings.s0290",
    "documentation.strings.s0291",
    "documentation.strings.s0292",
    "documentation.strings.s0293"
  ],
  WlRadio: [
    "documentation.strings.s0294",
    "documentation.strings.s0295",
    "documentation.strings.s0296",
    "documentation.strings.s0297"
  ],
  WlSwitch: [
    "documentation.strings.s0298",
    "documentation.strings.s0299",
    "documentation.strings.s0300",
    "documentation.strings.s0301"
  ],
  WlSlider: [
    "documentation.strings.s0302",
    "documentation.strings.s0303",
    "documentation.strings.s0304",
    "documentation.strings.s0305"
  ],
  WlDatePicker: [
    "documentation.strings.s0306",
    "documentation.strings.s0307",
    "documentation.strings.s0308",
    "documentation.strings.s0309"
  ],
  WlCalendar: [
    "documentation.strings.s0310",
    "documentation.strings.s0311",
    "documentation.strings.s0312",
    "documentation.strings.s0313"
  ],
  WlColorPicker: [
    "documentation.strings.s0314",
    "documentation.strings.s0315",
    "documentation.strings.s0316",
    "documentation.strings.s0317"
  ],
  WlFileUpload: [
    "documentation.strings.s0318",
    "documentation.strings.s0319",
    "documentation.strings.s0320",
    "documentation.strings.s0321"
  ]
});
<script setup lang="ts">
import { computed } from "vue";
import { playgroundLocale } from "../i18n";
const props = defineProps<{ name: string }>();
const russian = computed(() => playgroundLocale.value === "ru");
type Rule = readonly [string, string, string];
const rules = computed<Rule[]>(() => {
  const name = props.name;
  if (["WlMenu", "WlContextMenu"].includes(name)) return [
    ["↑ / ↓, Home / End", "Move between enabled menu items.", "Перейти между доступными пунктами меню."],
    ["→ / ←", "Open a submenu or return to its parent.", "Открыть подменю или вернуться к родителю."],
    ["Enter / Space", "Activate a command or checked item.", "Выполнить команду или выбрать пункт."],
    ["Escape / Tab", "Close the applicable menu; Tab continues to the next control.", "Закрыть меню; Tab продолжает переход к следующему контролу."],
    ...(name === "WlContextMenu" ? [["Shift+F10 / ContextMenu", "Open at the focused trigger.", "Открыть меню у элемента в фокусе."] as const] : [])
  ];
  if (["WlSelect", "WlMultiSelect", "WlAutocomplete", "WlCommandPalette"].includes(name)) return [
    ["↑ / ↓", "Open the list and move the active option, skipping disabled options.", "Открыть список и перейти к доступной опции."],
    ["Home / End, PageUp / PageDown", "Move to an edge or a page of available options while the list is active.", "Перейти к краю или на страницу доступных опций в открытом списке."],
    ["Enter", "Choose the active option once.", "Выбрать активную опцию один раз."],
    ["Escape", "Close the list and keep focus at its trigger or input.", "Закрыть список и сохранить фокус на триггере или поле."],
    ["Text", "Type to search or use typeahead where the control is not editable.", "Введите запрос или начните вводить название в нередактируемом списке."]
  ];
  if (["WlTabs", "WlSegmented", "WlRadioGroup", "WlToolbar", "WlSteps"].includes(name)) return [
    ["Tab", "Enter or leave the group through one active focus stop.", "Войти в группу или выйти из неё через один активный элемент."],
    ["← / → or ↑ / ↓", "Move in the configured orientation and skip disabled items.", "Перейти в заданном направлении, пропуская недоступные элементы."],
    ["Home / End", "Focus the first or last enabled item.", "Перевести фокус на первый или последний доступный элемент."],
    ["Enter / Space", "Activate the focused action. Tabs, radios and segmented choices select as documented.", "Выполнить действие в фокусе. Вкладки, радиокнопки и сегменты выбираются по своему контракту."]
  ];
  if (["WlDialog", "WlDrawer", "WlConfirmDialog", "WlFilterBar", "WlPopover"].includes(name)) return [
    ["Tab / Shift+Tab", "Move between controls; modal overlays retain focus inside.", "Перейти между контролами; модальный оверлей удерживает фокус внутри."],
    ["Escape", "Dismiss the top eligible overlay when dismissal is enabled.", "Закрыть верхний подходящий оверлей, если закрытие разрешено."]
  ];
  if (name === "WlTooltip") return [["Tab / focus", "Show the description for the focused trigger.", "Показать описание элемента в фокусе."], ["Escape", "Hide the tooltip without moving focus.", "Скрыть подсказку, сохранив фокус."]];
  if (name === "WlTagsInput") return [["Enter / separator", "Validate and add the current tag.", "Проверить и добавить текущий тег."], ["Backspace", "Remove the last tag only when the input is empty.", "Удалить последний тег, если поле пустое."], ["Tab", "Focus the input and the named remove actions.", "Перевести фокус на поле и подписанные кнопки удаления."]];
  if (["WlCalendar", "WlDatePicker"].includes(name)) return [["← / →, ↑ / ↓", "Move by a day or a week in the open calendar.", "Перейти на день или неделю в открытом календаре."], ["Home / End", "Move to a week edge.", "Перейти к краю недели."], ["PageUp / PageDown", "Change the visible month.", "Переключить видимый месяц."], ["Enter / Space", "Choose an available day.", "Выбрать доступный день."], ["Escape", "Close the date picker popup.", "Закрыть всплывающий выбор даты."]];
  if (["WlCheckbox", "WlCheckboxGroup", "WlSwitch", "WlRadio"].includes(name)) return [["Tab / Shift+Tab", "Focus an enabled native control.", "Перевести фокус на доступный нативный контрол."], ["Space", "Change the current choice.", "Изменить текущий выбор."]];
  if (["WlButton", "WlIconButton", "WlLink", "WlNavItem", "WlAccordion", "WlChip", "WlTag", "WlPagination", "WlBreadcrumbs", "WlFileUpload", "WlFilePicker", "WlTable"].includes(name)) return [["Tab / Shift+Tab", "Move between enabled links, actions and form controls.", "Перейти между доступными ссылками, действиями и полями."], ["Enter / Space", "Activate native actions; links follow with Enter.", "Выполнить нативное действие; для перехода по ссылке нажмите Enter."]];
  return [];
});
const pattern = computed(() => {
  if (["WlDialog", "WlDrawer", "WlConfirmDialog"].includes(props.name)) return "dialog-modal";
  if (["WlMenu", "WlContextMenu"].includes(props.name)) return "menubar";
  if (props.name === "WlTabs") return "tabs";
  if (["WlSelect", "WlAutocomplete", "WlMultiSelect"].includes(props.name)) return "combobox";
  if (props.name === "WlToolbar") return "toolbar";
  return "";
});
</script>

<template>
  <div class="wl-stack" data-space="md" :data-keyboard-contract="name">
    <h3 class="wl-text-subheading">
      {{ russian ? 'Клавиатура и ответственность приложения' : 'Keyboard and application responsibilities' }}
    </h3>
    <div
      v-if="rules.length"
      class="docs-table-scroll"
      tabindex="0"
      role="region"
      :aria-label="russian ? 'Клавиатура' : 'Keyboard'"
    >
      <table class="docs-contract-table">
        <thead>
          <tr>
            <th scope="col">{{ russian ? 'Клавиша' : 'Key' }}</th>
            <th scope="col">{{ russian ? 'Действие' : 'Action' }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rule in rules" :key="rule[0]">
            <th scope="row"><kbd>{{ rule[0] }}</kbd></th>
            <td>{{ rule[russian ? 2 : 1] }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="wl-text-small">{{ russian ? 'Задайте понятное доступное имя и свяжите подпись, подсказку и ошибку с фокусируемым элементом. Проверьте поведение со своими данными и скринридером.' : 'Provide a meaningful accessible name and connect labels, hints and errors to the focusable element. Check the behavior with your own data and a screen reader.' }}</p>
    <a class="docs-text-link" :href="`https://www.w3.org/WAI/ARIA/apg/patterns/${pattern ? pattern + '/' : ''}`">WAI-ARIA Authoring Practices</a>
  </div>
</template>

# Переход с WhiteUI 0.3 на 0.5

Версия 0.5 сохраняет Vue 3, публичные `Wl*` компоненты, их props, события,
слоты, `v-model`, `wl-*` классы, токены, `data-wl`, имена и рисунки иконок.
PrimeVue и PrimeIcons больше не требуются пакету. Проверьте собственные
использования этих библиотек в приложении прежде, чем удалять их из приложения.

## Инициализация приложения

Раньше WhiteUI получал конфигурацию через PrimeVue:

```ts
import PrimeVue from "primevue/config";
import { createWlPt, wlLocaleRu } from "@whitelife-core/ui-kit";
app.use(PrimeVue, { unstyled: true, pt: createWlPt(), locale: wlLocaleRu });
```

Теперь конфигурация WhiteUI передаётся в `WlConfig`:

```ts
import {
  WlConfig, WlToastService, WlConfirmationService, wlLocaleRu
} from "@whitelife-core/ui-kit";

app.use(WlConfig, { locale: wlLocaleRu, pt: {
  button: { root: { "data-test": "app-button" } }
} });
app.use(WlToastService);         // если используются WlToast/useWlToast
app.use(WlConfirmationService);  // если используются WlConfirmDialog/useWlConfirm
```

`WlConfig` необязателен: по умолчанию применяется русская локаль и стандартная
карта `pt`. Сервисы нужно установить на каждом Vue-приложении, использующем
соответствующие компоненты. Их состояние не разделяется между приложениями.
Стили по-прежнему импортируются явно: reset, base, выбранная тема.

`createWlPt(overrides)` сохраняется. Глобальные переопределения можно передать
как `WlConfig.pt`; они применяются после стандартных разделов. `pt` отдельного
компонента применяется последним. `class` и `style` объединяются, остальные
атрибуты заменяются. Список разделов — в [архитектуре](architecture.md#pt-и-публичный-dom).

## Таблица с колонками

`WlTable` принимает `columns: WlTableColumn[]` и `value`. Ячейка переопределяется
слотом `cell-<key>` с `{ row, value }`.

```vue
<WlTable :value="rows" :columns="[
  { key: 'name', label: 'Имя' },
  { key: 'amount', label: 'Сумма', numeric: true, width: 120 }
]">
  <template #cell-amount="{ value }">{{ formatAmount(value) }}</template>
</WlTable>
```

Если в прежней разметке были PrimeVue `<Column>` внутри default-слота
`WlTable`, перенесите их поля в `columns` и шаблоны body — в `cell-*`.
Это единственное заранее известное изменение PrimeVue-специфичной разметки
потребителя. Пустой `columns` оставляет default-слот для произвольного
содержимого, но больше не создаёт таблицу из `<Column>`.

## Проверка потребителя

1. Обновите импорт конфигурации и установите используемые сервисы.
2. Замените `<Column>` внутри `WlTable` на `columns`/`cell-*`.
3. Если приложение само использует PrimeVue или PrimeIcons, оставьте их
   зависимости для этого кода; WhiteUI их больше не импортирует.
4. Соберите приложение, проверьте клавиатуру и фокус в выпадающих списках и
   модальных окнах, выбор даты, таблицы, уведомления и все используемые темы.

Базовые публичные контракты 51 компонента проверяются тестами по манифесту;
архив версии 0.5 дополнительно собирается в изолированном Vue-потребителе.

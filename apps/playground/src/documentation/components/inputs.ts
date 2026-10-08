export interface InputDocumentationExample {
  title: string;
  description: string;
  sourceName: string;
}

/** Additional examples accompany the shared controlled preview of each input. */
export const inputDocumentationExamples: Record<string, InputDocumentationExample> = {
  WlTimePicker: { title: "Время, границы и состояния", description: "Три размера, плотность compact, дневной и ночной диапазоны, ошибка и очистка nullable-модели.", sourceName: "inputs/WlTimePicker.vue" },
  WlFilePicker: { title: "Выбор нескольких файлов", description: "Собственный trigger, методы ref, select/cancel, стандартные размеры и список, которым управляет приложение.", sourceName: "inputs/WlFilePicker.vue" },
  WlInput: { title: "Размеры, слоты и проверка", description: "Сравнение размеров и плотности, prefix/suffix, связанная ошибка, disabled и очистка текста.", sourceName: "inputs/WlInput.vue" },
  WlPasswordInput: { title: "Видимость и проверка пароля", description: "Размеры и компактность, переключение отображения, проверка длины приложением и отключённое поле.", sourceName: "inputs/WlPasswordInput.vue" },
  WlNumberInput: { title: "Числа, шаг и диапазон", description: "Сравнение размеров, целые и дробные шаги, ограничение min/max, compact, invalid и disabled.", sourceName: "inputs/WlNumberInput.vue" },
  WlTextarea: { title: "Строки, высота и ошибка", description: "Фиксированная высота через rows и высота по содержимому через autoResize. Общая модель, добавление строк, обязательный комментарий и очистка.", sourceName: "inputs/WlTextarea.vue" },
  WlSelect: { title: "Варианты из объектов и состояния", description: "Отдельные label/id, три размера и compact, доступные имена, ошибка, disabled и внешняя очистка.", sourceName: "inputs/WlSelect.vue" },
  WlMultiSelect: { title: "Чипы, фильтр и сводка", description: "Множественный выбор с фильтром, удаляемые чипы и comma-счётчик, размеры, состояния и очистка массива.", sourceName: "inputs/WlMultiSelect.vue" },
  WlAutocomplete: { title: "Поиск и несколько участников", description: "Объектные suggestions по complete, заранее заполненный dropdown, multiple, размеры и состояния.", sourceName: "inputs/WlAutocomplete.vue" },
  WlCheckbox: { title: "Связанные флажки", description: "Выбор всех доступных пунктов с вычисляемым indeterminate, согласие с ошибкой и disabled.", sourceName: "inputs/WlCheckbox.vue" },
  WlRadio: { title: "Группы выбора", description: "Две группы с общим name внутри каждой, подписи в слотах, обязательный выбор, invalid и недоступный вариант.", sourceName: "inputs/WlRadio.vue" },
  WlSwitch: { title: "Настройки и состояния", description: "Сравнение sm/md, подписи, проверяемая настройка с ошибкой, disabled и сброс моделей.", sourceName: "inputs/WlSwitch.vue" },
  WlSlider: { title: "Диапазоны и текущее значение", description: "Два ограниченных диапазона с разными шагами, текстовые output, отключение и сброс.", sourceName: "inputs/WlSlider.vue" },
  WlDatePicker: { title: "Одна дата и диапазон от–до", description: "Три размера, общий focus ring, ручной ISO-ввод, minDate/maxDate, диапазон [start,end|null], ошибка, disabled и очистка.", sourceName: "inputs/WlDatePicker.vue" },
  WlCalendar: { title: "Дата, месяц и события", description: "Модели даты и месяца, события выбранного дня, переход между месяцами и к сегодняшней дате.", sourceName: "inputs/WlCalendar.vue" },
  WlColorPicker: { title: "Палитра и HEX-ввод", description: "Собственные swatches, sm/md, нормализованная модель, внешний invalid, disabled и текстовое значение цвета.", sourceName: "inputs/WlColorPicker.vue" },
  WlFileUpload: { title: "Лимиты и локальный список", description: "Ограничения типа, размера и количества, событие reject, замена одного файла, удаление и сброс ошибок.", sourceName: "inputs/WlFileUpload.vue" }
};

/** Rules describe each component's actual DOM and model contract. */
export const inputDocumentationAccessibility: Record<string, readonly string[]> = {
  WlTimePicker: [
    "Свяжите видимую подпись с нативным time-input через id/for либо задайте aria-label. Клавиши и внешний вид выбора времени определяет браузер.",
    "Модель содержит локальное HH:mm или null, без даты и часового пояса. minTime > maxTime обозначает диапазон через полночь.",
    "Ошибка приложения передаётся через invalid и текст, связанный aria-describedby. Ограничения диапазона не заменяют подпись ошибки.",
    "disabled отключает нативный ввод; недопустимое время не меняет последнее допустимое значение модели."
  ],
  WlFilePicker: [
    "Стандартный trigger — кнопка с chooseLabel/ariaLabel. В своём trigger сохраните переданные attrs и disabled; используйте настоящий button.",
    "Вызывайте choose() из действия пользователя, чтобы браузер разрешил открытие окна выбора. Кнопке доступны Enter и Space.",
    "select передаёт новый список File[], cancel не меняет список приложения. Сообщайте итог выбора текстом и сохраняйте имена файлов.",
    "clear() очищает нативное поле, а список приложения сбрасывается отдельно. accept подсказывает браузеру типы файлов; проверку выполняет приложение."
  ],
  WlInput: [
    "Задайте id и видимый label либо aria-label. placeholder дополняет подпись, но не заменяет её.",
    "Модель — строка. Нативные type, name, required, readonly и aria-describedby передаются входному элементу.",
    "Свяжите текст ошибки через aria-describedby и передайте invalid; WlField отдаёт обе части в scoped-слоте.",
    "Декоративные prefix/suffix скрывайте от вспомогательных технологий; для самостоятельного действия нужна подписанная кнопка."
  ],
  WlPasswordInput: [
    "Нативному полю нужна подпись через id/for либо ariaLabel; autocomplete задаёт потребитель под сценарий формы.",
    "Кнопка видимости доступна с клавиатуры, меняет aria-pressed и имя «Показать пароль»/«Скрыть пароль».",
    "Переключение видимости сохраняет строковую модель. Не выводите пароль в статусах, журнале или ошибках.",
    "Сложность пароля проверяет приложение. Для ошибки передайте invalid и связанный текст; для отключения поля — disabled."
  ],
  WlNumberInput: [
    "Дайте полю ariaLabel и различимые decrementLabel/incrementLabel, особенно если на странице несколько степперов.",
    "Поле имеет role=spinbutton и сообщает текущее значение, min и max. ArrowUp/ArrowDown и кнопки изменяют значение на step.",
    "Enter или blur фиксируют черновик: запятая допускается при дробном вводе, значение ограничивается min/max.",
    "Модель — число. Свяжите текст ошибки с полем через aria-describedby; invalid не является правилом проверки диапазона."
  ],
  WlTextarea: [
    "Свяжите label с textarea через id/for либо задайте aria-label; placeholder остаётся дополнительной подсказкой.",
    "Enter создаёт новую строку. rows задаёт исходное число строк, autoResize подстраивает высоту по содержимому.",
    "Модель — строка; обязательность и текст ошибки задаёт приложение. Передайте required, invalid и aria-describedby при необходимости.",
    "Не перехватывайте обычные сочетания редактирования текста. disabled делает поле недоступным для редактирования."
  ],
  WlSelect: [
    "Корневой combobox — div, поэтому обычный label for не даёт ему имени. Задайте aria-label или aria-labelledby.",
    "Стрелки, Enter или Space раскрывают список; стрелки, Home/End меняют активный пункт, Enter выбирает, Escape закрывает.",
    "optionLabel отвечает за подпись, optionValue — за значение модели. Сравнение значений использует Object.is; сохраняйте стабильные значения.",
    "invalid дополняйте связанным текстом ошибки. Очистку nullable-модели выполняет приложение; disabled исключает combobox из Tab-порядка."
  ],
  WlMultiSelect: [
    "Задайте имя нативному readonly combobox через id/label либо aria-label. aria-expanded сообщает открытие списка, listbox поддерживает множественный выбор.",
    "Стрелки и Home/End двигают активный пункт, Enter переключает его, Escape закрывает список. Выбор одного пункта оставляет список открытым.",
    "В display=chip каждый чип имеет кнопку удаления с именем выбранного значения. filter добавляет поле «Фильтр» в панели.",
    "Модель — TValue[], тип значения выводится из options и optionValue. maxSelectedLabels сворачивает подписи только в display=comma. Ошибку связывайте через aria-describedby."
  ],
  WlAutocomplete: [
    "Подпишите текстовый combobox через id/label либо aria-label; кнопке dropdown задайте различимое dropdownLabel.",
    "ArrowDown раскрывает подсказки; стрелки и Home/End меняют активный пункт, Enter выбирает, Escape закрывает.",
    "complete передаёт query после задержки; приложение обновляет suggestions. Dropdown открывает текущий список, поэтому подготовьте начальные варианты.",
    "В одиночном режиме ввод возвращает строку, выбор — значение подсказки. Для объектов и вводимого текста используйте функцию optionLabel, обрабатывающую оба типа. В multiple модель содержит массив и доступны кнопки удаления чипов; invalid дополняйте описанием ошибки."
  ],
  WlCheckbox: [
    "Подпись в default-слоте становится частью нативного label. Для варианта без текста обязательно задайте доступное имя.",
    "Space переключает нативный checkbox. Модель — boolean; indeterminate — отдельное состояние, которое вычисляет приложение.",
    "Для «выбрать всё» вычисляйте смешанное состояние по доступным дочерним пунктам. Не включайте заблокированные пункты скрытым действием.",
    "При ошибке согласия передайте invalid и свяжите объяснение через aria-describedby; required и disabled сохраняют нативную семантику."
  ],
  WlRadio: [
    "Подпись находится в default-слоте, несколько вариантов объединяйте fieldset/legend или именованной группой.",
    "Общий name включает нативную клавиатурную навигацию между radio; стрелки меняют вариант, Space выбирает его.",
    "Одна модель хранит value выбранного варианта. Для независимых групп нужны разные name и модели.",
    "Объясняйте invalid текстом и связывайте его с вариантами через aria-describedby. disabled запрещает выбор отдельного пункта."
  ],
  WlSwitch: [
    "Нативный checkbox имеет role=switch. Подпись default-слота называет настройку, aria-checked сообщает boolean-состояние.",
    "Space переключает сфокусированный switch. Сохраняйте одинаковую подпись во включённом и выключенном состоянии.",
    "Поддерживаются размеры sm/md. disabled отключает изменение настройки, а invalid требует поясняющего текста от приложения.",
    "Свяжите ошибку через aria-describedby; сохранение настройки и связанные действия выполняет приложение."
  ],
  WlSlider: [
    "Нативному range задайте ariaLabel и видимую подпись. Показывайте текущее значение числом рядом с ползунком. Положение и цвет трека дополняют его.",
    "Стрелки меняют значение по step, Home/End выбирают края диапазона. Нативный элемент ограничивает ввод min/max.",
    "Модель — число. Свяжите единицы измерения и пояснение диапазона с полем через aria-describedby.",
    "disabled отключает управление. Публичный контракт не содержит invalid, size или density — проверки потребителя показывайте отдельным текстом."
  ],
  WlDatePicker: [
    "Свяжите подпись с полем через id/for либо aria-label. В range startLabel/endLabel дают видимые имена; второе поле получает id-end/name-end, aria-describedby применяется к обоим. Календарная кнопка получает имя из WlConfig.",
    "ArrowDown раскрывает календарь и фокусирует дату; стрелки перемещают по дням, Home/End — по неделе, PageUp/PageDown — по месяцам. Enter/Space выбирают дату, Escape возвращает фокус; Tab доступен для навигации календаря.",
    "single (по умолчанию) сохраняет YYYY-MM-DD|null. range использует WlDateRange|null: [start,end|null]. Первый выбор задаёт начало, второй завершает и сортирует включённый диапазон, следующий начинает заново. minDate/maxDate проверяют обе границы.",
    "invalid связывайте с текстом ошибки. Формат модели ISO не зависит от displayFormat. Пустое начало очищает модель, пустой конец оставляет [start,null]; конец без начала, неверная или недоступная дата возвращают прежнее отображение."
  ],
  WlCalendar: [
    "Календарь сообщает месяц и выбранный день; доступное имя даты включает число событий. Дайте окружающему разделу понятный заголовок.",
    "Стрелки перемещают фокус по дням, Home/End — по текущей неделе, PageUp/PageDown — по месяцам, Enter/Space выбирают день.",
    "v-model хранит YYYY-MM-DD, v-model:month — отображаемый YYYY-MM. При программном переходе задавайте обе модели, если нужно увидеть дату.",
    "События дополнительно перечисляйте текстом для выбранного дня. Не добавляйте несуществующие disabled/minDate/invalid: эти ограничения не входят в контракт календаря."
  ],
  WlColorPicker: [
    "Дайте отдельные paletteLabel и inputLabel: палитра и HEX-поле — отдельные элементы управления.",
    "Стрелки циклически перемещают фокус по свотчам, Home/End — к краям; Enter/Space выбирают цвет нативной кнопкой.",
    "Модель приводится к #rrggbb в нижнем регистре. Ошибочный черновик помечает HEX-поле и сохраняет последнее допустимое значение.",
    "Показывайте цвет также текстом. Внешний invalid сопровождайте объяснением, disabled отключает палитру и ввод."
  ],
  WlFileUpload: [
    "Дропзона имеет role=button: Tab фокусирует её, Enter/Space открывают выбор. Видимый заголовок раздела поясняет допустимые файлы и лимиты.",
    "Выбранные имена показываются текстом, каждому файлу соответствует подписанная кнопка удаления. disabled запрещает выбор и удаление.",
    "Компонент проверяет accept, maxSize в байтах и maxFiles, а reject возвращает причину type/size/count и показывает текст ошибки.",
    "Модель — локальный File[]. multiple=false заменяет файл следующим допустимым выбором, отмена сохраняет список. Сетевую загрузку выполняет приложение."
  ]
};
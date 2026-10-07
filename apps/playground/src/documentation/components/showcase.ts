/** Additional canonical SFC scenarios; primary prop controls stay in the shared preview. */
export const showcaseDocumentationExamples: Record<string, { title: string; description: string; sourceName: string }> = {
  WlIconButton: { title: "Варианты, счётчики и иконки", description: "Ghost, secondary, soft, маленький размер, active, disabled, count/dot и собственный default-слот.", sourceName: "showcase/WlIconButton.vue" },
  WlButtonGroup: { title: "Группы действий и навигации", description: "Связанные кнопки периода и группа иконок с блокировкой крайних страниц; состояние хранит приложение.", sourceName: "showcase/WlButtonGroup.vue" },
  WlSegmented: { title: "Период, иконки и disabled", description: "Контролируемый выбор, недоступная опция, варианты с иконками и полностью отключённая группа.", sourceName: "showcase/WlSegmented.vue" },
  WlMenu: { title: "Статическое и popup-меню", description: "Заголовок, разделитель, иконки, подпись сочетания, disabled и danger; команды дают локальный результат.", sourceName: "showcase/WlMenu.vue" },
  WlNavItem: { title: "Активные пункты и свёрнутые подписи", description: "Кнопки разделов, счётчики, disabled, реальная ссылка и collapsed с сохранением доступного имени.", sourceName: "showcase/WlNavItem.vue" },
  WlPageHeader: { title: "Все секции заголовка страницы", description: "Breadcrumbs, eyebrow/title/description/meta/actions/navigation, три размера и compact без дополнительного h1.", sourceName: "showcase/WlPageHeader.vue" },
  WlFilterBar: { title: "Поиск, фильтры и мобильная панель", description: "Leading, controls, actions, summary, удаление активных фильтров, clear/apply и именованная модель open.", sourceName: "showcase/WlFilterBar.vue" },
  WlSidebar: { title: "Группы, закрепление и mobile", description: "Основные/нижние пункты, brand-mark/footer, disabled, hover/pinned и контролируемый мобильный drawer.", sourceName: "showcase/WlSidebar.vue" },
  WlCommandPalette: { title: "Быстрые действия, поиск и состояния", description: "Две группы, ключевые слова, disabled, локальная фильтрация, загрузка, empty и footer без второго глобального shortcut.", sourceName: "showcase/WlCommandPalette.vue" },
  WlCard: { title: "Обычная и hoverable-карточка", description: "Header, title/subtitle, содержимое и footer на адаптивной сетке; отдельные доступные действия.", sourceName: "showcase/WlCard.vue" },
  WlAccordion: { title: "Режимы раскрытия и scoped-слот", description: "Контролируемые openKeys, single, disabled, item-слот и отдельный неконтролируемый аккордеон.", sourceName: "showcase/WlAccordion.vue" },
  WlTabs: { title: "Вкладки с иконками и панелями", description: "Контролируемая модель, счётчик заметок, scoped panel и клавиатурное переключение разделов.", sourceName: "showcase/WlTabs.vue" },
  WlDialog: { title: "Редактирование в диалоге", description: "Поле с label/hint, footer с сохранением/отменой, настройки motion/dismissable и afterLeave.", sourceName: "showcase/WlDialog.vue" },
  WlDrawer: { title: "Пять сторон открытия", description: "Right/left/top/bottom/full, управляемая анимация, подробности и действия в footer.", sourceName: "showcase/WlDrawer.vue" },
  WlPopover: { title: "Привязанная интерактивная панель", description: "Toggle/hide, содержимое и действие, ariaLabel, motion и события открытия/закрытия.", sourceName: "showcase/WlPopover.vue" },
  WlDivider: { title: "Линия и подпись разделителя", description: "Простой разделитель, текст «или» и собственное содержимое default-слота между частями страницы.", sourceName: "showcase/WlDivider.vue" },
  WlBreadcrumbs: { title: "Полный и короткий путь", description: "Настоящие ссылки родителей, иконка, текущая страница без перехода и одноуровневый путь.", sourceName: "showcase/WlBreadcrumbs.vue" },
  WlSteps: { title: "Пройденный, текущий и будущий шаг", description: "Все состояния сразу, назад/вперёд, ограничения крайних шагов и перезапуск локального сценария.", sourceName: "showcase/WlSteps.vue" },
  WlAlert: { title: "Четыре варианта и повтор действия", description: "Info/ok/warn/err, action-слот, closable с понятной подписью и восстановление скрытой ошибки.", sourceName: "showcase/WlAlert.vue" },
  WlToast: { title: "Четыре вида уведомлений", description: "useWlToast показывает ok/info/warn/err с detail через один уже установленный контейнер приложения.", sourceName: "showcase/WlToast.vue" },
  WlConfirmDialog: { title: "Обычное и опасное подтверждение", description: "Confirm/confirmDanger, собственные подписи accept/reject, отмена, локальный результат и повтор примера.", sourceName: "showcase/WlConfirmDialog.vue" },
  WlSpinner: { title: "Размеры, светлый вариант и загрузка", description: "Sm/md/lg, light на тёмной поверхности, понятные label и контролируемое завершение/повтор.", sourceName: "showcase/WlSpinner.vue" },
  WlTable: { title: "Ячейки, пустое состояние и загрузка", description: "Columns, numeric, cell-title/cell-status, empty-слот, loading, доступная прокрутка и собственная таблица в default.", sourceName: "showcase/WlTable.vue" },
  WlPagination: { title: "Окно страниц и компактный ввод", description: "Многоточия, две именованные навигации, Enter/blur для компактного номера и disabled.", sourceName: "showcase/WlPagination.vue" },
  WlBadge: { title: "Числа, тексты и точки", description: "Все пять вариантов, dot с текстовым контекстом, нулевой счётчик и локальная отметка прочитанного.", sourceName: "showcase/WlBadge.vue" },
  WlTag: { title: "Варианты и удаляемые теги", description: "Все пять цветов, removable с уникальным removeLabel, controlled-массив и восстановление фокуса/тегов.", sourceName: "showcase/WlTag.vue" },
  WlChip: { title: "Независимые фильтры", description: "Active, count включая ноль, disabled, именованные модели и снятие всех фильтров.", sourceName: "showcase/WlChip.vue" },
  WlPill: { title: "Пять смысловых статусов", description: "Neutral/info/ok/warn/err, label и собственный default-слот с декоративной иконкой.", sourceName: "showcase/WlPill.vue" },
  WlAvatar: { title: "Размеры, presence, image и слот", description: "24/28/32/36/48, три статуса присутствия, безопасное локальное изображение/инициалы и собственная иконка.", sourceName: "showcase/WlAvatar.vue" },
  WlStatCard: { title: "Метрики, тона и прогресс", description: "Accent/success, подпись/описание, прогресс, значение через default-слот, footer и обновление метрики.", sourceName: "showcase/WlStatCard.vue" },
  WlProgress: { title: "Обычный, тонкий и завершённый прогресс", description: "Default/ok, thin, showValue, доступные имена, изменение значения и перезапуск.", sourceName: "showcase/WlProgress.vue" },
  WlSkeleton: { title: "Карточка во время загрузки", description: "Rectangle/circle, размеры и радиус, aria-busy с пояснением и переход к реальному содержимому.", sourceName: "showcase/WlSkeleton.vue" },
  WlEmpty: { title: "Нет данных, нет результатов и свой слот", description: "Добавление первого материала, сброс поиска, повтор пустого состояния, icon/default/action.", sourceName: "showcase/WlEmpty.vue" },
  WlField: { title: "Связь label, подсказки и ошибки", description: "Required, error/hint, slot id/ariaDescribedby/invalid, email/readonly/textarea и локальная проверка.", sourceName: "showcase/WlField.vue" },
  WlIcon: { title: "Размеры, совместимые имена и SVG-слот", description: "Несколько реальных имён, 14/18/24/32 и 1em, alias pi pi-search и собственный безопасный SVG.", sourceName: "showcase/WlIcon.vue" }
};

/** Rules reflect each component's actual native DOM and public contract. */
export const showcaseDocumentationAccessibility: Record<string, readonly string[]> = {
  WlIconButton: [
    "Каждая кнопка без текста получает понятный ariaLabel; декоративный SVG скрыт от вспомогательных технологий.",
    "Tab, Enter и Space используют нативный button; disabled блокирует действие и исключает кнопку из Tab-порядка.",
    "Active задаёт оформление. Для настоящего переключателя передавайте aria-pressed и храните состояние в приложении; dot дополняйте текстовым смыслом."
  ],
  WlButtonGroup: [
    "Задавайте ariaLabel группы, описывающий общую задачу её кнопок.",
    "У каждой кнопки остаются отдельные имя, Tab-фокус и обработчик; группа сама не управляет выбором.",
    "Если кнопки переключают режим, передавайте им aria-pressed; крайние действия навигации отключайте явно."
  ],
  WlSegmented: [
    "Назовите группу через aria-label; текст каждой опции остаётся доступным именем нативной кнопки.",
    "V-model хранит value, а aria-pressed сообщает выбранную опцию. Disabled работает и на группе, и на отдельной опции.",
    "Переходите между кнопками по Tab и активируйте Enter/Space; компонент не объявляет tablist и не реализует стрелочную навигацию вкладок."
  ],
  WlMenu: [
    "Для статического и popup-меню задавайте разные ariaLabel; пункты используют роли menu/menuitem.",
    "ArrowDown/ArrowUp, Home и End перемещают фокус и пропускают disabled. Escape закрывает popup и возвращает фокус открывшему элементу.",
    "Shortcut является только подписью. Команды, сочетания клавиш и необходимость подтверждения опасного действия определяет приложение."
  ],
  WlNavItem: [
    "Label или ariaLabel описывает цель пункта. Collapsed сохраняет имя, хотя подпись визуально скрыта.",
    "Href создаёт настоящую ссылку; без href создаётся нативный button. Active задаёт aria-current=page.",
    "Недоступные ссылки не имеют href и исключены из Tab-порядка; disabled-кнопки блокируются нативно."
  ],
  WlPageHeader: [
    "Выбирайте headingLevel по структуре страницы: внутри страницы документации используется 2, отдельная страница может использовать 1.",
    "Слоты actions и navigation должны содержать доступные кнопки/ссылки с понятными именами.",
    "Порядок breadcrumbs, контекста, заголовка и описания сохраняет смысл на узком экране; не заменяйте важный текст одной цветной меткой."
  ],
  WlFilterBar: [
    "Задавайте ariaLabel, toggleLabel и panelTitle, соответствующие назначению фильтров; все вложенные поля получают свои имена.",
    "На mobile закрытая панель inert; открытие переводит фокус в неё, Escape/закрытие возвращает к открывшей кнопке.",
    "Clear сообщает событие: значения фильтров сбрасывает приложение. Apply не выполняет сетевой запрос сам; активные фильтры объясняйте текстом или удаляемыми tags."
  ],
  WlSidebar: [
    "AriaLabel именует область навигации; label/ariaLabel каждого пункта сохраняется в collapsed-режиме.",
    "V-model хранит активный key; v-model:pinned и v-model:mobile-open управляют закреплением и мобильной панелью.",
    "Мобильная панель удерживает фокус, закрывается Escape/подложкой и после выбора. В собственном item-слоте сохраняйте доступное имя и вызывайте scoped select."
  ],
  WlCommandPalette: [
    "AriaLabel именует диалог и поисковый combobox; disabled-элементы не участвуют в выборе.",
    "ArrowUp/ArrowDown меняют активный элемент, Enter выбирает его, Escape закрывает окно и возвращает фокус.",
    "Visible и query являются отдельными моделями. Регистрируйте глобальный shortcut только у одной палитры; loading/empty должны объяснять состояние поиска."
  ],
  WlCard: [
    "Title-слот сам не создаёт заголовок: используйте подходящий h2/h3 и при необходимости aria-labelledby карточки.",
    "Hoverable изменяет оформление. Для перехода или действия внутри карточки нужна настоящая ссылка или кнопка.",
    "Сохраняйте логичный порядок header, title/subtitle, содержимого и footer; не делайте вложенные интерактивные области одной кнопкой."
  ],
  WlAccordion: [
    "Нативные details/summary предоставляют раскрытие через клавиатуру; disabled-пункт получает aria-disabled и не меняет openKeys.",
    "В контролируемом режиме обновляйте openKeys из update:openKeys. Single ограничивает раскрытие при переключении пункта.",
    "Кнопки и ссылки в item-слоте размещайте в теле, сохраняя понятные подписи summary и последовательность фокуса."
  ],
  WlTabs: [
    "Aria-label tablist можно передать через pt.tabList; подпись каждой вкладки объясняет содержимое её панели.",
    "ArrowLeft/ArrowRight, Home и End одновременно выбирают вкладку и перемещают фокус; в Tab-порядке находится активная вкладка.",
    "Каждый key должен быть уникальным на странице: он участвует в id и aria-labelledby панели. Scoped panel содержит содержимое выбранного key."
  ],
  WlDialog: [
    "Передавайте header либо ariaLabel/ariaLabelledby, особенно если используете собственный header-слот.",
    "Модальный диалог удерживает фокус; Escape и явная отмена закрывают окно и восстанавливают фокус открывшей кнопки.",
    "Label и ошибки полей связывайте с контролами. Motion учитывает reduced-motion; после afterLeave закрытый DOM удалён."
  ],
  WlDrawer: [
    "У панели должно быть доступное имя через header либо ariaLabel/ariaLabelledby; сторона открытия не меняет её смысл.",
    "Модальная панель удерживает фокус; Escape, кнопка закрытия и разрешённая подложка возвращают к странице.",
    "Сохранение и отмена — явные действия footer. Управляйте visible в приложении и проверяйте повторное открытие во всех нужных позициях."
  ],
  WlPopover: [
    "Передайте ariaLabel/ariaLabelledby и открывайте панель от настоящей кнопки, передавая событие в toggle/show.",
    "Поповер немодальный и не создаёт ловушку фокуса. Его интерактивное содержимое должно иметь понятные имена и порядок Tab.",
    "Escape закрывает панель и возвращает фокус открывшему элементу; dismissable управляет закрытием кликом снаружи."
  ],
  WlDivider: [
    "Разделитель использует role=separator; default-слот может добавить краткую подпись.",
    "Не используйте разделитель вместо заголовка раздела или интерактивного элемента.",
    "Проверьте, что подпись не является единственным объяснением действия и читается в каждой теме."
  ],
  WlBreadcrumbs: [
    "Промежуточные пункты получают реальные href/to; последний пункт остаётся текстом с aria-current=page.",
    "Иконка дополняет текст ссылки. Разделители скрыты от вспомогательных технологий.",
    "Если на странице несколько путей, именуйте их по-разному через pt.root aria-label; сохраняйте родительскую иерархию и на mobile."
  ],
  WlSteps: [
    "Current является индексом с нуля; текущий элемент получает aria-current=step.",
    "Индикатор не является набором кнопок: назад/вперёд реализуйте отдельными именованными действиями приложения.",
    "Сообщайте текущий шаг текстом, проверяйте границы индекса и не передавайте завершение только цветом или галочкой."
  ],
  WlAlert: [
    "Сообщение использует role=alert: текст должен объяснять проблему и следующий шаг, не только её цвет.",
    "Для closable задавайте конкретный closeLabel. Close сообщает событие; скрывает и восстанавливает сообщение приложение.",
    "Action-слот должен содержать понятную кнопку. После исчезновения сфокусированного действия обеспечьте разумное восстановление фокуса в потребителе."
  ],
  WlToast: [
    "Установите WlToastService и один WlToast на Vue-приложение; useWlToast обращается к его изолированному состоянию.",
    "Контейнер использует aria-live=polite; summary/detail должны быть короткими и понятными без цветовой подсказки.",
    "Не оставляйте критическую ошибку только в исчезающем toast: продублируйте её рядом с соответствующим полем или действием."
  ],
  WlConfirmDialog: [
    "Установите WlConfirmationService и один WlConfirmDialog в корне приложения; повторные контейнеры показывают одно состояние сервиса.",
    "Объясняйте последствие в header/message и используйте конкретные acceptLabel/rejectLabel вместо неопределённого «Да».",
    "Accept/reject вызывают обработчики приложения; Escape и отмена сохраняют безопасный исход, модальный фокус возвращается к открывшему действию."
  ],
  WlSpinner: [
    "Label задаёт доступное имя role=status; укажите, что именно загружается.",
    "Light предназначен для тёмного фона, а размер не должен быть единственным носителем смысла.",
    "Рядом сообщайте результат и доступные действия при завершении или ошибке; спиннер сам не управляет запросом."
  ],
  WlTable: [
    "Columns создают нативные table/th scope=col. Имя таблицы передавайте через pt.table aria-label или caption собственной таблицы.",
    "Cell-слоты должны сохранять смысл строки/колонки; действия в ячейках получают понятные имена и disabled во время заблокированной операции.",
    "Loading задаёт aria-busy. Empty объясняет отсутствие данных; на узком экране предоставьте доступную по Tab область горизонтальной прокрутки."
  ],
  WlPagination: [
    "Page использует нумерацию с 1; актуальная кнопка получает aria-current=page.",
    "Обычные кнопки имеют нативную клавиатуру и доступные подписи переходов. Компактный ввод применяет номер по Enter или blur.",
    "Disabled блокирует кнопки и поле. Для нескольких пагинаторов задавайте разные pt.root aria-label и сообщайте номер/общее число текстом."
  ],
  WlBadge: [
    "Value остаётся текстом; dot не содержит текста и не должен в одиночку объяснять состояние.",
    "Числовой счётчик связывайте с объектом рядом, например «Непрочитанных: 3».",
    "Для декоративной точки используйте aria-hidden и соседнюю текстовую подпись; цвет варианта не заменяет смысл."
  ],
  WlTag: [
    "Обычный tag является текстовой меткой; только removable добавляет нативную кнопку.",
    "У каждого удаляемого тега задавайте уникальный removeLabel с его названием.",
    "Remove сообщает событие: обновите список и после удаления сфокусированного тега переведите фокус к следующему действию."
  ],
  WlChip: [
    "Chip является нативным button-переключателем; active отражается в aria-pressed.",
    "V-model:active обновляет независимое булево состояние; приложение определяет, может ли быть выбрано несколько чипов.",
    "Текст слота должен объяснять фильтр. Count дополняет текст, а disabled блокирует действие и Tab-фокус."
  ],
  WlPill: [
    "Label или default-слот объясняет статус независимо от цвета варианта.",
    "Pill является статическим текстом; для действия используйте отдельную кнопку или ссылку.",
    "Декоративные иконки оставляйте скрытыми от вспомогательных технологий; изменение важных статусов сообщайте в уместной live-области приложения."
  ],
  WlAvatar: [
    "У image alt берётся из label. Для смысловых инициалов/слота добавьте роль и доступное имя либо имя человека рядом.",
    "Presence является декоративной точкой aria-hidden; онлайн/занят/офлайн объясняйте текстом.",
    "Размер не заменяет семантику. При замене изображения на инициалы сохраняйте имя пользователя; сетевую ошибку изображения обрабатывает потребитель."
  ],
  WlStatCard: [
    "Label, value и description должны объяснять единицу измерения и период метрики.",
    "Default-слот заменяет значение, footer добавляет контекст; не используйте только цвет tone для сравнения.",
    "Progress задаёт внутренний progressbar с числом 0–100; проверяйте его доступное имя и контекст в странице потребителя."
  ],
  WlProgress: [
    "Передавайте aria-label корневому progressbar, объясняющий конкретную операцию.",
    "Value ограничивается диапазоном 0–100 и задаёт aria-valuenow; showValue добавляет видимый процент.",
    "Thin и ok меняют оформление. Завершение/ошибку и следующую доступную операцию поясняйте текстом приложения."
  ],
  WlSkeleton: [
    "Скелетоны скрыты через aria-hidden и не должны попадать в порядок фокуса.",
    "На содержащем блоке передавайте aria-busy и текстом сообщайте, что загружается.",
    "Заменяйте геометрию реальным содержимым после загрузки; при ошибке нужен понятный результат и повтор, а не бесконечная заглушка."
  ],
  WlEmpty: [
    "Title/description/default объясняют отсутствие данных, фильтра или выбора; title сам не создаёт HTML-заголовок.",
    "Action-слот даёт конкретный следующий шаг: добавить данные, сбросить фильтр или выбрать объект.",
    "Кастомная icon-иллюстрация остаётся декоративной, если смысл уже указан текстом; Empty сам не изменяет данные."
  ],
  WlField: [
    "Из default-слота передавайте id, ariaDescribedby и invalid на настоящий input/textarea; label связывается через for.",
    "Required в WlField рисует маркер; реальный required нужно также передать контролу из scope.",
    "Error имеет приоритет над hint и role=alert. Валидатор и сохранение принадлежат приложению; readonly/disabled назначайте самому контролу."
  ],
  WlIcon: [
    "Встроенный SVG имеет aria-hidden=true; смысловую подпись задавайте на кнопке или внешнем role=img.",
    "Name выбирает проверенный реестр; default-слот используется без name. Размер number задаётся в px, string может использовать 1em.",
    "Кастомный SVG слота должен быть безопасным статическим рисунком и наследовать currentColor; полный каталог и совместимые имена доступны отдельно."
  ]
};

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  WlAlert,
  WlAvatar,
  WlBadge,
  WlBreadcrumbs,
  WlButton,
  WlButtonGroup,
  WlCard,
  WlCheckbox,
  WlChip,
  WlDialog,
  WlDivider,
  WlDrawer,
  WlEmpty,
  WlIcon,
  WlIconButton,
  WlInput,
  WlMenu,
  WlNavItem,
  WlPagination,
  WlPill,
  WlPopover,
  WlProgress,
  WlRadio,
  WlSegmented,
  WlSelect,
  WlSkeleton,
  WlSpinner,
  WlSwitch,
  WlTabs,
  WlTag,
  WlTextarea,
  WlToast,
  WlTooltip,
  useWlToast
} from "@whitelife/ui-kit";
import type {
  WlBreadcrumbItem,
  WlMenuItem,
  WlSegmentedOption,
  WlTabItem,
  WlThemeName
} from "@whitelife/ui-kit";

const vWlTooltip = WlTooltip;

/* Тема */
const theme = ref<WlThemeName>("white");
watch(theme, (value) => {
  document.documentElement.dataset.wlTheme = value;
});

/* Формы */
const text = ref("");
const search = ref("");
const invalidText = ref("admin");
const note = ref("");
const cities = [
  { label: "Москва", value: "msk" },
  { label: "Санкт-Петербург", value: "spb" },
  { label: "Казань", value: "kzn" },
  { label: "Новосибирск", value: "nsk" }
];
const city = ref<string | null>(null);

const agree = ref(true);
const partial = ref(false);
const locked = ref(false);
const plan = ref("basic");
const notify = ref(true);
const notifySm = ref(false);

/* Чипы и теги */
const chipActive = ref(false);
const chipDesign = ref(true);
const tags = ref(["Срочно", "Релиз 2.0", "Дизайн"]);
function removeTag(tag: string): void {
  tags.value = tags.value.filter((t) => t !== tag);
}

/* Табы */
const tabItems: WlTabItem[] = [
  { key: "tasks", label: "Задачи", icon: "check", count: 12 },
  { key: "notes", label: "Заметки", icon: "edit", count: 4 },
  { key: "alerts", label: "Уведомления", icon: "bell", count: 2 },
  { key: "profile", label: "Профиль", icon: "user" }
];
const activeTab = ref("tasks");

/* Навигация (этап 3) */
const periodOptions: WlSegmentedOption[] = [
  { label: "День", value: "day" },
  { label: "Неделя", value: "week" },
  { label: "Месяц", value: "month" },
  { label: "Год", value: "year", disabled: true }
];
const period = ref<string | null>("week");

const viewOptions: WlSegmentedOption[] = [
  { label: "Список", value: "list", icon: "minus" },
  { label: "Доска", value: "board", icon: "plus" },
  { label: "Календарь", value: "calendar", icon: "bell" }
];
const view = ref<string | null>("list");

const navActive = ref("tasks");

const crumbItems: WlBreadcrumbItem[] = [
  { label: "Проекты", href: "#/projects" },
  { label: "WhiteLife", href: "#/projects/whitelife" },
  { label: "Спринт 24" }
];

const pagerPage = ref(6);
const compactPage = ref(4);

/* Меню, поповер и тосты */
const menuAction = ref("—");
const staticMenuItems: WlMenuItem[] = [
  { label: "Открыть", icon: "eye", shortcut: "⌘O", command: () => (menuAction.value = "Открыть") },
  { label: "Переименовать", icon: "edit", shortcut: "F2", command: () => (menuAction.value = "Переименовать") },
  { separator: true },
  { header: "Опасная зона" },
  { label: "Удалить", icon: "trash", danger: true, command: () => (menuAction.value = "Удалить") },
  { label: "Заблокировать", disabled: true }
];
const popupMenuItems: WlMenuItem[] = [
  { label: "Дублировать", icon: "plus", command: () => (menuAction.value = "Дублировать") },
  { label: "Поделиться", icon: "user", command: () => (menuAction.value = "Поделиться") },
  { separator: true },
  { label: "Архивировать", icon: "trash", danger: true, command: () => (menuAction.value = "Архивировать") }
];

const toast = useWlToast();

const popupMenu = ref<{ toggle: (e: Event) => void } | null>(null);
const cardPop = ref<{ toggle: (e: Event) => void } | null>(null);
function togglePopupMenu(event: Event): void {
  popupMenu.value?.toggle(event);
}
function toggleCardPop(event: Event): void {
  cardPop.value?.toggle(event);
}

/* Обратная связь и оверлеи */
const showClosable = ref(true);
const dialogVisible = ref(false);
const drawerVisible = ref(false);
</script>

<template>
  <header class="pg-top">
    <span class="pg-logo">W</span>
    <b class="pg-title">WhiteLife UI Kit</b>
    <span class="muted">playground · все компоненты</span>
    <div class="pg-theme">
      <WlChip :active="theme === 'white'" @click="theme = 'white'">White</WlChip>
      <WlChip :active="theme === 'graphite'" @click="theme = 'graphite'">Graphite</WlChip>
    </div>
  </header>

  <main class="pg-main">
    <h1 class="pg-h1">Компоненты</h1>
    <p class="pg-lead">
      Витрина @whitelife/ui-kit: Vue 3 + TypeScript, PrimeVue 4 в unstyled-режиме,
      токены --wl-* и темы white / graphite.
    </p>

    <!-- ==================== Кнопки ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Кнопки</h2>
      <p class="pg-sec-desc">Варианты, размеры, состояния loading / disabled, block, иконки.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Варианты</span><span class="spec-note">variant</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="primary">Создать</WlButton>
            <WlButton variant="secondary">Черновик</WlButton>
            <WlButton variant="ghost">Отмена</WlButton>
            <WlButton variant="soft">Мягкая</WlButton>
            <WlButton variant="danger">Удалить</WlButton>
            <WlButton variant="danger-quiet">Удалить тихо</WlButton>
            <WlButton variant="soft-danger">Архив</WlButton>
            <WlButton variant="link">Подробнее</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Размеры</span><span class="spec-note">size: xs / sm / md / lg</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton size="xs" variant="primary">XS 26</WlButton>
            <WlButton size="sm" variant="primary">SM 32</WlButton>
            <WlButton size="md" variant="primary">MD 40</WlButton>
            <WlButton size="lg" variant="primary">LG 48</WlButton>
            <WlButton size="sm" density="compact">Compact sm</WlButton>
            <WlButton size="md" density="compact">Compact md</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">Состояния и иконки</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="primary" loading>Сохранение…</WlButton>
            <WlButton disabled>Недоступно</WlButton>
            <WlButton variant="primary">
              <template #icon><WlIcon name="plus" :size="16" /></template>
              Новая задача
            </WlButton>
            <WlButton variant="secondary">
              <template #icon><WlIcon name="search" :size="16" /></template>
              Найти
            </WlButton>
            <WlButton variant="danger-quiet">
              <template #icon><WlIcon name="trash" :size="16" /></template>
              Удалить
            </WlButton>
          </div>
          <div class="row">
            <WlButton variant="primary" block>Создать проект (block)</WlButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Формы ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Формы</h2>
      <p class="pg-sec-desc">Инпуты, textarea, select, чекбоксы, радио и переключатели.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlInput</span><span class="spec-note">размеры, invalid, disabled, prefix/suffix</span></div>
        <div class="spec-b">
          <div class="row">
            <WlInput v-model="text" placeholder="Название задачи" />
            <WlInput v-model="invalidText" invalid placeholder="Логин" />
            <WlInput model-value="Заблокировано" disabled />
          </div>
          <div class="row">
            <WlInput v-model="search" size="sm" placeholder="Поиск (sm)">
              <template #prefix><WlIcon name="search" :size="15" /></template>
            </WlInput>
            <WlInput v-model="text" size="lg" placeholder="Большой инпут (lg)" />
            <WlInput v-model="text" density="compact" placeholder="Compact" />
          </div>
          <div class="row">
            <WlInput v-model="search" placeholder="Суффикс справа">
              <template #suffix><WlIcon name="eye" :size="15" /></template>
            </WlInput>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlTextarea / WlSelect</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlTextarea v-model="note" placeholder="Короткое описание заметки…" />
            <WlSelect v-model="city" :options="cities" option-label="label" option-value="value" placeholder="Город" />
            <WlSelect v-model="city" :options="cities" option-label="label" option-value="value" placeholder="Маленький (sm)" size="sm" />
            <WlSelect :options="cities" option-label="label" option-value="value" placeholder="Invalid" invalid />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlCheckbox / WlRadio / WlSwitch</span></div>
        <div class="spec-b">
          <div class="col">
            <WlCheckbox v-model="agree">Согласен с условиями сервиса</WlCheckbox>
            <WlCheckbox v-model="partial" indeterminate>Выбраны не все пункты (indeterminate)</WlCheckbox>
            <WlCheckbox v-model="locked" disabled>Недоступный чекбокс</WlCheckbox>
          </div>
          <WlDivider>Тариф</WlDivider>
          <div class="col">
            <WlRadio v-model="plan" value="basic" name="plan">Базовый — 0 ₽</WlRadio>
            <WlRadio v-model="plan" value="pro" name="plan">Про — 590 ₽/мес</WlRadio>
            <WlRadio v-model="plan" value="team" name="plan" disabled>Команда (скоро)</WlRadio>
          </div>
          <WlDivider />
          <div class="col">
            <WlSwitch v-model="notify">Уведомления о задачах</WlSwitch>
            <WlSwitch v-model="notifySm" size="sm">Компактный переключатель (sm)</WlSwitch>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Чипы, теги, бейджи ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Чипы, теги, бейджи</h2>
      <p class="pg-sec-desc">Фильтры, статусные метки и счётчики.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlChip</span><span class="spec-note">active, count, disabled</span></div>
        <div class="spec-b">
          <div class="row">
            <WlChip v-model:active="chipActive">Все задачи</WlChip>
            <WlChip v-model:active="chipDesign" :count="7">Дизайн</WlChip>
            <WlChip :count="23">Бэклог</WlChip>
            <WlChip disabled>Архив</WlChip>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlTag / WlBadge</span></div>
        <div class="spec-b">
          <div class="row">
            <WlTag>Обычный</WlTag>
            <WlTag variant="blue">Релиз 2.0</WlTag>
            <WlTag variant="green">Готово</WlTag>
            <WlTag variant="amber">В работе</WlTag>
            <WlTag variant="red">Просрочено</WlTag>
            <WlTag v-for="tag in tags" :key="tag" variant="blue" removable @remove="removeTag(tag)">
              {{ tag }}
            </WlTag>
          </div>
          <div class="row">
            <WlBadge :value="3" />
            <WlBadge :value="12" variant="gray" />
            <WlBadge value="OK" variant="success" />
            <WlBadge :value="5" variant="warn" />
            <WlBadge :value="9" variant="danger" />
            <span class="muted">dot:</span>
            <WlBadge dot />
            <WlBadge dot variant="danger" />
            <WlBadge dot variant="success" />
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Навигация ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Навигация</h2>
      <p class="pg-sec-desc">
        Табы, сегменты, пункты меню, хлебные крошки, пагинация и сгруппированные кнопки.
      </p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlTabs</span><span class="spec-note">items + v-model + #panel</span></div>
        <div class="spec-b">
          <WlTabs v-model="activeTab" :items="tabItems">
            <template #panel="{ item }">
              <p class="muted">
                Активный раздел: «{{ item.label }}» (ключ: {{ item.key }}). Здесь рендерится
                содержимое через scoped-слот <code>#panel</code>.
              </p>
            </template>
          </WlTabs>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlSegmented</span><span class="spec-note">options + v-model, disabled option</span></div>
        <div class="spec-b">
          <div class="row">
            <WlSegmented v-model="period" :options="periodOptions" />
            <span class="muted">выбрано: {{ period }}</span>
          </div>
          <div class="row">
            <WlSegmented v-model="view" :options="viewOptions" />
            <span class="muted">с иконками</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlNavItem</span><span class="spec-note">icon, badge, active — ширину задаёт контейнер</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <div class="col" style="width: 230px; gap: 4px">
              <WlNavItem label="Задачи" icon="check" :badge="12" :active="navActive === 'tasks'" @click="navActive = 'tasks'" />
              <WlNavItem label="Заметки" icon="edit" :badge="4" :active="navActive === 'notes'" @click="navActive = 'notes'" />
              <WlNavItem label="Уведомления" icon="bell" :active="navActive === 'alerts'" @click="navActive = 'alerts'" />
              <WlNavItem label="Профиль" icon="user" :active="navActive === 'profile'" @click="navActive = 'profile'" />
              <WlNavItem label="Архив" icon="trash" disabled />
            </div>
            <span class="muted">активный: {{ navActive }}</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlBreadcrumbs</span><span class="spec-note">последний пункт — текущий, не ссылка</span></div>
        <div class="spec-b">
          <WlBreadcrumbs :items="crumbItems" />
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlPagination</span><span class="spec-note">siblings-окно с многоточиями и compact-вариант</span></div>
        <div class="spec-b">
          <div class="row">
            <WlPagination v-model:page="pagerPage" :page-count="12" />
          </div>
          <div class="row">
            <WlPagination v-model:page="compactPage" :page-count="9" compact />
            <span class="muted">страница {{ compactPage }} из 9 — ввод с клавиатуры</span>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlButtonGroup / WlIconButton</span><span class="spec-note">склейка рамок, счётчики и dot</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButtonGroup>
              <WlButton size="sm" variant="secondary">День</WlButton>
              <WlButton size="sm" variant="secondary">Неделя</WlButton>
              <WlButton size="sm" variant="secondary">Месяц</WlButton>
            </WlButtonGroup>
            <WlButtonGroup>
              <WlIconButton icon="chevron-left" variant="secondary" aria-label="Назад" />
              <WlIconButton icon="chevron-right" variant="secondary" aria-label="Вперёд" />
            </WlButtonGroup>
          </div>
          <div class="row">
            <WlIconButton icon="bell" :count="4" aria-label="Уведомления" />
            <WlIconButton icon="search" aria-label="Поиск" />
            <WlIconButton icon="plus" active aria-label="Добавить" />
            <WlIconButton icon="bell" dot variant="soft" aria-label="Есть новые" />
            <WlIconButton icon="user" variant="secondary" size="sm" :count="2" aria-label="Профиль" />
            <WlIconButton icon="trash" disabled aria-label="Удалить" />
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Карточки ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Карточки</h2>
      <p class="pg-sec-desc">Слоты title / content / footer, состояние hoverable.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlCard</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: stretch">
            <WlCard style="width: 300px">
              <template #title>Спринт 24</template>
              8 задач в работе, 3 на ревью. Демо — в пятницу в 15:00.
              <template #footer>
                <WlButton size="sm" variant="soft">Открыть доску</WlButton>
                <span class="muted">обновлено вчера</span>
              </template>
            </WlCard>
            <WlCard hoverable style="width: 300px">
              <template #title>Заметка о продукте</template>
              Hoverable-карточка: тень и рамка усиливаются при наведении. Подходит для
              кликабельных превью.
              <template #footer>
                <WlTag variant="green">Новая</WlTag>
                <span class="muted">12 июня</span>
              </template>
            </WlCard>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Данные и индикаторы ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Данные и индикаторы</h2>
      <p class="pg-sec-desc">Аватары, прогресс, скелетоны и спиннеры.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlAvatar</span><span class="spec-note">sizes 24–48, presence</span></div>
        <div class="spec-b">
          <div class="row">
            <WlAvatar label="АИ" :size="24" />
            <WlAvatar label="АИ" :size="28" />
            <WlAvatar label="АИ" :size="32" />
            <WlAvatar label="АИ" :size="36" />
            <WlAvatar label="АИ" :size="48" />
            <WlAvatar label="МК" :size="36" presence="online" />
            <WlAvatar label="ДС" :size="36" presence="busy" />
            <WlAvatar label="ЕВ" :size="36" presence="offline" />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlProgress / WlSkeleton / WlSpinner</span></div>
        <div class="spec-b">
          <div class="col">
            <WlProgress :value="64" />
            <WlProgress :value="32" thin />
            <WlProgress :value="100" variant="ok" />
          </div>
          <div class="col" style="margin-top: 18px; max-width: 320px">
            <WlSkeleton height="14px" width="70%" />
            <WlSkeleton height="12px" />
            <WlSkeleton height="12px" width="45%" />
            <div class="row" style="margin-top: 6px">
              <WlSkeleton shape="circle" width="36px" height="36px" />
              <div class="col" style="flex: 1">
                <WlSkeleton height="11px" width="55%" />
                <WlSkeleton height="11px" width="35%" />
              </div>
            </div>
          </div>
          <div class="row" style="margin-top: 18px">
            <WlSpinner size="sm" />
            <WlSpinner />
            <WlSpinner size="lg" />
            <span style="background: var(--wl-gray-800); padding: 8px 12px; border-radius: 8px; display: inline-flex">
              <WlSpinner light />
            </span>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Обратная связь ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Обратная связь</h2>
      <p class="pg-sec-desc">Алерты четырёх вариантов, action-слот и закрытие.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlAlert</span></div>
        <div class="spec-b">
          <div class="col">
            <WlAlert variant="info" title="Совет">
              Перетащите задачу на календарь, чтобы запланировать время.
            </WlAlert>
            <WlAlert variant="ok" title="Готово">
              Данные синхронизированы 2 минуты назад.
            </WlAlert>
            <WlAlert variant="warn" title="Внимание">
              Лимит хранилища почти исчерпан — осталось 120 МБ.
              <template #action>
                <WlButton size="xs" variant="secondary">Увеличить</WlButton>
              </template>
            </WlAlert>
            <WlAlert v-if="showClosable" variant="err" title="Ошибка" closable @close="showClosable = false">
              Не удалось сохранить изменения. Попробуйте ещё раз.
            </WlAlert>
            <WlButton v-else size="sm" variant="soft" @click="showClosable = true">
              Показать алерт снова
            </WlButton>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Оверлеи ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Оверлеи</h2>
      <p class="pg-sec-desc">Диалог, drawer, меню, поповер, тосты и разделитель.</p>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlDialog / WlDrawer / WlTooltip</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="primary" @click="dialogVisible = true">Открыть диалог</WlButton>
            <WlButton variant="secondary" @click="drawerVisible = true">Открыть drawer</WlButton>
            <WlButton v-wl-tooltip="'Подсказка из директивы WlTooltip'" variant="ghost">
              Наведите на меня
            </WlButton>
          </div>
          <WlDivider>Разделитель с подписью</WlDivider>
          <p class="muted">Текст между разделителями.</p>
          <WlDivider />
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlMenu</span><span class="spec-note">статическое и popup, header / separator / danger</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: flex-start">
            <WlMenu :items="staticMenuItems" />
            <div class="col" style="gap: 8px">
              <WlButton variant="secondary" @click="togglePopupMenu">
                Открыть popup-меню
              </WlButton>
              <WlMenu ref="popupMenu" popup :items="popupMenuItems" />
              <span class="muted">последняя команда: {{ menuAction }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlPopover</span><span class="spec-note">toggle по клику, портал в body</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton variant="secondary" @click="toggleCardPop">
              Детали карточки
            </WlButton>
            <WlPopover ref="cardPop">
              <b style="display: block; margin-bottom: 6px; color: var(--wl-text)">Карточка 128</b>
              Поповер — лёгкая панель рядом с якорем. Клик вне панели закрывает её.
              <div style="margin-top: 10px">
                <WlButton size="xs" variant="soft">Открыть полностью</WlButton>
              </div>
            </WlPopover>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlToast + useWlToast</span><span class="spec-note">bottom-center, life 2200 мс</span></div>
        <div class="spec-b">
          <div class="row">
            <WlButton size="sm" variant="soft" @click="toast.ok('Изменения сохранены')">ok</WlButton>
            <WlButton size="sm" variant="soft" @click="toast.info('Новая версия доступна')">info</WlButton>
            <WlButton size="sm" variant="soft" @click="toast.warn('Лимит хранилища почти исчерпан')">warn</WlButton>
            <WlButton size="sm" variant="soft" @click="toast.err('Не удалось сохранить изменения')">err</WlButton>
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h"><span class="spec-name">WlEmpty / WlPill</span></div>
        <div class="spec-b">
          <div class="row" style="align-items: stretch">
            <WlEmpty
              icon="search"
              title="Ничего не найдено"
              description="Попробуйте изменить запрос или сбросить фильтры."
              style="flex: 1"
            >
              <template #action>
                <WlButton size="sm" variant="secondary">Сбросить фильтры</WlButton>
              </template>
            </WlEmpty>
            <WlEmpty icon="bell" title="Уведомлений нет" style="flex: 1">
              Новые события появятся здесь автоматически.
            </WlEmpty>
          </div>
          <div class="row">
            <WlPill>Черновик</WlPill>
            <WlPill variant="info">В работе</WlPill>
            <WlPill variant="ok">Готово</WlPill>
            <WlPill variant="warn">Ждёт ревью</WlPill>
            <WlPill variant="err">Просрочено</WlPill>
          </div>
        </div>
      </div>
    </section>

    <!-- ==================== Токены и кастомизация ==================== -->
    <section class="pg-sec">
      <h2 class="pg-sec-title">Токены и кастомизация</h2>
      <p class="pg-sec-desc">
        Локальное переопределение токенов на поддереве и точечный pt на одном экземпляре.
      </p>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">Scoped token overrides</span>
          <span class="spec-note">--wl-btn-height: 34px; --wl-accent: #7c3aed</span>
        </div>
        <div class="spec-b">
          <div
            class="row"
            style="
              --wl-btn-height: 34px;
              --wl-accent: #7c3aed;
              --wl-accent-hover: #6d28d9;
              --wl-accent-soft: #f3effd;
              --wl-accent-border: #ddd0f8;
              --wl-accent-soft-hover: #eae3fa;
              --wl-accent-border-hover: #d4c4f2;
            "
          >
            <WlButton variant="primary">Фиолетовая</WlButton>
            <WlButton variant="soft">Мягкая фиолетовая</WlButton>
            <WlTag variant="blue">Тег той же темы</WlTag>
            <WlProgress :value="48" />
          </div>
        </div>
      </div>

      <div class="spec">
        <div class="spec-h">
          <span class="spec-name">Per-component :pt</span>
          <span class="spec-note">aria-label + data-test на root</span>
        </div>
        <div class="spec-b">
          <div class="row">
            <WlButton
              variant="primary"
              :pt="{ root: { 'aria-label': 'Создать задачу', 'data-test': 'app-button' } }"
            >
              Кнопка с pt
            </WlButton>
            <span class="muted">root получит aria-label и data-test через PrimeVue pt.</span>
          </div>
        </div>
      </div>
    </section>
  </main>

  <!-- Оверлеи -->
  <WlToast />
  <WlDialog v-model:visible="dialogVisible" header="Новая задача">
    <div class="col">
      <WlInput v-model="text" placeholder="Название задачи" />
      <WlTextarea v-model="note" placeholder="Описание…" />
      <WlSelect v-model="city" :options="cities" option-label="label" option-value="value" placeholder="Исполнитель (город)" />
    </div>
    <template #footer>
      <WlButton variant="ghost" @click="dialogVisible = false">Отмена</WlButton>
      <WlButton variant="primary" @click="dialogVisible = false">Создать</WlButton>
    </template>
  </WlDialog>

  <WlDrawer v-model:visible="drawerVisible" header="Детали задачи" position="right">
    <p>
      Drawer — боковая панель поверх контента. Подходит для деталей записи, фильтров
      и вторичных действий, не прерывая основной сценарий.
    </p>
    <p style="margin-top: 12px">
      Позиция задаётся prop'ом <code>position</code>: right (по умолчанию), left, top, bottom, full.
    </p>
    <template #footer>
      <WlButton variant="secondary" @click="drawerVisible = false">Закрыть</WlButton>
      <WlButton variant="primary" @click="drawerVisible = false">Сохранить</WlButton>
    </template>
  </WlDrawer>
</template>

<style>
.pg-top {
  height: 60px;
  border-bottom: 1px solid var(--wl-border);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  position: sticky;
  top: 0;
  background: var(--wl-bg);
  z-index: 50;
}
.pg-logo {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--wl-accent);
  color: var(--wl-on-accent);
  font-weight: 700;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pg-title {
  font-size: 14.5px;
}
.pg-theme {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.pg-main {
  max-width: 980px;
  margin: 0 auto;
  padding: 36px 24px 120px;
}
.pg-h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.pg-lead {
  font-size: 14px;
  color: var(--wl-text-2);
  margin: 8px 0 40px;
  max-width: 640px;
}
.pg-sec {
  margin-bottom: 56px;
}
.pg-sec-title {
  font-size: 17px;
  font-weight: 650;
  letter-spacing: -0.01em;
}
.pg-sec-desc {
  font-size: 13px;
  color: var(--wl-text-2);
  margin: 5px 0 18px;
  max-width: 640px;
}
.spec {
  border: 1px solid var(--wl-border);
  border-radius: var(--wl-radius);
  margin-bottom: 14px;
  overflow: hidden;
  background: var(--wl-bg);
}
.spec-h {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 16px;
  border-bottom: 1px solid var(--wl-border);
  background: var(--wl-bg-soft);
}
.spec-name {
  font-size: 12.5px;
  font-weight: 600;
}
.spec-note {
  font-size: 11.5px;
  color: var(--wl-text-3);
  font-family: var(--wl-mono);
}
.spec-b {
  padding: 20px;
}
.row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}
.row + .row {
  margin-top: 14px;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.col + .col,
.col + .row {
  margin-top: 14px;
}
.muted {
  color: var(--wl-text-3);
  font-size: 12.5px;
}
code {
  font-family: var(--wl-mono);
  font-size: 12px;
  background: var(--wl-bg-soft);
  border: 1px solid var(--wl-border);
  border-radius: 5px;
  padding: 1px 6px;
}
</style>

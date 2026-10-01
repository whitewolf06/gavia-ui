<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, ref, watch } from "vue";
import {
  resolveWlToken, wlDesignTokens, wlDesignThemes, wlTypography, wlSpacing,
  wlBreakpoints, wlContrastReport, type WlDesignTokenName, type WlDesignTokenDefinition
} from "../../../packages/ui-kit/src/design-system";
import { wlManifest } from "../../../packages/ui-kit/src/manifest";
import { WL_ICON_NAMES } from "../../../packages/ui-kit/src/icons.generated";
import type { WlThemeName, WlTableColumn } from "../../../packages/ui-kit/src/types";
import type { WlComponentManifest } from "../../../packages/ui-kit/src/manifest/types";
import ComponentExplorer from "./design-system/ComponentExplorer.vue";
import RecipeGallery from "./design-system/RecipeGallery.vue";
import ContentStress from "./design-system/ContentStress.vue";

const WlButton = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlButton.vue"));
const WlInput = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlInput.vue"));
const WlField = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlField.vue"));
const WlSelect = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSelect.vue"));
const WlSwitch = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSwitch.vue"));
const WlAlert = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlAlert.vue"));
const WlEmpty = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlEmpty.vue"));
const WlSkeleton = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSkeleton.vue"));
const WlSegmented = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlSegmented.vue"));
const WlTable = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlTable.vue"));
const WlDrawer = defineAsyncComponent(() => import("../../../packages/ui-kit/src/components/WlDrawer.vue"));

const props = defineProps<{ theme: WlThemeName }>();
const emit = defineEmits<{ (event: "component", name: string): void }>();
const sections = [
  ["foundations", "Основы"], ["typography", "Типографика"], ["layout", "Сетка и отступы"],
  ["tokens", "Токены"], ["components", "Контракты"], ["patterns", "Паттерны"],
  ["recipes", "Рецепты"], ["stress", "Сложный контент"], ["accessibility", "Доступность"]
] as const;
const semanticColors = ["bg", "bg-soft", "text", "text-muted", "accent", "success", "warn", "danger"] as const;
const query = ref("");
const layer = ref("semantic");
const category = ref("all");
const categories = [...new Set(wlDesignTokens.map((token) => token.category))].sort();
const tokenRows = computed(() => {
  const needle = query.value.toLowerCase().trim();
  return wlDesignTokens.filter((token) => (layer.value === "all" || token.layer === layer.value)
    && (category.value === "all" || token.category === category.value))
    .map((token) => ({ ...token, value: (token as WlDesignTokenDefinition).themes?.[props.theme] ?? token.value, resolved: resolveWlToken(token.name, props.theme) }))
    .filter((token) => !needle || `${token.name} ${token.description} ${token.value} ${token.resolved}`.toLowerCase().includes(needle));
});
const selectedComponent = ref("WlButton");
const contract = computed(() => wlManifest.find((entry) => entry.name === selectedComponent.value) as WlComponentManifest);
const componentOptions = wlManifest.map((entry) => ({ label: entry.name, value: entry.name }));
const name = ref("");
const email = ref("");
const submitted = ref(false);
const saved = ref(false);
watch([name, email], () => { saved.value = false; });
const nameError = computed(() => submitted.value && !name.value.trim() ? "Введите имя." : "");
const emailError = computed(() => submitted.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? "Введите адрес в формате name@example.com." : "");
async function submitForm(): Promise<void> {
  submitted.value = true;
  saved.value = false;
  if (nameError.value || emailError.value) {
    await nextTick();
    document.getElementById(nameError.value ? "ds-name" : "ds-email")?.focus();
    return;
  }
  saved.value = true;
}
const contentState = ref<string | null>("ready");
const stateOptions = [
  { label: "Данные", value: "ready" }, { label: "Загрузка", value: "loading" },
  { label: "Пусто", value: "empty" }, { label: "Ошибка", value: "error" }
];
const columns: WlTableColumn[] = [{ key: "name", label: "Материал" }, { key: "status", label: "Состояние" }];
const rows = [{ name: "Правила типографики", status: "Готово" }, { name: "Каталог токенов", status: "Готово" }, { name: "Контракты компонентов", status: "Готово" }];
const drawerVisible = ref(false);
const motion = ref(true);
const themeContrast = computed(() => wlContrastReport.filter((pair) => pair.theme === props.theme));
const resolved = (name: WlDesignTokenName, theme = props.theme): string => resolveWlToken(name, theme);
const layoutCode = `<section class="wl-container">
  <div class="wl-stack" data-space="xl">
    <h1 class="wl-text-title">Заголовок страницы</h1>
    <div class="wl-grid" data-space="lg">
      <article class="wl-surface">Содержимое</article>
    </div>
  </div>
</section>`;
const tokenCode = `.page {
  color: var(--wl-text);
  background: var(--wl-bg);
  gap: var(--wl-space-lg);
}
/* Настройка конкретного компонента */
.page-actions { --wl-btn-height: var(--wl-control-height-lg); }`;
</script>

<template>
  <main class="ds-main wl-container" id="ds-top">
    <header class="ds-hero wl-stack" data-space="lg">
      <p class="ds-eyebrow">WhiteUI / Design system</p>
      <h1 class="wl-text-display">Единый язык интерфейсов</h1>
      <p class="ds-lead wl-text-body wl-text-muted">Знакомый стиль WhiteLife: спокойные поверхности, ясная иерархия и предсказуемое поведение. От значения токена до готового сценария — одна система в трёх темах.</p>
      <div class="ds-metrics wl-inline" data-space="xl">
        <span><strong>{{ wlManifest.length }}</strong> компонентов</span>
        <span><strong>{{ wlDesignTokens.length }}</strong> токенов</span>
        <span><strong>{{ WL_ICON_NAMES.length }}</strong> иконок</span>
        <span><strong>3</strong> темы</span>
      </div>
    </header>
    <div class="ds-shell">
      <nav class="ds-nav" aria-label="Разделы дизайн-системы">
        <a v-for="[id, label] in sections" :key="id" :href="`#ds-${id}`">{{ label }}</a>
      </nav>
      <div class="ds-content wl-stack" data-space="4xl">
        <section id="ds-foundations" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm">
            <p class="ds-eyebrow">01 / Основы</p>
            <h2 class="wl-text-title">Смысл важнее декора</h2>
            <p class="wl-text-body wl-text-muted">Один основной акцент на сценарий. Цвет сообщает смысл вместе с текстом или иконкой. Группы объединяются отступами и поверхностями.</p>
          </div>
          <div class="wl-grid" data-space="lg">
            <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">Ясность</h3><p class="wl-text-body wl-text-muted">Короткие подписи, видимые состояния, явное основное действие.</p></article>
            <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">Последовательность</h3><p class="wl-text-body wl-text-muted">Размеры, отступы и интерактивность следуют общему контракту.</p></article>
            <article class="wl-surface wl-stack" data-space="sm"><h3 class="wl-text-subheading">Доступность</h3><p class="wl-text-body wl-text-muted">Клавиатура, видимый фокус, подписи полей и достаточный контраст.</p></article>
          </div>
          <div class="wl-grid ds-theme-grid" data-space="lg">
            <article v-for="item in wlDesignThemes" :key="item.name" :data-wl-theme="item.name" class="wl-surface wl-stack ds-theme-preview" data-space="md">
              <h3 class="wl-text-heading">{{ item.label }}</h3>
              <p class="wl-text-small wl-text-muted">{{ item.description }}</p>
              <div class="ds-palette">
                <span v-for="color in semanticColors" :key="color" class="ds-color" :title="`--wl-${color}: ${resolved(`--wl-${color}`, item.name)}`" :style="{ background: `var(--wl-${color})` }" />
              </div>
              <WlButton variant="primary" size="sm">Основное действие</WlButton>
            </article>
          </div>
          <div class="wl-grid" data-space="lg">
            <article class="wl-surface ds-elevation" :style="{ boxShadow: 'var(--wl-elevation-surface)' }"><h3 class="wl-text-subheading">Поверхность</h3><p class="wl-text-small wl-text-muted">Карточки и разделы / elevation-surface</p></article>
            <article class="wl-surface ds-elevation" :style="{ boxShadow: 'var(--wl-elevation-floating)' }"><h3 class="wl-text-subheading">Всплывающий слой</h3><p class="wl-text-small wl-text-muted">Меню и панели / elevation-floating</p></article>
          </div>
        </section>

        <section id="ds-typography" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">02 / Типографика</p><h2 class="wl-text-title">Роли текста</h2><p class="wl-text-body wl-text-muted">Размер задаётся ролью. Семантические h1–h6 сохраняют структуру документа; класс определяет внешний вид. Newspaper использует свои шрифты через те же токены.</p></div>
          <div class="wl-surface ds-type-list">
            <div v-for="role in wlTypography" :key="role.name" class="ds-type-row">
              <div><code class="wl-text-code">{{ role.name }}</code><p class="wl-text-small wl-text-muted">{{ resolved(role.fontSize) }} / {{ resolved(role.lineHeight) }} · {{ resolved(role.fontWeight) }}</p></div>
              <div><p :class="`wl-text-${role.name}`">{{ role.label }}</p><p class="wl-text-small wl-text-muted">{{ role.description }}</p></div>
            </div>
          </div>
          <p class="wl-text-small wl-text-muted">Текст основного сценария — body, пояснения — small + text-muted. Ограничивайте длинную строку примерно 60–75 символами. --wl-text-3 оставлен для декоративных деталей.</p>
        </section>

        <section id="ds-layout" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">03 / Сетка и отступы</p><h2 class="wl-text-title">Ритм без случайных чисел</h2><p class="wl-text-body wl-text-muted">Малая группа — 8 px, поля формы — 16 px, карточка — 24 px, разделы — 48–64 px. Компактная плотность подходит для насыщенных рабочих экранов.</p></div>
          <div class="wl-surface ds-spacing">
            <div v-for="(token, space) in wlSpacing" :key="space" class="ds-space-row">
              <code class="wl-text-code">{{ space }}</code><span class="ds-space-bar" :style="{ width: `var(${token})` }" /><span class="wl-text-small wl-text-muted">{{ resolved(token) }}</span>
            </div>
          </div>
          <div class="wl-grid" data-space="lg">
            <div class="wl-surface wl-stack" data-space="md"><h3 class="wl-text-subheading">Адаптивная сетка</h3><div class="wl-grid" data-space="sm"><div class="ds-grid-cell">Карточка A</div><div class="ds-grid-cell">Карточка B</div></div><p class="wl-text-small wl-text-muted">Карточки автоматически переходят в одну колонку. Контейнер: {{ resolved('--wl-layout-page-max') }}.</p></div>
            <pre class="ds-code"><code>{{ layoutCode }}</code></pre>
          </div>
          <div class="wl-inline wl-text-small wl-text-muted" data-space="lg"><span v-for="(width, key) in wlBreakpoints" :key="key">{{ key }}: {{ width }} px</span></div>
          <p class="wl-text-small wl-text-muted">CSS подключается явно: styles/primitives.css. На узком экране сохраняйте логичный порядок чтения, переносите действия и используйте горизонтальную прокрутку только внутри таблиц.</p>
        </section>

        <section id="ds-tokens" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">04 / Токены</p><h2 class="wl-text-title">Каталог значений</h2><p class="wl-text-body wl-text-muted">Foundation → semantic → component. Каталог, CSS и типы генерируются из tokens/source.json. Значения ниже соответствуют теме {{ theme }}.</p></div>
          <pre class="ds-code"><code>{{ tokenCode }}</code></pre>
          <div class="ds-token-filters wl-grid" data-space="md">
            <WlField label="Поиск токена" id="ds-token-search" v-slot="field"><WlInput :id="field.id" v-model="query" placeholder="Название, описание или значение" type="search" /></WlField>
            <div class="wl-stack" data-space="sm"><label class="wl-text-label" for="ds-token-layer">Слой</label><select id="ds-token-layer" v-model="layer" class="ds-native-select"><option value="all">Все слои</option><option value="foundation">Foundation</option><option value="semantic">Semantic</option><option value="component">Component</option></select></div>
            <div class="wl-stack" data-space="sm"><label class="wl-text-label" for="ds-token-category">Категория</label><select id="ds-token-category" v-model="category" class="ds-native-select"><option value="all">Все категории</option><option v-for="item in categories" :key="item" :value="item">{{ item }}</option></select></div>
          </div>
          <p class="wl-text-small wl-text-muted" role="status">Найдено токенов: <strong data-testid="ds-token-count">{{ tokenRows.length }}</strong> / {{ wlDesignTokens.length }}</p>
          <div class="ds-table-scroll ds-token-catalog" tabindex="0" role="region" aria-label="Каталог токенов">
            <table class="ds-token-table">
              <thead><tr><th scope="col">Токен / роль</th><th scope="col">Ссылка</th><th scope="col">Значение</th></tr></thead>
              <tbody><tr v-for="token in tokenRows" :key="token.name" :data-token="token.name">
                <th scope="row"><code>{{ token.name }}</code><p class="wl-text-small wl-text-muted">{{ token.description }}</p><span class="ds-token-layer">{{ token.layer }}</span></th>
                <td><code>{{ token.value }}</code></td>
                <td><span v-if="token.type === 'color'" class="ds-value-color" :style="{ background: token.resolved }" /><code>{{ token.resolved }}</code></td>
              </tr></tbody>
            </table>
            <p v-if="!tokenRows.length" class="ds-no-results wl-text-body">Токены не найдены. Измените запрос или фильтры.</p>
          </div>
        </section>

        <section id="ds-components" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">05 / Компоненты</p><h2 class="wl-text-title">Публичные контракты</h2><p class="wl-text-body wl-text-muted">Props, модели, события и слоты берутся из манифеста библиотеки. Размер и плотность меняют геометрию; вариант передаёт смысл действия; состояния отражают его доступность.</p></div>
          <div class="wl-surface wl-stack" data-space="lg">
            <div class="wl-inline" data-space="sm"><WlButton variant="primary">Основное</WlButton><WlButton variant="secondary">Дополнительное</WlButton><WlButton variant="ghost">Тихое</WlButton><WlButton variant="danger">Удалить</WlButton></div>
            <div class="wl-inline" data-space="sm"><WlButton size="sm">Маленькая</WlButton><WlButton size="md">Обычная</WlButton><WlButton size="lg">Крупная</WlButton><WlButton density="compact">Компактная</WlButton></div>
            <div class="wl-inline" data-space="sm"><WlButton disabled>Недоступно</WlButton><WlButton loading>Сохранение</WlButton><WlField label="Поле с ошибкой" id="ds-state-invalid" error="Проверьте значение." v-slot="field"><WlInput :id="field.id" model-value="Некорректное значение" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" /></WlField></div>
            <p class="wl-text-small wl-text-muted">Один primary на группу. Danger — для необратимого действия с подтверждением. Loading блокирует повторную отправку; disabled сопровождается объяснением причины рядом.</p>
          </div>
          <WlField label="Компонент" id="ds-component-picker" v-slot="field"><WlSelect :id="field.id" aria-label="Компонент" v-model="selectedComponent" :options="componentOptions" option-label="label" option-value="value" /></WlField>
          <article class="wl-surface wl-stack" data-space="lg" data-testid="ds-contract">
            <div class="wl-inline" data-space="sm"><h3 class="wl-text-heading">{{ contract.name }}</h3><span class="wl-text-small wl-text-muted">С версии {{ contract.introducedIn }}</span><WlButton size="sm" @click="emit('component', contract.name)">Открыть в витрине</WlButton></div>
            <p class="wl-text-body wl-text-muted">{{ contract.description }}</p>
            <div v-if="contract.model" class="ds-contract-model wl-text-code">v-model{{ contract.model.name === 'modelValue' ? '' : `:${contract.model.name}` }}: {{ contract.model.type }}</div>
            <div class="ds-table-scroll" tabindex="0" role="region" :aria-label="`Props ${contract.name}`"><table class="ds-token-table"><thead><tr><th scope="col">Prop</th><th scope="col">Тип / значения</th><th scope="col">Назначение</th></tr></thead><tbody><tr v-for="prop in contract.props" :key="prop.name"><th scope="row"><code>{{ prop.name }}{{ prop.required ? ' *' : '' }}</code></th><td><code>{{ prop.values?.join(' | ') ?? prop.type }}</code></td><td class="wl-text-small">{{ prop.description }}<p v-if="prop.default !== undefined" class="wl-text-muted">По умолчанию: {{ JSON.stringify(prop.default) }}</p></td></tr></tbody></table></div>
            <div class="wl-grid" data-space="lg"><div><h4 class="wl-text-label">Слоты</h4><ul class="ds-list wl-text-small"><li v-for="slot in contract.slots" :key="slot.name"><code>{{ slot.name }}</code> — {{ slot.description }}</li><li v-if="!contract.slots.length">Нет</li></ul></div><div><h4 class="wl-text-label">События</h4><ul class="ds-list wl-text-small"><li v-for="event in contract.emits" :key="event.name"><code>{{ event.name }}</code> — {{ event.payload ?? event.description }}</li><li v-if="!contract.emits.length">Нет дополнительных событий</li></ul></div></div>
            <ComponentExplorer :entry="contract" />
          </article>
        </section>

        <section id="ds-patterns" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">06 / Паттерны</p><h2 class="wl-text-title">Собираем целые сценарии</h2><p class="wl-text-body wl-text-muted">Библиотека задаёт представление и взаимодействие. Валидация, запросы и бизнес-правила принадлежат приложению. Эти примеры работают локально в витрине.</p></div>
          <div class="wl-grid" data-space="xl">
            <form class="wl-surface wl-stack" data-space="lg" novalidate @submit.prevent="submitForm" aria-label="Пример формы">
              <h3 class="wl-text-heading">Форма с валидацией</h3>
              <WlField label="Имя" id="ds-name" required :error="nameError" hint="Как к вам обращаться" v-slot="field"><WlInput :id="field.id" v-model="name" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" required autocomplete="name" /></WlField>
              <WlField label="Email" id="ds-email" required :error="emailError" hint="Например: name@example.com" v-slot="field"><WlInput :id="field.id" v-model="email" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" type="email" required autocomplete="email" /></WlField>
              <WlButton variant="primary" type="submit">Сохранить пример</WlButton>
              <WlAlert v-if="saved" variant="ok" title="Данные проверены">Пример сохранён локально.</WlAlert>
            </form>
            <article class="wl-surface wl-stack" data-space="lg"><h3 class="wl-text-heading">Правила формы</h3><ol class="ds-list wl-text-body wl-text-muted"><li>Видимая подпись связана с контролом через id.</li><li>Подсказка и ошибка связаны через aria-describedby.</li><li>При отправке фокус переходит к первой ошибке.</li><li>Введённые данные сохраняются после ошибки.</li><li>Результат действия объясняется текстом.</li></ol><p class="wl-text-small wl-text-muted">WlField передаёт id, invalid и ariaDescribedby через scoped slot. Placeholder дополняет подпись.</p></article>
          </div>
          <article class="wl-surface wl-stack" data-space="lg">
            <h3 class="wl-text-heading">Четыре состояния данных</h3>
            <WlSegmented v-model="contentState" :options="stateOptions" :pt="{ root: { style: { flexWrap: 'wrap', height: 'auto' } } }" aria-label="Состояние данных" />
            <div class="ds-data-preview" data-testid="ds-data-state">
              <div v-if="contentState === 'loading'" class="wl-stack" data-space="lg" role="status" aria-busy="true"><span class="wl-text-small wl-text-muted">Загружаем материалы…</span><WlSkeleton height="20px" /><WlSkeleton height="20px" width="80%" /><WlSkeleton height="20px" width="60%" /></div>
              <WlEmpty v-else-if="contentState === 'empty'" icon="file" title="Материалов пока нет" description="Добавьте первый материал, чтобы начать работу."><template #action><WlButton @click="contentState = 'ready'">Добавить пример</WlButton></template></WlEmpty>
              <WlAlert v-else-if="contentState === 'error'" variant="err" title="Не удалось загрузить материалы">Повторите попытку. Ваши данные сохранены.<template #action><WlButton size="sm" @click="contentState = 'ready'">Повторить</WlButton></template></WlAlert>
              <WlTable v-else :columns="columns" :value="rows" />
            </div>
          </article>
          <article class="wl-surface wl-stack" data-space="lg"><h3 class="wl-text-heading">Вторичное действие в панели</h3><p class="wl-text-body wl-text-muted">Drawer сохраняет контекст страницы. Escape закрывает панель, фокус возвращается к кнопке открытия. Анимация настраивается глобально и локально.</p><div class="wl-inline wl-text-body" data-space="sm"><WlSwitch v-model="motion" aria-label="Анимация примера панели">Анимация панели</WlSwitch></div><div><WlButton @click="drawerVisible = true">Открыть панель</WlButton></div></article>
        </section>

        <section id="ds-recipes" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">07 / Рецепты</p><h2 class="wl-text-title">Готовые рабочие сценарии</h2><p class="wl-text-body wl-text-muted">Шесть связанных сценариев с кодом для копирования. Состояния, отмена, ошибки и повторные действия проверяются вместе с компонентами.</p></div>
          <RecipeGallery />
        </section>
        <section id="ds-stress" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">08 / Сложный контент</p><h2 class="wl-text-title">Проверяем границы</h2><p class="wl-text-body wl-text-muted">Длинный русский текст, восемь тегов, 80 вариантов выбора, 20 строк таблицы, ограниченные даты и вложенные оверлеи. Изменяйте ширину окна и размер текста.</p></div>
          <ContentStress />
        </section>
        <section id="ds-accessibility" class="ds-section wl-stack" data-space="xl">
          <div class="wl-stack" data-space="sm"><p class="ds-eyebrow">09 / Доступность</p><h2 class="wl-text-title">Проверяемые правила</h2><p class="wl-text-body wl-text-muted">Контраст текста — от 4.5:1, индикатора фокуса — от 3:1. Отчёт проверяет перечисленные пары токенов; пользовательские цвета и весь экран проверяются отдельно.</p></div>
          <div class="wl-grid" data-space="lg"><article class="wl-surface"><h3 class="wl-text-subheading">Клавиатура</h3><p class="wl-text-body wl-text-muted">Tab — переход. Enter / Space — действие. Стрелки — выбор. Escape — закрытие оверлея. Фокус виден и возвращается после закрытия.</p></article><article class="wl-surface"><h3 class="wl-text-subheading">Движение</h3><p class="wl-text-body wl-text-muted">motion: false выключает переходы. Системное prefers-reduced-motion действует во всех темах. Анимация не меняет смысл или время жизни данных.</p></article><article class="wl-surface"><h3 class="wl-text-subheading">Текст и цель</h3><p class="wl-text-body wl-text-muted">Иконка действия получает aria-label. Ошибка объясняет следующий шаг. Цель на touch-экране: ориентир 44 × 44 px; выбирайте lg и достаточные интервалы.</p></article></div>
          <div class="ds-table-scroll" tabindex="0" role="region" aria-label="Контраст темы"><table class="ds-token-table"><thead><tr><th scope="col">Пара / {{ theme }}</th><th scope="col">Факт</th><th scope="col">Минимум</th></tr></thead><tbody><tr v-for="pair in themeContrast" :key="pair.name"><th scope="row">{{ pair.label }}</th><td class="ds-contrast-pass">{{ pair.ratio }}:1</td><td>{{ pair.minimum }}:1</td></tr></tbody></table></div>
          <p class="wl-text-small wl-text-muted">Новые токены проходят tokens:check. Паттерны проверяются в Chromium, Firefox, WebKit и мобильном Chromium. Перед релизом также проверяются типы, архив и изолированный потребитель.</p>
        </section>
        <footer class="ds-footer wl-text-small wl-text-muted">WhiteUI · Vue 3 · открытые контракты · документация в docs/design-system.md</footer>
      </div>
    </div>
    <WlDrawer v-model:visible="drawerVisible" header="Настройка представления" :motion="motion">
      <div class="wl-stack" data-space="lg"><h2 class="wl-text-heading">Сохранённый контекст</h2><p class="wl-text-body wl-text-muted">Настройки отображаются поверх страницы. Закройте панель клавишей Escape и проверьте возврат фокуса.</p><p class="wl-text-small wl-text-muted">Длительность: {{ resolved('--wl-motion-slow') }} · easing: {{ resolved('--wl-motion-ease') }}</p></div>
      <template #footer><WlButton variant="primary" @click="drawerVisible = false">Готово</WlButton></template>
    </WlDrawer>
  </main>
</template>

<style>
.ds-main { padding-block: var(--wl-space-3xl) var(--wl-space-4xl); }
.ds-hero { padding-bottom: var(--wl-space-3xl); border-bottom: 1px solid var(--wl-border); margin-bottom: var(--wl-space-2xl); }
.ds-eyebrow { font-family: var(--wl-mono); font-size: 11px; line-height: 18px; letter-spacing: .08em; text-transform: uppercase; color: var(--wl-text-muted); }
.ds-lead { max-width: 68ch; }
.ds-metrics { color: var(--wl-text-muted); font-size: 12px; }
.ds-metrics strong { color: var(--wl-text); font-size: 18px; margin-right: 4px; }
.ds-shell { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: var(--wl-space-2xl); }
.ds-nav { position: sticky; top: 84px; align-self: start; display: flex; flex-direction: column; gap: 4px; border-left: 1px solid var(--wl-border); padding-left: var(--wl-space-md); }
.ds-nav a { color: var(--wl-text-muted); font-size: 13px; padding: 8px; text-decoration: none; border-radius: var(--wl-radius-sm); }
.ds-nav a:hover { color: var(--wl-text); background: var(--wl-bg-soft); }
.ds-nav a:focus-visible, .ds-native-select:focus-visible, .ds-table-scroll:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; }
.ds-content { min-width: 0; }
.ds-section { scroll-margin-top: 90px; }
.ds-section > div:first-child > p:last-child { max-width: 72ch; }
.ds-theme-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.ds-theme-preview { padding: var(--wl-space-lg); }
.ds-palette { display: flex; flex-wrap: wrap; gap: 4px; }
.ds-color { width: 21px; height: 21px; border: 1px solid var(--wl-border); border-radius: 50%; }
.ds-theme-preview .wl-btn { align-self: start; }
.ds-elevation { min-height: 110px; display: flex; flex-direction: column; justify-content: center; gap: var(--wl-space-sm); }
.ds-type-list { padding-block: 0; }
.ds-type-row { display: grid; grid-template-columns: 145px minmax(0, 1fr); gap: var(--wl-space-lg); padding-block: var(--wl-space-lg); align-items: baseline; }
.ds-type-row + .ds-type-row { border-top: 1px solid var(--wl-border); }
.ds-type-row p { overflow-wrap: anywhere; }
.ds-type-row code { color: var(--wl-accent); }
.ds-spacing { display: grid; gap: var(--wl-space-md); }
.ds-space-row { display: grid; grid-template-columns: 42px 80px 1fr; gap: var(--wl-space-lg); align-items: center; }
.ds-space-bar { height: 14px; background: var(--wl-accent); border-radius: 2px; }
.ds-grid-cell { padding: var(--wl-space-lg); border: 1px dashed var(--wl-accent-border); background: var(--wl-accent-soft); border-radius: var(--wl-radius-sm); color: var(--wl-text); font-size: 12px; }
.ds-code { padding: var(--wl-space-lg); border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); background: var(--wl-bg-soft); color: var(--wl-text); overflow: auto; font-family: var(--wl-mono); font-size: 12px; line-height: 20px; max-width: 100%; white-space: pre-wrap; overflow-wrap: anywhere; }
.ds-token-filters { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr); align-items: start; }
.ds-native-select { height: var(--wl-input-height); border: 1px solid var(--wl-border); border-radius: var(--wl-input-radius); padding-inline: var(--wl-space-md); background: var(--wl-bg); color: var(--wl-text); font: inherit; width: 100%; }
.ds-table-scroll { overflow: auto; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-surface); max-width: 100%; }
.ds-token-catalog { max-height: 560px; }
.ds-token-catalog thead { position: sticky; top: 0; z-index: 1; }
.ds-token-table { border-collapse: collapse; width: 100%; font-size: 12px; line-height: 18px; text-align: left; }
.ds-token-table th, .ds-token-table td { padding: 12px 16px; vertical-align: top; border-bottom: 1px solid var(--wl-border); }
.ds-token-table thead { background: var(--wl-bg-soft); }
.ds-token-table tbody th { min-width: 230px; font-weight: 500; }
.ds-token-table td { min-width: 155px; }
.ds-token-table code { font-family: var(--wl-mono); font-size: 11px; overflow-wrap: anywhere; }
.ds-token-table tbody tr:last-child > * { border-bottom: 0; }
.ds-token-layer { color: var(--wl-text-muted); font-size: 10px; }
.ds-value-color { display: inline-block; width: 12px; height: 12px; border: 1px solid var(--wl-border); border-radius: 3px; margin-right: 6px; vertical-align: middle; }
.ds-no-results { padding: var(--wl-space-xl); }
.ds-contract-model { padding: var(--wl-space-md); background: var(--wl-bg-soft); border-radius: var(--wl-radius-sm); }
.ds-list { padding-left: 20px; margin-top: var(--wl-space-sm); }
.ds-list li + li { margin-top: var(--wl-space-sm); }
.ds-data-preview { min-height: 180px; overflow-x: auto; }
.ds-contrast-pass { color: var(--wl-ok-text); font-weight: 600; }
.ds-footer { padding-top: var(--wl-space-lg); border-top: 1px solid var(--wl-border); }
@media (max-width: 900px) {
  .ds-shell { grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-xl); }
  .ds-nav { position: static; flex-direction: row; flex-wrap: wrap; border-left: 0; padding-left: 0; border-bottom: 1px solid var(--wl-border); padding-bottom: var(--wl-space-md); }
}
@media (max-width: 640px) {
  .ds-main { padding-inline: var(--wl-space-md); padding-top: var(--wl-space-xl); }
  .ds-hero h1 { font-size: var(--wl-type-title-size); line-height: var(--wl-type-title-line-height); }
  .ds-theme-grid, .ds-token-filters { grid-template-columns: minmax(0, 1fr); }
  .ds-type-row { grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-sm); }
  .ds-section { scroll-margin-top: 145px; }
}
</style>

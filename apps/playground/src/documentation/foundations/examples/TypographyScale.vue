<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlAccordion, WlAlert, WlCard, WlCheckbox, WlSegmented, wlTypography } from "gavia-ui";
import { computed, ref } from "vue";
const semantic = ref(false);
const choice = ref<"draft" | "published" | null>("draft");
const scale = {
  "--wl-type-body-size": "18px", "--wl-type-body-line-height": "28px",
  "--wl-type-subheading-size": "22px", "--wl-type-subheading-line-height": "30px",
  "--wl-type-control-size": "18px", "--wl-type-small-size": "14px",
  "--wl-type-small-line-height": "22px", "--wl-type-label-line-height": "26px"
};
const mappings = [
  ["card-title", "14px", "subheading"], ["card-subtitle", "12.5px", "small"], ["card-content", "13.5px", "body"],
  ["accordion-title", "13.5px", "control / label"], ["accordion-body", "13px", "body"],
  ["alert", "13px", "body"], ["alert-title", "inherit", "subheading"], ["segmented", "13px", "control / label"]
];
const items = computed(() => [{
  key: "one", title: t("examples.team_guide_0016"), content: t("examples.team_structure_roles_and_agreements_0024")
}]);
const options = computed(() => [
  { value: "draft" as const, label: t("examples.draft_0291") },
  { value: "published" as const, label: t("examples.published_0165") }
]);
const roleText = {
  display: { label: t("examples.typography.display.label"), description: t("examples.typography.display.description") },
  title: { label: t("examples.typography.title.label"), description: t("examples.typography.title.description") },
  heading: { label: t("examples.typography.heading.label"), description: t("examples.typography.heading.description") },
  subheading: { label: t("examples.typography.subheading.label"), description: t("examples.typography.subheading.description") },
  body: { label: t("examples.typography.body.label"), description: t("examples.typography.body.description") },
  small: { label: t("examples.typography.small.label"), description: t("examples.typography.small.description") },
  label: { label: t("examples.typography.label.label"), description: t("examples.typography.label.description") },
  code: { label: t("examples.typography.code.label"), description: t("examples.typography.code.description") }
};
</script>

<template>
  <section class="wl-stack" data-space="xl">
    <dl class="typography-example wl-stack" data-space="lg">
      <div v-for="role in wlTypography" :key="role.name" class="typography-example-role">
        <dt class="wl-stack" data-space="xs">
          <code class="wl-text-code">{{ 'wl-text-' + role.name }}</code>
          <span class="wl-text-small wl-text-muted">{{ roleText[role.name].description }}</span>
        </dt>
        <dd><p :class="'wl-text-' + role.name">{{ roleText[role.name].label }}</p></dd>
      </div>
    </dl>
    <WlCheckbox v-model="semantic">{{ t("examples.semanticComponentScale") }}</WlCheckbox>
    <p class="wl-text-small">{{ t("examples.semanticComponentScaleGuide") }}</p>
    <table class="typography-role-map">
      <caption>{{ t("examples.componentTypeMapping") }}</caption>
      <thead><tr>
        <th scope="col">{{ t("examples.componentTypePrefix") }}</th>
        <th scope="col">{{ t("examples.componentTypeDefault") }}</th>
        <th scope="col">wl-type-scale</th>
      </tr></thead>
      <tbody><tr v-for="[prefix, size, role] in mappings" :key="prefix">
        <th scope="row"><code>--wl-{{ prefix }}-*</code></th>
        <td>{{ size }}</td><td><code>{{ role }}</code></td>
      </tr></tbody>
    </table>
    <div
      class="wl-stack"
      :class="{ 'wl-type-scale': semantic }"
      :style="scale"
      data-space="md"
      data-testid="semantic-component-example"
    >
      <WlCard>
        <template #title>{{ t("examples.team_guide_0016") }}</template>
        <template #subtitle>{{ t("examples.updated_october_1_0023") }}</template>
        {{ t("examples.team_structure_roles_and_agreements_0024") }}
      </WlCard>
      <WlAccordion :items="items" :default-open-keys="['one']" />
      <WlAlert :title="t('examples.team_guide_0016')">{{ t("examples.team_structure_roles_and_agreements_0024") }}</WlAlert>
      <WlSegmented
        v-for="size in (['sm', 'md', 'lg'] as const)"
        :key="size"
        v-model="choice"
        :size="size"
        :options="options"
        :aria-label="'Segmented ' + size"
      />
    </div>
  </section>
</template>

<style scoped>
.typography-example { margin: 0; }
.typography-role-map { border-collapse: collapse; width: 100%; overflow-wrap: anywhere; text-align: start; }
.typography-role-map :where(th, td) { padding: var(--wl-space-sm); border-bottom: 1px solid var(--wl-border); text-align: start; }
.typography-example-role {
  display: grid;
  grid-template-columns: minmax(0, 180px) minmax(0, 1fr);
  gap: var(--wl-space-lg);
  padding-bottom: var(--wl-space-lg);
  border-bottom: 1px solid var(--wl-border);
  overflow-wrap: anywhere;
}
.typography-example-role:last-child { padding-bottom: 0; border-bottom: 0; }
.typography-example-role dd { min-width: 0; margin: 0; }
@media (max-width: 640px) { .typography-example-role { grid-template-columns: minmax(0, 1fr); gap: var(--wl-space-sm); } }
</style>

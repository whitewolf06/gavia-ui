<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
</script>
<template>
  <article class="hierarchy-example wl-stack" data-space="lg">
    <header class="wl-stack" data-space="sm">
      <p class="wl-text-small wl-text-muted">{{ t("examples.working_materials_october_3_0989") }}</p>
      <h3 class="wl-text-heading">{{ t("examples.launch_preparation_0990") }}</h3>
      <p class="wl-text-body">{{ t("examples.before_publishing_check_the_project_settings_and_assign_an_own_0991") }}</p>
    </header>
    <section class="wl-stack" data-space="sm">
      <h4 class="wl-text-subheading">{{ t("examples.project_access_0248") }}</h4>
      <p class="wl-text-body">{{ t("examples.members_receive_permissions_through_a_group_0992") }} <code class="wl-text-code">project-editors</code>.</p>
      <p class="wl-text-small wl-text-muted">{{ t("examples.changing_permissions_does_not_affect_previously_saved_material_0993") }}</p>
    </section>
    <dl class="hierarchy-example-meta">
      <div><dt class="wl-text-label">{{ t("examples.owner_0624") }}</dt><dd class="wl-text-body">{{ t("examples.anna_petrova_0994") }}</dd></div>
      <div><dt class="wl-text-label">{{ t("examples.status_0067") }}</dt><dd class="wl-text-body">{{ t("examples.ready_for_review_0995") }}</dd></div>
    </dl>
  </article>
</template>

<style scoped>
.hierarchy-example { max-width: 65ch; overflow-wrap: anywhere; }
.hierarchy-example-meta { display: grid; gap: var(--wl-space-md); margin: 0; }
.hierarchy-example-meta dd { margin: var(--wl-space-xs) 0 0; }
</style>

<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlIcon, resolveWlIconName } from "../../../../../../packages/ui-kit/src";
const legacyName = "pi pi-pencil";
const missingName = "my-missing-icon";
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlIcon name="folder" size="1.25rem" /><p class="wl-text-small">{{ t("examples.css_size_1029") }} <code>size="1.25rem"</code>.</p></div>
    <div class="wl-inline" data-space="md"><WlIcon :name="legacyName" :size="20" /><p class="wl-text-small"><code>{{ legacyName }}</code> → <code>{{ resolveWlIconName(legacyName) }}</code>{{ t("examples.the_application_changes_the_stored_value_separately_1030") }}</p></div>
    <div class="wl-inline" data-space="md"><span role="img" :aria-label="t('examples.fallback_symbol_1031')"><WlIcon :name="missingName" :size="24"><span class="icon-compatibility-fallback" aria-hidden="true">?</span></WlIcon></span><p class="wl-text-small">{{ t("examples.an_unknown_name_preserves_the_default_slot_you_can_show_a_cust_1032") }}</p></div>
  </section>
</template>

<style scoped>
.icon-compatibility-fallback { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 100%; border: 1px solid var(--wl-border); border-radius: var(--wl-corner-control); font: var(--wl-type-label-weight) var(--wl-type-small-size)/1 var(--wl-font); }
</style>

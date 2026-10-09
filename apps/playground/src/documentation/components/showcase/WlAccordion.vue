<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref, watch } from "vue";
import { WlAccordion, WlCheckbox, WlButton, type WlAccordionItem } from "../../../../../../packages/ui-kit/src";
const single = ref(false);
const open = ref(["guide"]);
const action = ref("");
watch(single, enabled => { if (enabled) open.value = open.value.slice(0, 1); });
const items: WlAccordionItem[] = [{ key: "guide", title: t("examples.setup_0296"), content: t("examples.import_css_explicitly_and_import_components_from_gavia_ui_0297") }, { key: "theme", title: t("examples.themes_0298"), content: t("examples.gavia_gavia_dark_classic_classic_dark_and_newspaper_switch_thr_0299") }, { key: "later", title: t("examples.restricted_section_0300"), content: t("examples.this_section_is_unavailable_0301"), disabled: true }];
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <WlCheckbox v-model="single">{{ t("examples.only_one_expanded_item_0302") }}</WlCheckbox>
    <WlAccordion v-model:open-keys="open" :items="items" :single="single"><template #item="{ item, open: expanded }"><div class="wl-stack" data-space="sm"><p class="wl-text-body">{{ item.content }}</p><div><WlButton size="sm" @click="action = item.title">{{ t("examples.check_0303") }} {{ item.title }}</WlButton></div><p class="wl-text-small wl-text-muted">{{ t("examples.scoped_slot_open_0304") }} {{ expanded }}</p></div></template></WlAccordion>
    <p class="wl-text-small" role="status">{{ t("examples.open_keys_0305") }} {{ open.join(', ') || t("examples.none_0306") }}. {{ action ? t("examples.action_0307") + action : '' }}</p>
    <div class="wl-stack" data-space="sm"><h3 class="wl-text-label">{{ t("examples.uncontrolled_variant_0308") }}</h3><WlAccordion single :items="items" /></div>
  </div>
</template>

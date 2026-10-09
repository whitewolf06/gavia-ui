<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlDialog, WlButton, WlField, WlInput, WlCheckbox } from "../../../../../../packages/ui-kit/src";
const visible = ref(false);
const motion = ref(true);
const dismissable = ref(false);
const title = ref(t("examples.release_plan_0371"));
const saved = ref("");
const left = ref(0);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlCheckbox v-model="motion">{{ t("examples.dialog_animation_0401") }}</WlCheckbox><WlCheckbox v-model="dismissable">{{ t("examples.close_on_backdrop_click_0402") }}</WlCheckbox></div>
    <div><WlButton variant="primary" @click="visible = true">{{ t("examples.edit_title_0403") }}</WlButton></div>
    <WlDialog v-model:visible="visible" :header="t('examples.edit_material_0202')" width="min(480px, calc(100vw - 32px))" :motion="motion" :dismissable="dismissable" :pt="{ footer: { style: { flexWrap: 'wrap' } } }" @after-leave="left++"><WlField :label="t('examples.title_0072')" :hint="t('examples.the_result_is_saved_only_in_this_example_0404')"><template #default="{ id, ariaDescribedby }"><WlInput :id="id" v-model="title" :aria-describedby="ariaDescribedby" /></template></WlField><template #footer><WlButton variant="ghost" @click="visible = false">{{ t("examples.cancel_editing_0405") }}</WlButton><WlButton variant="primary" :disabled="!title.trim()" @click="saved = title; visible = false">{{ t("examples.save_title_0406") }}</WlButton></template></WlDialog>
    <p class="wl-text-small" role="status">{{ saved ? t("examples.saved_0407") + saved : t("examples.changes_have_not_been_saved_yet_0408") }} {{ t("examples.completed_closes_0409") }} {{ left }}.</p>
  </div>
</template>

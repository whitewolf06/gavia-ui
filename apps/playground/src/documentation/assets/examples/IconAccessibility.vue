<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlIcon, WlIconButton } from "../../../../../../packages/ui-kit/src";
const count = ref(0);
const message = ref(t("examples.notifications_have_not_been_opened_yet_1022"));
</script>

<template>
  <section class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="sm"><WlIcon name="folder" :size="20" /><span class="wl-text-body">{{ t("examples.materials_0015") }}</span></div>
    <p class="wl-text-small wl-text-muted">{{ t("examples.text_names_the_object_the_adjacent_icon_is_decorative_and_hidd_1023") }}</p>
    <div class="wl-inline" data-space="md"><span role="img" :aria-label="t('examples.secure_connection_1024')"><WlIcon name="shield" :size="24" /></span><p class="wl-text-small">{{ t("examples.the_container_name_describes_a_standalone_image_1025") }}</p></div>
    <div class="wl-inline" data-space="sm">
      <WlButton variant="primary" @click="count++"><template #icon><WlIcon name="plus" :size="18" /></template>{{ t("examples.add_material_0054") }}</WlButton>
      <WlIconButton icon="bell" :aria-label="t('examples.open_notifications_1026')" @click="message = t('examples.notifications_opened_1027')" />
    </div>
    <p class="wl-text-small" role="status">{{ t("examples.materials_added_1028") }} {{ count }}. {{ message }}</p>
  </section>
</template>

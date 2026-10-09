<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlIconButton, WlIcon, type WlIconButtonVariant } from "../../../../../../packages/ui-kit/src";
const variants = ["ghost", "secondary", "soft"] as const satisfies readonly WlIconButtonVariant[];
const active = ref(false);
const message = ref(t("examples.click_an_icon_button_0472"));
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlIconButton v-for="variant in variants" :key="variant" icon="search" :variant="variant" :aria-label="t('examples.search_0473') + variant" @click="message = t('examples.search_selected_0474') + variant" /></div>
    <div class="wl-inline" data-space="md">
      <WlIconButton icon="bell" :count="4" :aria-label="t('examples.notifications_4_unread_0475')" @click="message = t('examples.notifications_opened_0476')" />
      <WlIconButton icon="bell" dot variant="soft" :aria-label="t('examples.there_are_new_notifications_0477')" @click="message = t('examples.new_notifications_marked_as_read_0478')" />
      <WlIconButton icon="user" variant="secondary" size="sm" :aria-label="t('examples.profile_small_button_0479')" @click="message = t('examples.profile_opened_0480')" />
      <WlIconButton icon="plus" :active="active" :aria-pressed="active" :aria-label="t('examples.add_mode_0481')" @click="active = !active" />
      <WlIconButton icon="trash" disabled :aria-label="t('examples.deletion_unavailable_0482')" />
      <WlIconButton :aria-label="t('examples.favorites_custom_slot_0483')" @click="message = t('examples.favorites_opened_0484')"><WlIcon name="star" :size="18" /></WlIconButton>
    </div>
    <p class="wl-text-small" role="status">{{ message }} {{ t("examples.add_mode_0485") }} {{ active ? t("examples.enabled_0486") : t("examples.disabled_0487") }}.</p>
  </div>
</template>

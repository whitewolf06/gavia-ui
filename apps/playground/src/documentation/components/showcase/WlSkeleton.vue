<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlSkeleton, WlButton, WlAvatar } from "../../../../../../packages/ui-kit/src";
const loading = ref(true);
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div><WlButton size="sm" @click="loading = !loading">{{ loading ? t("examples.show_loaded_card_0556") : t("examples.reload_card_0557") }}</WlButton></div>
    <article class="wl-surface wl-stack" data-space="lg" :aria-busy="loading" :aria-label="t('examples.member_card_0558')">
      <div v-if="loading" class="wl-stack" data-space="md"><div class="wl-inline" data-space="md"><WlSkeleton shape="circle" width="40px" height="40px" /><div class="showcase-skeleton-lines wl-stack" data-space="sm"><WlSkeleton height="14px" width="70%" /><WlSkeleton height="11px" width="45%" /></div></div><WlSkeleton height="12px" /><WlSkeleton height="12px" width="80%" /><WlSkeleton height="48px" border-radius="8px" /></div>
      <div v-else class="wl-stack" data-space="md"><div class="wl-inline" data-space="md"><WlAvatar :label="t('examples.dg_0323')" :size="36" /><h3 class="wl-text-subheading">{{ t("examples.dmitry_0559") }}</h3></div><p class="wl-text-body">{{ t("examples.materials_are_ready_for_review_rectangle_and_circle_showed_the_0560") }}</p></div>
    </article>
    <p class="wl-text-small" role="status">{{ loading ? t("examples.loading_member_card_0561") : t("examples.member_card_loaded_0562") }}</p>
  </div>
</template>
<style scoped>
.showcase-skeleton-lines { flex: 1; min-width: 0; }
</style>

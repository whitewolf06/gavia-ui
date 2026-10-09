<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlAvatar, WlIcon, WlCheckbox, type WlAvatarSize } from "../../../../../../packages/ui-kit/src";
const sizes = [24, 28, 32, 36, 48] as const satisfies readonly WlAvatarSize[];
const imageEnabled = ref(true);
const image = "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#2563eb"/><circle cx="24" cy="18" r="8" fill="#fff"/><path d="M10 44c0-18 28-18 28 0" fill="#fff"/></svg>');
</script>
<template>
  <div class="wl-stack" data-space="lg">
    <div class="wl-inline" data-space="md"><WlAvatar v-for="size in sizes" :key="size" :label="t('examples.dg_0323')" :size="size" role="img" :aria-label="t('examples.dmitry_avatar_0324') + size + t('examples.pixels_0325')" /></div>
    <div class="wl-inline" data-space="lg"><div class="wl-inline" data-space="xs"><WlAvatar :label="t('examples.mk_0326')" :size="36" presence="online" /><span class="wl-text-small">{{ t("examples.maria_online_0327") }}</span></div><div class="wl-inline" data-space="xs"><WlAvatar :label="t('examples.ds_0328')" :size="36" presence="busy" /><span class="wl-text-small">{{ t("examples.denis_busy_0329") }}</span></div><div class="wl-inline" data-space="xs"><WlAvatar :label="t('examples.ev_0330')" :size="36" presence="offline" /><span class="wl-text-small">{{ t("examples.elena_offline_0331") }}</span></div></div>
    <WlCheckbox v-model="imageEnabled">{{ t("examples.use_local_image_0332") }}</WlCheckbox>
    <div class="wl-inline" data-space="md"><WlAvatar :image="imageEnabled ? image : undefined" :label="imageEnabled ? t('examples.dmitry_s_avatar_0333') : t('examples.dg_0323')" :size="48" role="img" :aria-label="t('examples.dmitry_image_or_initials_0334')" /><WlAvatar :size="48" role="img" :aria-label="t('examples.user_without_a_photo_0335')"><WlIcon name="user" :size="24" /></WlAvatar></div>
  </div>
</template>

<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlAvatar } from "gavia-ui";
import { getWlColorFromString } from "gavia-ui/utils";
import { computed } from "vue";
const namedAvatarPt = computed(() => ({
  root: {
    style: { outline: `2px solid ${getWlColorFromString(t("examples.utilityAvatarName"))}`, outlineOffset: "2px" }
  }
}));
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlAvatar
      :label="t('examples.am_0013')"
      presence="online"
      :aria-label="t('examples.anna_mikhailova_online_0014')"
      v-bind="preview"
    />
    <div class="wl-inline" data-space="md">
      <WlAvatar
        :name="t('examples.utilityAvatarName')"
        :pt="namedAvatarPt"
        role="img"
        :aria-label="t('examples.utilityAvatarName')"
      />
      <span class="wl-text-small">{{ t("examples.utilityAvatarColor") }}</span>
    </div>
  </div>
</template>

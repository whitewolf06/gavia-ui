<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlSwitch } from "../../../../../../packages/ui-kit/src";
const notifications = ref(true);
const compactNotifications = ref(false);
const protectedMode = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlSwitch">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.two_sizes_and_a_slot_label_0842") }}</h4>
      <WlSwitch v-model="notifications" size="md">{{ t("examples.notifications_md_0843") }}</WlSwitch>
      <WlSwitch v-model="compactNotifications" size="sm">{{ t("examples.brief_notifications_sm_0844") }}</WlSwitch>
      <p class="wl-text-small wl-text-muted">{{ t("examples.space_toggles_the_focused_switch_the_label_names_the_setting_a_0845") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.error_and_unavailable_setting_0846") }}</h4>
      <WlField id="docs-switch-protected" :error="protectedMode ? undefined : t('examples.enable_protection_before_continuing_0847')" v-slot="{ id, ariaDescribedby, invalid }"><WlSwitch :id="id" v-model="protectedMode" :invalid="invalid" :aria-describedby="ariaDescribedby">{{ t("examples.protected_mode_0848") }}</WlSwitch></WlField>
      <WlSwitch :model-value="true" disabled>{{ t("examples.archiving_is_enabled_by_an_administrator_0849") }}</WlSwitch>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="notifications = true; compactNotifications = false; protectedMode = false">{{ t("examples.reset_settings_0850") }}</WlButton></div>
      <p class="wl-text-small" role="status">{{ t("examples.notifications_0851") }} {{ notifications ? t("examples.enabled_0852") : t("examples.disabled_0853") }}{{ t("examples.brief_0854") }} {{ compactNotifications ? t("examples.enabled_0852") : t("examples.disabled_0853") }}{{ t("examples.protection_0855") }} {{ protectedMode ? t("examples.enabled_0856") : t("examples.disabled_0857") }}.</p>
    </section>
  </div>
</template>
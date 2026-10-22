<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { WlButton, WlField, WlPasswordInput } from "gavia-ui";
import { ref } from "vue";
const password = ref("");
const touched = ref(false);
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlPasswordInput">
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.sizes_and_password_visibility_0794") }}</h3>
      <div class="wl-grid" data-space="lg">
        <WlField
          v-for="size in ['sm', 'md', 'lg'] as const"
          :id="`docs-password-${size}`"
          :key="size"
          v-slot="{ id }"
          :label="`${t('examples.password_0795')}${size}`"
        >
          <WlPasswordInput
            :id="id"
            v-model="password"
            :size="size"
            autocomplete="new-password"
          />
        </WlField>
        <WlField id="docs-password-compact" v-slot="{ id }" :label="t('examples.compact_password_input_0796')"><WlPasswordInput
          :id="id"
          v-model="password"
          density="compact"
          autocomplete="new-password"
        /></WlField>
      </div>
      <p class="wl-text-small wl-text-muted">{{ t("examples.the_show_password_button_changes_only_visibility_the_model_val_0797") }}</p>
    </section>
    <section class="wl-stack" data-space="md">
      <h3 class="wl-text-title">{{ t("examples.application_validation_and_disabled_0798") }}</h3>
      <div class="wl-grid" data-space="lg">
        <WlField
          id="docs-password-validation"
          v-slot="{ id, ariaDescribedby, invalid }"
          :label="t('examples.password_with_validation_0799')"
          :error="touched && password.length < 8 ? t('examples.at_least_8_characters_required_0800') : undefined"
          :hint="t('examples.this_is_an_example_rule_not_built_in_password_strength_validat_0801')"
        >
          <WlPasswordInput
            :id="id"
            v-model="password"
            :invalid="invalid"
            :aria-describedby="ariaDescribedby"
            autocomplete="new-password"
            @blur="touched = true"
          />
        </WlField>
        <WlField id="docs-password-disabled" v-slot="{ id }" :label="t('examples.disabled_password_0802')">
          <WlPasswordInput :id="id" model-value="Example-secret" disabled />
        </WlField>
      </div>
      <div class="wl-inline" data-space="sm">
        <WlButton size="sm" @click="touched = true">{{ t("examples.check_length_0803") }}</WlButton>
        <WlButton size="sm" @click="password = ''; touched = false">{{ t("examples.clear_password_0804") }}</WlButton>
      </div>
      <p class="wl-text-small" role="status">{{
        t("examples.characters_entered_0805")
      }} {{
        password.length
      }}{{
        t("examples.the_password_itself_is_not_shown_in_messages_0806")
      }}</p>
    </section>
  </div>
</template>

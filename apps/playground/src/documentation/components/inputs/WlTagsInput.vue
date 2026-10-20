<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
defineProps<{ preview?: Record<string, unknown> }>();
const { t } = usePlaygroundI18n();
import { WlButton, WlTagsInput } from "gavia-ui";
import { useWlId } from "gavia-ui/composables";
import { ref } from "vue";
const tags = ref(["Vue"]);
const rejected = ref("");
const helpId = `tags-example-${useWlId()}`;
</script>

<template>
  <div class="wl-stack" data-space="md" data-review-example="WlTagsInput">
    <WlTagsInput
      v-model="tags"
      v-bind="preview"
      :aria-label="t('documentation.strings.generatedWlTagsInputLabel')"
      :aria-describedby="helpId"
      :placeholder="t('documentation.strings.generatedWlTagsInputPlaceholder')"
      :max="3"
      :validator="(value) => value.length >= 2"
      :invalid="!!rejected"
      @reject="(value) => rejected = value"
      @add="rejected = ''"
    />
    <p :id="helpId" class="wl-text-small">{{ t("documentation.strings.generatedWlTagsInputDescription") }}</p>
    <p v-if="rejected" role="alert">{{ t("documentation.strings.generatedWlTagsInputRejected").replace("{value}", () => rejected) }}</p>
    <WlButton size="sm" @click="tags = ['Vue']; rejected = ''">{{ t("documentation.strings.reviewNewReset") }}</WlButton>
    <output :aria-label="t('documentation.strings.generatedWlTagsInputLabel')">{{ tags.join(", ") }}</output>
  </div>
</template>

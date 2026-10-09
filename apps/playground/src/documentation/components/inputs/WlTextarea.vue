<script setup lang="ts">
import { usePlaygroundI18n } from "../../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlButton, WlField, WlTextarea } from "../../../../../../packages/ui-kit/src";
const text = ref(t("examples.briefly_describe_the_task_add_the_next_step_0858"));
const comment = ref("");
</script>

<template>
  <div class="wl-stack" data-space="xl" data-input-example="WlTextarea">
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.fixed_rows_and_content_height_0859") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-textarea-fixed" :label="t('examples.description_4_rows_0860')" v-slot="{ id }"><WlTextarea :id="id" v-model="text" :rows="4" /></WlField>
        <WlField id="docs-textarea-grow" :label="t('examples.description_with_content_height_0861')" :hint="t('examples.add_lines_the_height_grows_with_the_text_0862')" v-slot="{ id, ariaDescribedby }"><WlTextarea :id="id" v-model="text" :rows="2" auto-resize :aria-describedby="ariaDescribedby" /></WlField>
      </div>
    </section>
    <section class="wl-stack" data-space="md">
      <h4 class="wl-text-title">{{ t("examples.error_and_unavailable_field_0863") }}</h4>
      <div class="wl-grid" data-space="lg">
        <WlField id="docs-textarea-comment" :label="t('examples.comment_0449')" :error="comment.trim() ? undefined : t('examples.add_a_comment_0864')" required v-slot="{ id, ariaDescribedby, invalid, required }"><WlTextarea :id="id" v-model="comment" :invalid="invalid" :required="required" :aria-describedby="ariaDescribedby" :placeholder="t('examples.what_needs_clarification_0865')" /></WlField>
        <WlField id="docs-textarea-disabled" :label="t('examples.closed_comment_0866')" v-slot="{ id }"><WlTextarea :id="id" :model-value="t('examples.discussion_completed_0867')" disabled /></WlField>
      </div>
      <div class="wl-inline" data-space="sm"><WlButton size="sm" @click="text += t('examples.another_item_0868')">{{ t("examples.add_line_0869") }}</WlButton><WlButton size="sm" @click="text = ''; comment = ''">{{ t("examples.clear_text_0870") }}</WlButton></div>
      <p class="wl-text-small" role="status">{{ t("examples.description_length_0871") }} {{ text.length }} {{ t("examples.characters_0872") }}</p>
    </section>
  </div>
</template>
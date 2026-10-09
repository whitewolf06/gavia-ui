<script setup lang="ts">
import { usePlaygroundI18n } from "../../i18n";
const { t } = usePlaygroundI18n();
import { ref } from "vue";
import { WlField, WlInput } from "../../../../../packages/ui-kit/src";
defineProps<{ preview?: Record<string, unknown> }>();
const value = ref('');
</script>

<template>
  <div class="wl-stack" data-space="md">
    <WlField :label="t('examples.material_title_0056')" id="state-field-name" required :hint="t('examples.up_to_80_characters_0057')" v-bind="preview" v-slot="field"><WlInput :id="field.id" v-model="value" :invalid="field.invalid" :aria-describedby="field.ariaDescribedby" maxlength="80" required /></WlField>
  </div>
</template>

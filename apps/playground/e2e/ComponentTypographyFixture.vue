<script setup lang="ts">
import { WlAccordion, WlAlert, WlCard, WlSegmented } from "gavia-ui";
import "gavia-ui/styles/primitives.css";

const options = [{ value: "one", label: "First item" }, { value: "two", label: "Second item" }];
const scale = {
  "--wl-type-body-size": "18px", "--wl-type-body-line-height": "28px",
  "--wl-type-subheading-size": "22px", "--wl-type-subheading-line-height": "30px",
  "--wl-type-control-size": "18px", "--wl-type-small-size": "14px",
  "--wl-type-small-line-height": "22px", "--wl-type-label-line-height": "26px"
};
</script>

<template>
  <section data-testid="component-typography-fixture">
    <div
      v-for="semantic in [false, true]"
      :key="String(semantic)"
      :class="{ 'wl-type-scale': semantic }"
      :data-semantic="semantic"
      :style="scale"
    >
      <WlCard><template #title>Title</template><template #subtitle>Subtitle</template>Content</WlCard>
      <WlAccordion :items="[{ key: 'one', title: 'Title', content: 'Content' }]" :default-open-keys="['one']" />
      <WlAlert title="Title">Content</WlAlert>
      <WlSegmented
        v-for="size in (['sm', 'md', 'lg'] as const)"
        :key="size"
        :size="size"
        :options="options"
        :aria-label="'Segmented ' + size"
      />
    </div>
  </section>
</template>

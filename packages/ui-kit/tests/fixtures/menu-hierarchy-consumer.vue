<script setup lang="ts">
import { WlContextMenu, WlMenu, type WlMenuCheckEvent, type WlMenuItem } from "../../src";
interface Project extends WlMenuItem<Project> { projectId: number }
const items: readonly Project[] = [{ projectId: 1, label: "Project", items: [{ projectId: 2, label: "Pinned", type: "checkbox", checked: true }] }];
function changed(event: WlMenuCheckEvent<Project>): void { event.item.projectId.toFixed(); }
function wrong(event: { item: { slug: string }; checked: boolean }): void { event.item.slug.toUpperCase(); }
</script>

<template>
  <WlMenu :items="items" popup @check="changed"><template #trigger="{ attrs }"><button v-bind="attrs">Open</button></template></WlMenu>
  <WlContextMenu :items="items" @check="changed"><template #trigger="{ attrs }"><button v-bind="attrs">Context</button></template></WlContextMenu>
  <!-- @vue-expect-error A listener cannot narrow the original concrete item to unrelated fields. -->
  <WlContextMenu :items="items" @check="wrong" />
  <!-- @vue-expect-error Menu checked values cannot be strings outside the mixed checkbox state. -->
  <WlMenu :items="[{ label: 'Checked', type: 'checkbox', checked: 'yes' }]" />
</template>

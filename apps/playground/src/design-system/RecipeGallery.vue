<script setup lang="ts">
import { usePlaygroundI18n } from "../i18n";
const { t } = usePlaygroundI18n();
import { computed, defineAsyncComponent, ref, type Component } from "vue";
import { WlButton } from "../../../../packages/ui-kit/src";
import CodePanel from "./CodePanel.vue";
import { consumerSource } from "./code";
const recipes = [
  { id: "MaterialList", label: t('shell.design_system.RecipeGallery.text447'), description: t('shell.design_system.RecipeGallery.text448') },
  { id: "ProfileForm", label: t('shell.design_system.RecipeGallery.text449'), description: t('shell.design_system.RecipeGallery.text450') },
  { id: "Preferences", label: t('shell.design_system.RecipeGallery.text451'), description: t('shell.design_system.RecipeGallery.text452') },
  { id: "MaterialDetail", label: t('shell.design_system.RecipeGallery.text453'), description: t('shell.design_system.RecipeGallery.text454') },
  { id: "ProjectWizard", label: t('shell.design_system.RecipeGallery.text455'), description: t('shell.design_system.RecipeGallery.text456') },
  { id: "AttachmentUpload", label: t('shell.design_system.RecipeGallery.text457'), description: t('shell.design_system.RecipeGallery.text458') }
] as const;
const modules = import.meta.glob<{ default: Component }>("./recipes/*.vue");
const sources = import.meta.glob<string>("./recipes/*.vue", { eager: true, query: "?raw", import: "default" });
const components = Object.fromEntries(Object.entries(modules).map(([path, loader]) => [path, defineAsyncComponent(loader)]));
const selected = ref<string>("MaterialList");
const revision = ref(0);
const recipe = computed(() => recipes.find((item) => item.id === selected.value)!);
const source = computed(() => consumerSource(sources[`./recipes/${selected.value}.vue`] ?? ""));
const component = computed(() => components[`./recipes/${selected.value}.vue`]);
function select(id: string): void { selected.value = id; revision.value++; }
const setupSource = t('shell.design_system.RecipeGallery.text459');
</script>

<template>
  <div class="wl-stack" data-space="lg" data-testid="ds-recipes">
    <div class="wl-inline" data-space="sm" role="group" :aria-label="t('shell.design_system.RecipeGallery.text460')"><WlButton v-for="item in recipes" :key="item.id" :variant="selected === item.id ? 'primary' : 'secondary'" :aria-pressed="selected === item.id" :data-recipe="item.id" @click="select(item.id)">{{ item.label }}</WlButton></div>
    <p class="wl-text-body wl-text-muted">{{ recipe.description }}</p>
    <div class="ds-recipe-preview wl-surface" data-testid="ds-recipe-preview" :data-recipe="recipe.id"><component :is="component" :key="`${selected}-${revision}`" /></div>
    <div><WlButton size="sm" variant="ghost" @click="revision++">{{ t('shell.design_system.RecipeGallery.text461') }}</WlButton></div>
    <CodePanel :source="source" />
    <p class="wl-text-small wl-text-muted">{{ t('shell.design_system.RecipeGallery.text462') }}</p>
    <CodePanel :source="setupSource" :title="t('shell.design_system.RecipeGallery.text463')" />
  </div>
</template>

<style>
.ds-recipe-preview { min-width: 0; overflow-wrap: anywhere; }
</style>

<script setup lang="ts">
import { usePlaygroundI18n } from "./i18n";
const { t } = usePlaygroundI18n();
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import changelogSource from "../../../CHANGELOG.md?raw";
import { gaviaProjectInfo as project } from "./project/project-info";
import { localizeChangelogMarkdown } from "./project/changelog-localization";
import { parseChangelog } from "./project/changelog";
import ChangelogInline from "./project/ChangelogInline.vue";
import PlaygroundPageHeader from "./PlaygroundPageHeader.vue";

const changelog = computed(() => parseChangelog(localizeChangelogMarkdown(changelogSource), project.documentationBaseUrl));
const projectElement = ref<HTMLElement | null>(null);

// Restore the anchor after the browser applies its history position and Vue mounts the lazy page.
let anchorFrame: number | undefined;
onMounted(() => {
  if (!window.location.hash) return;
  let id: string;
  try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { return; }
  anchorFrame = window.requestAnimationFrame(() => {
    const target = document.getElementById(id);
    if (target && projectElement.value?.contains(target)) target.scrollIntoView({ block: "start" });
  });
});
onBeforeUnmount(() => {
  if (anchorFrame !== undefined) window.cancelAnimationFrame(anchorFrame);
});
</script>

<template>
  <main ref="projectElement" class="project-main wl-container wl-stack" data-space="2xl" id="project-top" data-testid="changelog-page" aria-labelledby="project-title">
    <PlaygroundPageHeader title="Changelog" title-id="project-title"
      :description="t('shell.ProjectInfo.text356')"
      :breadcrumbs="[{ label: 'Changelog' }]">
      <template #navigation>
        <nav class="wl-inline" data-space="lg" :aria-label="t('shell.ProjectInfo.text357')">
          <a class="project-link" href="#project-changelog">{{ t('shell.ProjectInfo.text358') }}</a>
        </nav>
      </template>
    </PlaygroundPageHeader>

    <section id="project-changelog" data-testid="project-changelog" aria-labelledby="project-changelog-title" class="wl-stack" data-space="xl">
      <header class="wl-stack" data-space="sm">
        <p class="project-eyebrow wl-text-small">Changelog</p>
        <h2 id="project-changelog-title" class="wl-text-title">{{ t('shell.ProjectInfo.text359') }}</h2>
        <p class="wl-text-small wl-text-muted">{{ t('shell.ProjectInfo.text360') }}</p>
        <p class="wl-text-small"><a class="project-link" :href="project.changelogUrl">{{ t('shell.ProjectInfo.text361') }}</a></p>
      </header>
      <nav class="project-history-nav wl-inline" data-space="md" :aria-label="t('shell.ProjectInfo.text362')">
        <a v-for="section in changelog.sections" :key="section.id" class="project-link" :href="`#${section.id}`">{{ section.title }}</a>
      </nav>
      <div class="wl-stack" data-space="md">
        <template v-for="(block, index) in changelog.introduction" :key="index">
          <p v-if="block.kind === 'paragraph'" class="wl-text-body wl-text-muted"><ChangelogInline :content="block.content" /></p>
          <h3 v-else-if="block.kind === 'heading'" class="wl-text-heading"><ChangelogInline :content="block.content" /></h3>
          <ul v-else class="project-list wl-text-body"><li v-for="(item, itemIndex) in block.items" :key="itemIndex"><ChangelogInline :content="item" /></li></ul>
        </template>
      </div>
      <article v-for="section in changelog.sections" :key="section.id" :id="section.id" class="project-release wl-surface wl-stack" data-space="lg" :aria-labelledby="`${section.id}-title`" data-testid="project-changelog-section">
        <header class="wl-stack" data-space="xs">
          <h3 :id="`${section.id}-title`" class="wl-text-heading">{{ section.version ? t('shell.ProjectInfo.text363', { arg0: section.version }) : section.title }}</h3>
          <p v-if="section.date" class="wl-text-small wl-text-muted"><time :datetime="section.date">{{ section.date }}</time></p>
          <p v-if="section.unreleased" class="wl-text-small wl-text-muted">{{ t('shell.ProjectInfo.text364') }}</p>
        </header>
        <template v-for="(block, index) in section.blocks" :key="index">
          <h4 v-if="block.kind === 'heading'" class="wl-text-subheading"><ChangelogInline :content="block.content" /></h4>
          <p v-else-if="block.kind === 'paragraph'" class="wl-text-body wl-text-muted"><ChangelogInline :content="block.content" /></p>
          <ul v-else class="project-list wl-text-body"><li v-for="(item, itemIndex) in block.items" :key="itemIndex"><ChangelogInline :content="item" /></li></ul>
        </template>
      </article>
    </section>
  </main>
</template>

<style>
.project-main { padding-block: var(--wl-space-2xl) var(--wl-space-4xl); }
.project-eyebrow { color: var(--wl-text-muted); letter-spacing: 0.08em; text-transform: uppercase; }
.project-link { color: var(--wl-text-accent); text-decoration: underline; text-underline-offset: 0.18em; overflow-wrap: anywhere; }
.project-link:hover { color: var(--wl-accent-hover); }
.project-link:focus-visible { outline: 2px solid var(--wl-focus-color); outline-offset: 2px; border-radius: var(--wl-radius-sm); }
.project-release { scroll-margin-block-start: var(--wl-space-4xl); overflow-wrap: anywhere; }
.project-history-nav { line-height: var(--wl-type-body-line-height); }
.project-list { list-style: disc; margin: 0; padding-inline-start: var(--wl-space-xl); }
.project-list li + li { margin-top: var(--wl-space-sm); }
@media (max-width: 640px) {
  .project-release { padding: var(--wl-space-lg); }
}
@media (max-width: 760px) { .project-main { padding-top: var(--wl-space-xl); } }
</style>

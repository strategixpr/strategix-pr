<script setup lang="ts">
import { computed, ref } from 'vue';
import projectsData from '@/content/pages/projects.json';
import imagePlaceholder from '@/assets/images/image-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

type ExampleOtherProject = {
  title: string;
  src: string;
  direction: 'left' | 'right';
  slug: string;
};

type ProjectCase = {
  title: string;
  src: string;
  hidden?: boolean;
};

type ProjectGroupLocale = {
  cases?: Record<string, ProjectCase>;
};

type ProjectsJson = {
  projects?: Record<string, Record<string, ProjectGroupLocale>>;
};

defineProps<{
  data?: unknown;
}>();

const route = useRoute();
const { locale } = useI18n();
const localePath = useLocalePath();
const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';

const currentSlug = computed(() => {
  const param = route.params.project;
  return Array.isArray(param) ? param[0] : param;
});

const pickGroupLocale = (group: Record<string, ProjectGroupLocale>, localeKey: string) => {
  return group[localeKey];
};

const getProjectsInOrder = (localeKey: string) => {
  const data = projectsData as ProjectsJson;
  const groups = data.projects ?? {};
  const result: Array<{ slug: string; title: string; src: string }> = [];

  for (const group of Object.values(groups)) {
    const groupLocale = pickGroupLocale(group, localeKey);
    const cases = groupLocale?.cases;
    if (!cases) continue;

    for (const [slug, value] of Object.entries(cases)) {
      if (value.hidden === true) continue;

      result.push({
        slug,
        title: value.title,
        src: value.src,
      });
    }
  }

  return result;
};

const otherProjects = computed<ExampleOtherProject[]>(() => {
  const localeKey = locale.value || 'ru';
  const projects = getProjectsInOrder(localeKey);
  if (!projects.length) return [];

  const slug = currentSlug.value;
  const currentIndex = slug ? projects.findIndex((item) => item.slug === slug) : -1;

  let selected: Array<{ slug: string; title: string; src: string }> = [];

  if (currentIndex === -1) {
    selected = projects.slice(0, 2);
  } else if (projects.length === 1) {
    selected = [];
  } else if (projects.length === 2) {
    selected = projects.filter((item) => item.slug !== slug);
  } else {
    const prevIndex = (currentIndex - 1 + projects.length) % projects.length;
    const nextIndex = (currentIndex + 1) % projects.length;
    selected = [projects[prevIndex]!, projects[nextIndex]!];
  }

  return selected.map((project, index) => ({
    ...project,
    direction: index === 0 ? 'left' : 'right',
  }));
});

const getProjectPath = (slug: string) => localePath(`/project/${slug}`);

const showPlaceholder = ref<Record<number, boolean>>({})
</script>

<template>
  <section
    v-if="otherProjects.length"
    class="example-other-projects"
  >
    <ul class="projects-list">
      <li
        v-for="(project, index) in otherProjects"
        :key="project.slug"
        class="project-card"
        :class="`project-card--${project.direction}`"
      >
        <NuxtLink
          class="project-link"
          :to="getProjectPath(project.slug)"
          no-prefetch
        >
          <div
            class="project-head"
            :class="`project-head--${project.direction}`"
          >
            <span
              v-if="project.direction === 'left'"
              class="project-arrow hover"
              aria-hidden="true"
            >
              &larr;
            </span>
            <span class="base-text project-title hover">{{ project.title }}</span>
            <span
              v-if="project.direction === 'right'"
              class="project-arrow hover"
              aria-hidden="true"
            >
              &rarr;
            </span>
          </div>
          <NuxtImg
            v-if="!showPlaceholder[index]"
            class="project-image"
            :src="resolveNuxtImageSrc(project.src, baseURL)"
            :alt="project.title"
            format="webp"
            :quality="80"
            width="600"
            height="600"
            sizes="xs:50vw sm:50vw md:50vw lg:50vw xl:50vw xxl:50vw"
            loading="lazy"
            decoding="async"
            @error="showPlaceholder[index] = true"
          />
          <img
            v-else
            class="project-image"
            :src="imagePlaceholder"
            :alt="project.title"
            loading="lazy"
            decoding="async"
          >
        </NuxtLink>
      </li> 
    </ul>
  </section>
</template>

<style scoped>
.example-other-projects{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(min-aspect-ratio: 5/3){
    height: calc(var(--vh) * 70);
  }
}

.projects-list{
  list-style: none;
  padding: 0;
  margin: auto 0;

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: clamp(16px, 4vw, 56px);
  row-gap: clamp(20px, 5vw, 64px);

  @media(--tablet-width){
    column-gap: clamp(10px, 1vw, 72px);
  }

  @media(--mobile-medium){
    column-gap: min(4vw, 18px);
  }
}

.project-card{
  margin: 0;
}

.project-link{
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 2), 16px);
  text-decoration: none;
  color: inherit;

  @media(--tablet-width){
    gap: clamp(14px, calc(var(--vh) * 2), 24px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 1.5), 12px);
  }
}

.project-link:focus-visible{
  outline: 2px solid var(--strategix-dark);
  outline-offset: 4px;
  border-radius: var(--card-radius);
}

.project-head{
  width: 100%;
  display: flex;
  align-items: center;
  gap: min(2vw, 12px);

  color: var(--strategix-dark);
}

.project-head--left{
  justify-content: flex-start;
}

.project-head--right{
  justify-content: flex-end;
}

.project-title{
  text-align: left;
  font-weight: 500;
  text-transform: none;
  line-height: 120%;
  letter-spacing: 0;
  font-size: min(16px, 3.6vw);
  white-space: nowrap;

  @media(--tablet-width){
    font-size: clamp(16px, 1vw, 32px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3));
  }
}

.project-head--right .project-title{
  text-align: right;
}

.project-arrow{
  font-size: 1.1em;
  line-height: 1;
}

.project-image{
  width: 100%;
  height: auto;
  max-height: calc(var(--vh) * 60);
  box-sizing: border-box;

  margin: 0;
  aspect-ratio: 3 / 4;
  object-fit: cover;
  display: block;
  border-radius: var(--card-radius);

  transition: all 0.3s;

  @media(--tablet-width){
    aspect-ratio: 4 / 3;
  }

  @media(--mobile-medium){
    aspect-ratio: 4 / 3;
  }
}

.project-image:hover{
  transform: translateY(calc(var(--vh) * 1));
  /* height: calc(100% - var(--vh) * 1.5); */
  border: clamp(2px, 0.175vw, 6px) solid var(--strategix-accent);
  cursor: pointer;
}
</style>

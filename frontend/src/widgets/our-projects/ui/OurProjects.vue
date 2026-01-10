<script setup lang="ts">
  import IndexSectionTitle from "@/shared/ui/index-section-title";
  import Filters from "./Filters.vue";
  import Slider from "./Slider.vue";
  import ProjectCard from "./ProjectCard.vue";
  import index from '@/content/pages/index.json'
  import projectsContent from '@/content/pages/projects.json'

  type ProjectCase = { src: string; title: string; description: string }
  type ProjectCardData = ProjectCase & { route: string }
  type ProjectLocaleData = { title: string; cases?: Record<string, ProjectCase> }
  type ProjectsContent = Record<string, Record<string, ProjectLocaleData>>

  const projectsData = (projectsContent.projects || {}) as ProjectsContent

  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value || 'example')
  const translations = computed(() => index.translations[currentLocale.value as keyof typeof index.translations] || index.translations.example)

  const sectionTitle = computed(() => translations.value.our_projects.title)

  const filters = computed(() => {
    const baseFilters = translations.value.our_projects.filters || []
    const localeCode = currentLocale.value

    const groupTitles = Object.values(projectsData)
      .map((group) => (group[localeCode] || group.ru)?.title)
      .filter((title): title is string => Boolean(title))

    return [...baseFilters, ...groupTitles]
  })

  const projectCards = computed<ProjectCardData[]>(() => {
    const localeCode = currentLocale.value

    return Object.values(projectsData).flatMap((group) => {
      const localized = group[localeCode] || group.ru
      if (!localized?.cases) return []

      return Object.entries(localized.cases).map(([caseKey, data]) => ({
        route: caseKey,
        ...data,
      }))
    })
  })
</script>

<template>
  <section
    id="our-projects"
    class="our-projects"
  >
    <IndexSectionTitle :is-white="true">
      {{ sectionTitle }}
    </IndexSectionTitle>

    <Filters :categories="filters" />
    <Slider>
      <ProjectCard
        v-for="(project, index) in projectCards"
        :key="index"
        :route="project.route"
        :src="project.src"
        :title="project.title"
        :description="project.description"
      />
    </Slider>
    <div />
  </section>
</template>

<style scoped>
.our-projects {
    width: var(--section-width);
    height: calc(var(--vh) * 100);
    padding: calc(var(--vh) * 7.5) var(--padding-section-x);
    box-sizing: border-box;

    background-color: var(--strategix-dark);

    @media(--laptop-width){
      height: calc(var(--vh) * 105);
    }

    @media(--tablet-width) and (max-aspect-ratio: 4/3){
      height: calc(var(--vh) * 75);
    }

    @media(--mobile-medium){
      height: calc(var(--vh) * 115);
      padding: calc(var(--vh) * 7.5) var(--padding-section-x) calc(var(--vh) * 10);
    }
}
</style>

<script setup lang="ts">
  import IndexSectionTitle from "@/shared/ui/index-section-title";
  import Filters from "./Filters.vue";
  import Slider from "./Slider.vue";
  import ProjectCard from "./ProjectCard.vue";
  import index from '@/content/pages/index.json'
  import projectsContent from '@/content/pages/projects.json'

  type ProjectCase = { src: string; title: string; description: string; hidden?: boolean }
  type ProjectCardData = { route: string; src: string; title: string; description: string }
  type ProjectLocaleData = { title: string; cases?: Record<string, ProjectCase> }
  type ProjectsContent = Record<string, Record<string, ProjectLocaleData>>
  type ProjectGroupData = { title: string; cards: ProjectCardData[] }

  const projectsData = (projectsContent.projects || {}) as ProjectsContent

  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value || 'example')
  const translations = computed(() => index.translations[currentLocale.value as keyof typeof index.translations] || index.translations.example)
  const isFilteringEnabled = computed(() => Boolean(translations.value.our_projects.enable))

  const sectionTitle = computed(() => translations.value.our_projects.title)
  const selectedCategory = ref<string | null>(null)

  const projectGroups = computed<ProjectGroupData[]>(() => {
    const localeCode = currentLocale.value

    return Object.values(projectsData)
      .map((group) => {
        const localized = group[localeCode]
        if (!localized?.title) return null

        const cards = Object.entries(localized.cases || {})
          .map(([caseKey, data]) => ({
            route: caseKey,
            src: data.src,
            title: data.title,
            description: data.description,
            hidden: data.hidden === true,
          }))
          .filter((item) => !item.hidden)
          .map(({ hidden: _hidden, ...card }) => card)

        return {
          title: localized.title,
          cards,
        }
      })
      .filter((group): group is ProjectGroupData => Boolean(group))
  })

  const groupTitles = computed(() => projectGroups.value.map((group) => group.title))

  const filters = computed(() => {
    const baseFilters = translations.value.our_projects.filters || []
    return [...baseFilters, ...groupTitles.value]
  })

  const projectCards = computed<ProjectCardData[]>(() => {
    if (!isFilteringEnabled.value || !selectedCategory.value) {
      return projectGroups.value.flatMap((group) => group.cards)
    }

    const isProjectCategory = groupTitles.value.includes(selectedCategory.value)
    if (!isProjectCategory) {
      return projectGroups.value.flatMap((group) => group.cards)
    }

    return projectGroups.value
      .find((group) => group.title === selectedCategory.value)
      ?.cards || []
  })

  const onSelectCategory = (category: string) => {
    if (!isFilteringEnabled.value) return

    selectedCategory.value = category
  }

  watch(
    [filters, isFilteringEnabled],
    ([nextFilters, nextFilteringEnabled]) => {
      if (!nextFilteringEnabled) {
        selectedCategory.value = null
        return
      }

      if (!nextFilters.length) {
        selectedCategory.value = null
        return
      }

      if (!selectedCategory.value || !nextFilters.includes(selectedCategory.value)) {
        const firstFilter = nextFilters[0]
        selectedCategory.value = firstFilter ?? null
      }
    },
    { immediate: true }
  )
</script>

<template>
  <section
    id="our-projects"
    class="our-projects"
  >
    <IndexSectionTitle :is-white="true">
      {{ sectionTitle }}
    </IndexSectionTitle>

    <Filters
      :categories="filters"
      :active-category="selectedCategory"
      :is-enabled="isFilteringEnabled"
      @select="onSelectCategory"
    />
    <Slider>
      <ProjectCard
        v-for="(project, projectIndex) in projectCards"
        :key="projectIndex"
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
      height: calc(var(--vh) * 100);
    }

    @media(--laptop-width) and (min-aspect-ratio: 2/1){
      height: calc(var(--vh) * 120);
    }

    @media(--mobile-width) and (max-aspect-ratio: 1/1){
      height: calc(var(--vh) * 75);
    }

    @media(--mobile-medium){
      height: calc(var(--vh) * 115);
      padding: calc(var(--vh) * 7.5) var(--padding-section-x) calc(var(--vh) * 10);
    }
}

</style>

<script setup lang="ts">
import projectsContent from '@/content/pages/projects.json'

const route = useRoute()

// slug из урла
const project = computed(() => route.params.project as string)

const { locale } = useI18n()
const currentLocale = computed(() => locale.value || 'example')
const projectType = computed(() => projectsContent.projects.group1[currentLocale.value].title)
//@ts-ignore
const descriptionProject = computed(() => projectsContent.projects.group1[currentLocale.value].cases[project.value].description)

</script>

<template>
  <p class="base-text">
    {{ projectType }}
  </p>
  <p class="small-text">
    {{ project }}
  </p>
  <p class="small-text">
    {{ descriptionProject }} 
  </p>
</template>

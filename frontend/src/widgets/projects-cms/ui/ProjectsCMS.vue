<script setup lang="ts">
  import { computed } from 'vue';
  import { useRouter } from 'vue-router';
  import MainPage from '@/assets/images/main-page.svg';
  import projectsContent from '@/content/pages/projects.json';

  type ProjectCase = { src: string; title: string; description?: string }
  type ProjectLocaleData = { title?: string; cases?: Record<string, ProjectCase> }
  type ProjectsContent = Record<string, Record<string, ProjectLocaleData>>

  const projectsData = (projectsContent.projects || {}) as ProjectsContent

  const { locale } = useI18n()
  const currentLocale = computed(() => locale.value || 'example')
  const router = useRouter()

  const normalizeSrc = (src: string | undefined) => (src || '').replace(/^\.\/+/, '/')

  const projectGroups = computed(() => {
    const localeCode = currentLocale.value
    const order = ['group1', 'group2', 'group3', 'group4']

    return order.map((key) => {
      const group = projectsData[key]
      const localized = group?.[localeCode] || group?.ru || {}
      const casesEntries = localized.cases ? Object.entries(localized.cases) : []
      const visibleCases = casesEntries.slice(0, 3).map(([caseKey, data]) => ({
        key: caseKey,
        title: data.title,
        image: normalizeSrc(data.src),
      }))
      while (visibleCases.length < 3) {
        visibleCases.push({ key: `placeholder-${visibleCases.length}`, title: '', image: '' })
      }
      const hiddenCount = Math.max(casesEntries.length - 3, 0)

      return {
        key,
        title: localized.title || key,
        cases: visibleCases,
        hiddenCount,
      }
    })
  })

  const goToMainProjects = () => {
    router.push('/cms/main')
  }

  const goToGroup = (group: string) => {
    router.push(`/cms/projects/${encodeURIComponent(group)}`)
  }
</script>

<template>
  <div class="cms-layout">
    <div
      class="main"
      role="link"
      tabindex="0"
      @click="goToMainProjects"
      @keydown.enter.prevent="goToMainProjects"
    >
      <h2 class="upperscase-text main-title">
        ГЛАВНАЯ
      </h2>
      <img
        :src="MainPage"
        alt="main"
        class="main-image"
      >
    </div>
    <div class="projects">
      <h2 class="upperscase-text projects-title">
        ПРОЕКТЫ
      </h2>
      <div class="projects-projects">
        <div
          v-for="group in projectGroups"
          :key="group.key"
          class="project-group-card"
          role="link"
          tabindex="0"
          @click="goToGroup(group.key)"
          @keydown.enter.prevent="goToGroup(group.key)"
        >
          <div class="projects-header">
            <h2 class="projects-projects-title">
              {{ group.title }}
            </h2>
          </div>
          <div class="projects-grid">
            <div
              v-for="project in group.cases"
              :key="project.key"
              class="project-tile"
            >
              <div class="project-media">
                <NuxtImg
                  v-if="project.image"
                  :src="project.image"
                  :alt="project.title"
                  class="project-image"
                  :width="600"
                  :height="400"
                />
                <div
                  v-else
                  class="project-placeholder"
                />
              </div>
              <div class="project-meta">
                <p
                  v-if="project.title"
                  class="base-text project-case-title"
                >
                  {{ project.title }}
                </p>
              </div>
            </div>
            <div
              v-if="group.hiddenCount > 0"
              class="project-tile more-tile"
            >
              <div class="more-count">
                +{{ group.hiddenCount }}
              </div>
            </div>
            <div
              v-else
              class="project-tile empty-tile"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .cms-layout {
    width: 100%;
    min-height: 70vh;
    height: fit-content;
    padding: 0 24px 12px;
    box-sizing: border-box;
    height: fit-content;
    display: grid;
    grid-template-columns: 39.5% 0.5% 30% 30%;
    grid-template-rows: 50% 50%;

    border: 2px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
    background-color: hsl(var(--card));
    border-radius: var(--card-radius);
  }

  .main{
    grid-column: 1 / 2;
    grid-row: 1 / 3;
    width: 100%;
    height: 100%;
    
    /* background-color: hsl(var(--card));
    border-radius: var(--card-radius); */
  }

  .main-title{
    text-align: left;
  }

  .main-image {
    width: 100%;
    height: 90%;
    border: 2px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
    box-sizing: border-box;
    object-fit: cover;
    object-position: center top;
    display: block;
    border-radius: var(--card-radius);
    transition: all 0.2s ease;
  }

  .main-image:hover{
    border: 2px solid var(--strategix-accent);
    height: 89%;
    transform: translateY(1%);
    cursor: pointer;
  }

  .projects{
    grid-column: 3 / 5;
    grid-row: 1 / 3;
  }

  .projects-title{
    text-align: left;
    padding-left: 16px;
  }
  
  .projects-projects{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 5px;
    height: 90%;
  }

  .project-group-card{
    height: 100%;
    
    background-color: hsl(var(--card));
    border-radius: var(--card-radius);

    box-sizing: border-box;
    border: 2px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
    display: flex;
    flex-direction: column;
    padding: 16px;
    gap: var(--gap-grid);
    transition: all 0.2s ease;
  }

  .project-group-card:hover{
    border: 2px solid var(--strategix-accent);
    height: 98%;
    transform: translateY(1%);
    cursor: pointer;
  }

  .projects-projects-title{
    margin: 0;
    font-weight: 700;
    font-size: 16px;
    color: #1f2933;
    text-align: left;
  }

  .projects-grid{
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 5px;
    flex: 1 1 auto;
  }

  .project-tile{
    background: #f2f2f2;
    border-radius: calc(var(--card-radius) / 2);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e2e2;
  }

  .project-media{
    flex: 1 1 auto;
    min-height: 0;
    background: linear-gradient(135deg, #f2f2f2, #e4e4e4);
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .project-placeholder{
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      -45deg,
      #e5e5e5,
      #e5e5e5 10px,
      #d9d9d9 10px,
      #d9d9d9 20px
    );
  }

  .project-meta{
    display: flex;
    flex-direction: column;
  }

  .project-case-title{
    margin: 0;
    text-align: left;
    font-size: 14px;
    color: var(--strategix-dark);
    padding: 6px 16px;
  }

  .more-tile{
    align-items: center;
    justify-content: center;
    background: #e8f5ed;
    color: #1f2933;
    border: 1px dashed #c4dfce;
  }

  .more-count{
    font-size: 20px;
    font-weight: 700;
  }

  .empty-tile{
    background: #fafafa;
    border: 1px dashed #e5e5e5;
  }
</style>

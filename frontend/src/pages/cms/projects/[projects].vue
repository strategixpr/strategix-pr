<script setup lang="ts">
  import { computed, ref } from 'vue';
  import HeaderCMS from '@/widgets/header-cms';
  import projectsContent from '@/content/pages/projects.json';

  type ProjectCase = { src?: string; title?: string }
  type ProjectLocaleData = { title?: string; cases?: Record<string, ProjectCase> }
  type ProjectGroup = Record<string, ProjectLocaleData>
  type ProjectsContent = Record<string, ProjectGroup>

  const projectsData = (projectsContent.projects || {}) as ProjectsContent;
  const missingGroupTitle = 'таких кейсов не существует';

  const route = useRoute();
  const router = useRouter();
  const { locale } = useI18n();

  const currentLocale = computed(() => locale.value || 'example');

  const groupSlug = computed(() => {
    const param = route.params?.projects;
    if (Array.isArray(param)) return param[param.length - 1] || '';
    return String(param || '')
      .split('/')
      .filter(Boolean)
      .pop() || '';
  });

  const group = computed<ProjectGroup | null>(() => {
    const slug = groupSlug.value;
    if (!slug) return null;
    return projectsData[slug] || null;
  });

  const groupTitle = computed(() => {
    const data = group.value;
    if (!data) return missingGroupTitle;
    const localized = data[currentLocale.value] || data.ru || Object.values(data)[0];
    return localized?.title || groupSlug.value || missingGroupTitle;
  });

  const hasGroup = computed(() => group.value !== null);

  const normalizeSrc = (src: string | undefined) => (src || '').replace(/^\.\/+/, '/');

  const projectsList = computed(() => {
    const data = group.value;
    if (!data) return [];
    const localized = data[currentLocale.value] || data.ru || Object.values(data)[0] || {};
    const cases = localized.cases || {};

    return Object.entries(cases).map(([key, value]) => ({
      key,
      title: value?.title || key,
      image: normalizeSrc(value?.src),
    }));
  });

  const creating = ref(false);
  const creationError = ref('');

  const newCaseSlug = computed(() => {
    const existingKeys = new Set(projectsList.value.map((p) => p.key));
    let index = projectsList.value.length + 1;
    let candidate = `new-case-${index}`;

    while (existingKeys.has(candidate)) {
      index += 1;
      candidate = `new-case-${index}`;
    }

    return candidate;
  });

  const createNewCase = async () => {
    if (creating.value || !groupSlug.value || !group.value) return;
    creationError.value = '';
    const slug = newCaseSlug.value;

    const payload = JSON.parse(JSON.stringify(projectsContent));
    const targetGroup = payload?.projects?.[groupSlug.value];

    if (!targetGroup || typeof targetGroup !== 'object') {
      creationError.value = 'Группа не найдена';
      setTimeout(() => creationError.value = '', 4000);
      return;
    }

    Object.keys(targetGroup).forEach((localeKey) => {
      const localeData = targetGroup[localeKey] || {};
      if (!localeData.cases || typeof localeData.cases !== 'object') {
        localeData.cases = {};
      }
      localeData.cases[slug] = { src: '', title: slug };
      targetGroup[localeKey] = localeData;
    });

    payload.projects[groupSlug.value] = targetGroup;

    creating.value = true;
    try {
      await $fetch('/api/cms/projects', {
        method: 'PUT',
        body: payload,
      });
      await router.push(`/cms/project/${encodeURIComponent(slug)}`);
    } catch (error) {
      creationError.value = 'Не удалось создать кейс';
      setTimeout(() => creationError.value = '', 4000);
    } finally {
      creating.value = false;
    }
  };

  const goToProject = (slug: string) => {
    router.push(`/cms/project/${encodeURIComponent(slug)}`);
  };
</script>

<template>
  <div class="min-h-screen text-foreground index">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
      <HeaderCMS>{{ groupTitle }}</HeaderCMS>
      <main
        v-if="hasGroup"
        class="projects-shell"
      >
        <div class="projects-grid">
          <div
            v-for="project in projectsList"
            :key="project.key"
            class="project-card"
            role="link"
            tabindex="0"
            @click="goToProject(project.key)"
            @keydown.enter.prevent="goToProject(project.key)"
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
            <div class="project-body">
              <p class="project-title">
                {{ project.title }}
              </p>
            </div>
          </div>
          <div
            class="project-card add-card"
            role="button"
            tabindex="0"
            @click="createNewCase"
            @keydown.enter.prevent="createNewCase"
          >
            <div class="add-card-content">
              <p class="add-card-title">
                Создать кейс
              </p>
              <p class="add-card-subtitle">
                {{ newCaseSlug }}
              </p>
              <p
                v-if="creationError"
                class="add-card-error"
              >
                {{ creationError }}
              </p>
              <p
                v-else-if="creating"
                class="add-card-subtitle"
              >
                Создаём...
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  .projects-shell {
    width: 100%;
    min-height: 70vh;
    border: 2px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
    background-color: hsl(var(--card));
    border-radius: var(--card-radius);
    padding: 16px;
    box-sizing: border-box;
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(5, 19.6%);
    gap: 0.5%;
  }

  .project-card {
    border: 2px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
    background-color: hsl(var(--card));
    border-radius: calc(var(--card-radius) / 2);
    padding: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.2s ease, transform 0.2s ease;
  }

  .project-title {
    font-weight: 600;
    color: var(--strategix-dark);
    margin: 0;
    text-transform: uppercase;
  }

  .project-body {
    padding: 12px 16px;
  }

  .project-media {
    width: 100%;
    height: auto;
    aspect-ratio: 8 / 10;
    border-radius: 0 0 calc(var(--card-radius) / 2) calc(var(--card-radius) / 2);
    overflow: hidden;
    border: 0;
    background: color-mix(in srgb, var(--strategix-light) 60%, white 40%);
  }

  .project-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .project-placeholder {
    width: 100%;
    height: 100%;
    background: repeating-linear-gradient(
      45deg,
      color-mix(in srgb, var(--strategix-light) 60%, white 40%),
      color-mix(in srgb, var(--strategix-light) 60%, white 40%) 10px,
      color-mix(in srgb, var(--strategix-light) 40%, white 60%) 10px,
      color-mix(in srgb, var(--strategix-light) 40%, white 60%) 20px
    );
  }

  .project-card:hover {
    border-color: var(--strategix-accent);
    height: 98%;
    transform: translateY(2%);
  }

  .add-card {
    justify-content: center;
    align-items: center;
    border-style: dashed;
    border-color: rgba(0, 0, 0, 0.25);
    background: color-mix(in srgb, var(--strategix-light) 20%, white 80%);
  }

  .add-card:hover {
    height: 100%;
    transform: translateY(0);
  }

  .add-card-content {
    padding: 24px 16px;
    text-align: center;
  }

  .add-card-title {
    margin: 0 0 8px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .add-card-subtitle {
    margin: 0;
    color: color-mix(in srgb, var(--strategix-dark) 80%, black 20%);
    font-size: 14px;
  }

  .add-card-error {
    margin: 8px 0 0;
    color: #b91c1c;
    font-size: 13px;
  }
</style>

<script setup lang="ts">
import localesConfig from '@/content/locales.json'
import projectsContent from '@/content/pages/projects.json'
import { filterLocalesForSiteDomain, resolveDefaultLocaleForSiteDomain } from '@/shared/lib/content/domainLocales'
import { getProjectContent } from '@/shared/lib/content/registry'

const { theme } = defineProps({
  theme: {
    type: String as () => 'dark' | 'light',
    default: 'dark'
  } 
})

const { locale, setLocale } = useI18n()
const route = useRoute()
const runtimeConfig = useRuntimeConfig()
type LanguageOption = { code: string; name: string }
const isCmsRoutePath = (path: string) => /(^|\/)cms(\/|$)/.test(path)
const normalizeCode = (value: unknown) => String(value || '').trim().toLowerCase()
const nonVisualContentKeys = new Set(['page_info', 'seo'])
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value)

const projectSlug = computed(() => {
  const slug = route.params.project
  return typeof slug === 'string' ? slug.trim() : ''
})

const getProjectVisibleLocaleCodes = (slug: string) => {
  const visible = new Set<string>()
  const projectGroups = (projectsContent as any)?.projects
  if (!isObjectRecord(projectGroups)) return visible

  Object.entries(projectGroups).forEach(([, groupValue]) => {
    if (!isObjectRecord(groupValue)) return

    Object.entries(groupValue).forEach(([localeCode, localeValue]) => {
      if (!isObjectRecord(localeValue)) return
      const cases = localeValue.cases
      if (!isObjectRecord(cases)) return
      const caseMeta = cases[slug]
      if (!isObjectRecord(caseMeta) || caseMeta.hidden === true) return
      visible.add(normalizeCode(localeCode))
    })
  })

  return visible
}

const getProjectTranslationLocaleCodes = (payload: unknown) => {
  const locales = new Set<string>()
  if (!isObjectRecord(payload)) return locales

  const translations = payload.translations
  if (!isObjectRecord(translations)) return locales

  Object.entries(translations).forEach(([localeCode, localePayload]) => {
    if (!isObjectRecord(localePayload)) return
    const hasRenderableSection = Object.keys(localePayload).some((key) => !nonVisualContentKeys.has(key))
    if (!hasRenderableSection) return
    locales.add(normalizeCode(localeCode))
  })

  return locales
}

const projectSwitchableLocaleCodes = computed<Set<string> | null>(() => {
  if (isCmsRoutePath(route.path)) return null

  const slug = projectSlug.value
  if (!slug) return null

  const projectPayload = getProjectContent(slug)
  const translationLocaleCodes = getProjectTranslationLocaleCodes(projectPayload)
  if (!translationLocaleCodes.size) return new Set()

  const visibleLocaleCodes = getProjectVisibleLocaleCodes(slug)
  if (!visibleLocaleCodes.size) return new Set()

  return new Set(
    Array.from(translationLocaleCodes).filter((localeCode) => visibleLocaleCodes.has(localeCode)),
  )
})

const availableLanguages = computed<LanguageOption[]>(() => {
  const domainLanguages = filterLocalesForSiteDomain(localesConfig.locales || [], runtimeConfig.public.siteDomain)
  const switchableLocaleCodes = projectSwitchableLocaleCodes.value
  const byProject = !switchableLocaleCodes
    ? domainLanguages
    : domainLanguages.filter((language: { code?: string }) =>
      switchableLocaleCodes.has(normalizeCode(language?.code)),
    )

  return byProject
    .map((language) => ({
      code: String(language?.code || '').trim(),
      name: String(language?.name || language?.code || '').trim(),
    }))
    .filter((language): language is LanguageOption => !!language.code)
})
const shouldRenderSwitcher = computed(() => availableLanguages.value.length > 1)
const isDropdown = computed(() => availableLanguages.value.length >= 5)
const CurrentLanguage = computed(() =>
  availableLanguages.value.find((langConfig) => langConfig.code === locale.value),
)
const fallbackLocaleCode = computed(() => resolveDefaultLocaleForSiteDomain(
  localesConfig.locales || [],
  availableLanguages.value,
  localesConfig.default,
  runtimeConfig.public.siteDomain,
))
const fallbackLanguageName = computed(() =>
  availableLanguages.value.find((langConfig) => langConfig.code === fallbackLocaleCode.value)?.name
  || fallbackLocaleCode.value.toUpperCase(),
)

const changeLanguage = async (langCode: string) => {
  if (!availableLanguages.value.some((language) => language.code === langCode)) {
    return;
  }

  // @ts-ignore
  await setLocale(langCode);

  window.setTimeout(() => location.hash = '', 50);
};

</script>

<template>
  <nav
    :class="['lang-nav', theme]"
  >
    <div
      v-if="shouldRenderSwitcher"
      class="lang-switcher"
    >
      <!-- активный язык со стрелкой -->
      <button
        :class="['small-text', 'lang-current', !isDropdown ? 'lang-current-inline' : '']"
        type="button"
      >
        {{ CurrentLanguage ? CurrentLanguage.name : fallbackLanguageName }}
      </button>

      <!-- список всех языков -->
      <ul :class="isDropdown ? 'lang-list-column' : 'lang-list'">
        <li
          v-for="language in availableLanguages"
          :key="language.code"
          class="lang-item"
        >
          <button
            class="small-text lang-link hover"
            @click.prevent="changeLanguage(language.code)"
          >
            {{ language.name }}
          </button>
        </li>
      </ul>
    </div>
    <div
      v-else
      class="lang-placeholder"
      aria-hidden="true"
    />
  </nav>
</template>

<style scoped>
  .lang-nav {
    position: relative;
  }

  .lang-nav.light{
    --lang-text-color: var(--strategix-dark);
    --lang-text-color-hover: var(--strategix-light);
    --lang-dropdown-bg: #9A9A9A;
  }

  .lang-nav.dark{
    --lang-text-color: var(--strategix-light);
    --lang-text-color-hover: var(--strategix-light);
    --lang-dropdown-bg: #37393D;
  }

  .lang-switcher {
    position: relative;
    display: inline-block;     
    margin: 0;
    padding: 0;      
    list-style: none;
  }

  .lang-placeholder {
    display: block;
    width: clamp(72px, 8vw, 132px);
    min-height: 1px;
    pointer-events: none;
    visibility: hidden;
  }

  /* активный язык + стрелка */
  .lang-current {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 0;
    margin: 0;
    margin-left: 0;

    border: none;
    background: transparent;
    color: var(--lang-text-color);

    cursor: pointer;
    white-space: nowrap;
 
    @media(width < 768px){
       margin-left: 15vw;
       font-size: min(18px, 4.5vw);
    }

    @media(--mobile-medium){
      margin-left: 0;
      font-size: min(14px, calc(var(--vh) * 2.917));
    }
  }

  /* стрелка вниз по умолчанию */
  .lang-current::after {
    content: "";
    width: 6px;
    height: 6px;

    border-right: 2px solid var(--lang-text-color);
    border-bottom: 2px solid var(--lang-text-color);
    transform: translateY(-2px) rotate(45deg);      /* стрелка вниз */
    transform-origin: center;
    transition: transform 0.15s ease;
  }

  /* сам дропдаун */
  .lang-list,
  .lang-list-column {
    position: absolute;
    top: 100%;
    right: -2px;

    margin: 0;
    padding: 12px 8px;
    list-style: none;

    border-radius: var(--card-radius);
    background-color: var(--lang-dropdown-bg);

    opacity: 0;
    pointer-events: none;
    /* transform: translateX(50%); */
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;

    z-index: 10;
  }

  .lang-item + .lang-item {
    margin-top: 6px;
  }

  .lang-link {
    border: none;
    background: transparent;
    outline: none;

    text-decoration: none;
    color: var(--lang-text-color-hover);
    white-space: nowrap;

    @media(width < 768px){
       font-size: min(18px, 4.5vw);
    }

    @media(--mobile-medium){
      font-size: min(14px, calc(var(--vh) * 2.917));
    }
  }

  .lang-switcher:hover .lang-list,
  .lang-switcher:hover .lang-list-column,
  .lang-list-column:hover,
  .lang-list:hover {
    opacity: 1;
    pointer-events: auto;
  }

  .lang-switcher:hover .lang-current::after,
  .lang-list-column:hover ~ .lang-current::after,
  .lang-list:hover ~ .lang-current::after {
    transform: translateY(3px) rotate(-135deg);
  }

  .lang-current-inline {
    display: inline-flex;
  }

  @media (--laptop-width) {
    .lang-switcher {
      display: block;
    }

    /* кнопку прячем, оставляем только горизонтальный список */
    .lang-current-inline {
      display: none;
    }

    /* список становится обычным горизонтальным рядом */
    .lang-list {
      position: static;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0;
      margin: 0;

      background: transparent;
      border-radius: 0;

      opacity: 1;
      pointer-events: auto;
      transform: none;
    }

    .lang-link{
      color: var(--lang-text-color);
    }

    .lang-list .lang-item + .lang-item {
      margin-top: 0;
      margin-left: clamp(20px, 2vw, 48px); /* расстояние между языками */
    }
  }
</style>

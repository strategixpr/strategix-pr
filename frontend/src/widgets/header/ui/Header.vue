<script setup lang="ts">
  import ButtonWithIcon from "@/shared/ui/button-with-icon"
  import strategixLogoWhite from "@/assets/images/strategix-white.svg";
  import strategixLogoBlack from "@/assets/images/strategix-black.svg";
  import LangSwitcher from './LangSwitcher.vue'
  import NavigationMenu from "./NavigationMenu.vue";
  import NavigationMenuMobile from "./NavigationMenuMobile.vue";
  import index from '@/content/pages/index.json'
  import { resolveMediaSrc } from '@/shared/lib/media/resolveMediaSrc'

  const { locale } = useI18n()
  const localePath = useLocalePath()
  const route = useRoute()
  const { app } = useRuntimeConfig()
  const baseURL = app?.baseURL ?? '/'
  const currentLocale = locale.value || 'example'
  const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

  const { theme } = defineProps({
    theme: {
      type: String as () => 'dark' | 'light',
      default: 'dark'
    } 
  })

  const normalizePath = (path: string) => {
    const normalized = path.replace(/\/+$/, '')
    return normalized || '/'
  }

  const resolveInternalHref = (href: string) => {
    const raw = href.trim()
    if (!raw || raw === '#') return '#'
    if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('mailto:') || raw.startsWith('tel:')) {
      return raw
    }
    return resolveMediaSrc(raw, baseURL)
  }

  const homeRoutePath = computed(() => localePath('/'))
  const homePath = computed(() => resolveInternalHref(homeRoutePath.value))
  const isIndexPage = computed(() => normalizePath(route.path) === normalizePath(homeRoutePath.value))
  const resolveHeaderHref = (href: string) => {
    if (!href.startsWith('#')) {
      return resolveInternalHref(href)
    }

    if (isIndexPage.value) {
      return href
    }

    if (href === '#') {
      return homePath.value
    }

    return `${homePath.value}${href}`
  }

  const navData = computed(() => ({
    links: translations.header.navigation_desktop.map(item => ({
      href: resolveHeaderHref(item.href),
      label: item.text
    }))
  }))
  const navData2 = computed(() => ({
    links: translations.header.mobile_menu.navigation_mobile.map(item => ({
      href: resolveHeaderHref(item.href),
      label: item.text
    }))
  }))
  const buttonText = translations.header.button.text
  const buttonHref = computed(() => resolveHeaderHref(translations.header.button.href))
  const buttonHrefMobile = computed(() => resolveHeaderHref(translations.header.mobile_menu.button.href))
</script>

<template>
  <header
    id="header"
    :class="['header', theme]"
  >
    <a
      v-if="!isIndexPage"
      :href="homePath"
      aria-label="На главную"
    >
      <NuxtImg
        class="strategix-logo"
        :src="theme === 'light' ? strategixLogoBlack : strategixLogoWhite"
        alt="strategix logo"
        :width="172"
        :height="36"
        fetchpriority="high"
      />
    </a>
    <NuxtImg
      v-else
      class="strategix-logo"
      :src="theme === 'light' ? strategixLogoBlack : strategixLogoWhite"
      alt="strategix logo"
      :width="172"
      :height="36"
      fetchpriority="high"
    />
    
    <span class="space" />

    <NavigationMenu
      :nav-data="navData"
      :theme="theme"
    /> <!-- планшет - пк -->

    <LangSwitcher :theme="theme" />

    <ButtonWithIcon
      class="fill-form-button"
      style-button="green"
      :href="buttonHref"
      :theme="theme"
    >
      {{ buttonText }}
    </ButtonWithIcon>

    <NavigationMenuMobile
      :nav-data="navData2"
      :button-href="buttonHrefMobile"
    /> <!-- мобилка -->
  </header>
</template>

<style scoped>
  .header {
    width: var(--section-width);
    max-height: calc(var(--vh) * 10);
    padding: calc(var(--vh) * 6.75) var(--padding-section-x) 0;
    box-sizing: border-box;

    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;

    position: relative;
    z-index: 5;
  }

  .header.light {
    background-color: var(--strategix-light);
  }
  
  .header.dark {
    background-color: var(--strategix-dark);
  }

  .strategix-logo{
    width: min(172px, 44.1vw);
    height: auto;
    aspect-ratio: 4.77 / 1;

    @media(--tablet-width) {
      width: clamp(121px, 10.1vw, 245px);
    }

    @media(--mobile-medium) {
      width: auto;
      height: 100%;
    }
  }

  .space{
    display: none;
    width: 0;

    @media(--mobile-width){
      display: block;
      width: 20vw;
    }

    @media(--tablet-width){
      width: 0.5vw;
    }

    @media(--laptop-width){
      width: 2.5vw;
    }
  }

  .fill-form-button{
    display: none;

    padding: max(0.7%, 10px) max(2%, 28px) max(0.5%, 9px) max(1%, 10px); 
    font-size: clamp(9px, calc(0.6vw + var(--vh) * 0.25), 20px);
    margin-left: clamp(0px, 175px - 15vw, 25px); /*margin уменьшаеьтся по мере увеличения ширины*/
    
    @media(--tablet-width){
      display: flex;
    }


    @media(--mobile-medium){
      font-size: min(9px, calc(0.7vw + var(--vh) * 1));   
      padding: min(0.5%, 10px) min(2.25%, 28px) min(0.5%, 10px) min(1%, 10px);     
    }
  }
</style>  

<script setup lang="ts">
import { computed, ref } from "vue";
import xWhite from "@/assets/images/x-white.svg";
import imagePlaceholder from "@/assets/images/image-placeholder.svg";
import index from '@/content/pages/index.json'
import { resolveMediaSrc, resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

const { locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const { app } = useRuntimeConfig()
const baseURL = app?.baseURL ?? '/'
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const brand = translations.footer.brand
const rights = translations.footer.rights
const privacyPolicy = translations.footer.privacy_policy
const resolvedPrivacyPolicyLink = computed(() => {
  const rawHref = (privacyPolicy.href_pdf || '').trim()
  if (!rawHref || rawHref === '#') return '#'
  return resolveMediaSrc(rawHref, baseURL)
})
const email = translations.footer.email

const normalizeIconSrc = (src?: string) => {
  if (!src || typeof src !== 'string') return ''
  return resolveNuxtImageSrc(src, baseURL)
}

const footerIcons = computed(() => {
  const icons = Array.isArray(translations.footer.icons) ? translations.footer.icons : []
  const normalizedIcons = icons
    .map((icon) => ({
      src: normalizeIconSrc((icon as any)?.src || ''),
      href: (icon as any)?.href || '#',
    }))
    .filter((icon) => icon.src)

  return normalizedIcons
})

const normalizePath = (path: string) => {
  const normalized = path.replace(/\/+$/, '')
  return normalized || '/'
}

const homeRoutePath = computed(() => localePath('/'))
const homePath = computed(() => resolveMediaSrc(homeRoutePath.value, baseURL))
const isIndexPage = computed(() => normalizePath(route.path) === normalizePath(homeRoutePath.value))

const formattedPrivacyPolicyText = computed(() => {
  const text = privacyPolicy.text || ''
  const [firstWord, ...restWords] = text.trim().split(/\s+/)

  if (!firstWord) return ''
  return restWords.length ? `${firstWord}\n${restWords.join(' ')}` : firstWord
})

const showPlaceholderIcon = ref<Record<number, boolean>>({})
</script>

<template>
  <footer class="footer">
    <div class="footer__left">
      <a
        v-if="!isIndexPage"
        :href="homePath"
        class="logo-link"
        aria-label="На главную"
      >
        <NuxtImg
          :src="xWhite"
          class="logo"
          :width="50"
          :height="43"
          loading="lazy"
        />
      </a>
      <NuxtImg
        v-else
        :src="xWhite"
        class="logo"
        :width="50"
        :height="43"
        loading="lazy"
      />

      <div class="info">
        <div class="base-text brand">
          {{ brand }}
        </div>
        <div class="base-text rights">
          {{ rights }}
        </div>
      </div>

      <a
        :href="resolvedPrivacyPolicyLink"
        target="_blank"
        rel="noopener"
        class="base-text policy hover"
      >
        {{ formattedPrivacyPolicyText }}
      </a>
    </div>

    <div class="footer__right">
      <a
        :href="`mailto:${email}`"
        class="base-text email hover"
      >
        {{ email }}
      </a>

      <a
        v-for="(icon, iconIndex) in footerIcons"
        :key="icon.href || icon.src || iconIndex"
        :href="icon.href || '#'"
        class="icon"
        target="_blank"
        rel="noopener"
      >
        <NuxtImg
          v-if="!showPlaceholderIcon[iconIndex]"
          :src="icon.src"
          :alt="`footer icon ${iconIndex + 1}`"
          :width="24"
          :height="24"
          loading="lazy"
          @error="showPlaceholderIcon[iconIndex] = true"
        />
        <img
          v-else
          :src="imagePlaceholder"
          :alt="`footer icon ${iconIndex + 1}`"
          :width="24"
          :height="24"
          loading="lazy"
          decoding="async"
        >
      </a>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  width: var(--section-width);
  height: calc(var(--vh) * 10);
  padding: 0 var(--padding-section-x);
  box-sizing: border-box;
  background-color: var(--strategix-dark);

  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

/* Левая часть */
.footer__left {
  width: 100%;
  min-width: 0;
  height: 33%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media(--tablet-width){
    width: 55%;
  }

  @media(--laptop-width){
     width: clamp(350px, 45%, 1070px);
  }
}

.logo {
  width: 6.5%;
  height: auto;
  aspect-ratio: 7 / 6;

  @media(--mobile-medium){
    width: auto;
    height: calc(var(--vh) * 5);
  }
}

.logo-link {
  width: 6.5%;
  height: auto;
  aspect-ratio: 7 / 6;
  display: inline-flex;

  @media(--mobile-medium){
    width: auto;
    height: calc(var(--vh) * 5);
  }
}

.logo-link .logo {
  width: 100%;
  height: auto;

  @media(--mobile-medium){
    width: auto;
    height: 100%;
  }
}

.info {
  display: flex;
  flex-direction: column;
}

.brand {
  font-size: min(10px, 2.4vw);
  font-weight: 400;
  line-height: 120%;
  text-align: left;
  text-transform: uppercase;

  @media(--tablet-width){
    font-size: clamp(10px, calc(0.675vw + var(--vh) * 0.4), 26px);
  }

  @media(--mobile-medium){
    font-size: min(10px, calc(var(--vh) * 2.085));
  }
}

.rights {
  font-size: min(10px, 2.4vw);
  font-weight: 400;
  line-height: 120%;
  text-align: left;
  text-transform: uppercase;

  @media(--tablet-width){
    font-size: clamp(10px, calc(0.675vw + var(--vh) * 0.4), 26px);
  }

  @media(--mobile-medium){
    font-size: min(10px, calc(var(--vh) * 2.085));
  }
}

/* Политика */
.policy {
  text-decoration: none;
  color: white;

  font-size: min(10px, 2.4vw);
  font-weight: 400;
  line-height: 120%;
  text-align: left;
  white-space: pre-line;
  text-transform: uppercase;

  @media(--tablet-width){
    font-size: clamp(10px, calc(0.675vw + var(--vh) * 0.4), 26px);
  }

  @media(--mobile-medium){
    font-size: min(10px, calc(var(--vh) * 2.085));
  }
}

/* Правая часть */
.footer__right {
  display: none;

  
  @media(--tablet-width){
    height: 33%;

    display: flex;
    align-items: center;

    gap: clamp(15px, 2.5vw, 60px);
  }

  @media(--laptop-width){
    gap: clamp(15px, 1.5vw, 60px);
  }
}

.email {
  font-size: clamp(16px, calc(0.835vw + var(--vh) * 0.5) , 32px);
  font-weight: 400;
  text-decoration: none;
  color: white;
  margin:0;
  padding-right: clamp(4px, 0.75vw, 18px);

  @media(--mobile-medium){
    font-size: min(16px, calc(var(--vh) * 3.334));
  }
}


.icon{
  width: auto;
  height: 70%;
  aspect-ratio: 1 / 1;

  border: 1px solid white;
  border-radius: 50%;

  display: flex;
  /* align-items: center;
  justify-content: center; */

  transition: all 0.3s;

  @media(--mobile-medium){
    width: auto;
    height: calc(var(--vh) * 4);
  }
}

.icon:hover{
  cursor: pointer;
  opacity: 0.8;
}

.icon img{
  width: auto;
  height: 55%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  
  margin: auto;
}
</style>

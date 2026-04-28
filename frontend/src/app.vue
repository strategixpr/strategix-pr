<script setup lang="ts">
  import { onMounted, onBeforeUnmount } from 'vue';
  import { useHead, useRuntimeConfig } from '#imports';
  import { useLocaleHead } from '#i18n';
  import indexContent from '@/content/pages/index.json';
  import { getProjectContent } from '@/shared/lib/content/registry';
  import { resolveMediaSrc } from '@/shared/lib/media/resolveMediaSrc';

  type PageInfo = {
    src_favicon?: string;
  };

  type TranslationWithPageInfo = {
    page_info?: PageInfo;
  };

  // SEO/meta tags for current locale (lang, dir, hreflang)
  const head = useLocaleHead({
    lang: true,
    dir: true,
    seo: true,
  });

  const route = useRoute();
  const { locale } = useI18n();
  const { app } = useRuntimeConfig();
  const baseURL = app?.baseURL ?? '/';
  const currentLocale = computed(() => locale.value || 'ru');

  const normalizeFaviconSrc = (value: unknown) => {
    if (typeof value !== 'string') return '';

    const source = value.trim();
    if (!source) return '';
    if (source.startsWith('/') || source.startsWith('http://') || source.startsWith('https://') || source.startsWith('data:')) {
      return source;
    }
    if (source.startsWith('./')) return `/${source.slice(2)}`;

    return `/${source}`;
  };

  const homeTranslations = indexContent.translations as Record<string, TranslationWithPageInfo>;

  const homeLocaleContent = computed<TranslationWithPageInfo>(() => (
    homeTranslations[currentLocale.value] ??
    homeTranslations.ru ??
    homeTranslations.en ??
    Object.values(homeTranslations)[0] ??
    {}
  ));

  const projectLocaleContent = computed<TranslationWithPageInfo | null>(() => {
    const projectSlug = typeof route.params.project === 'string'
      ? route.params.project
      : '';

    if (!projectSlug) return null;

    const project = getProjectContent(projectSlug);
    const translations = project?.translations as Record<string, TranslationWithPageInfo> | undefined;
    if (!translations) return null;

    return (
      translations[currentLocale.value] ??
      translations.ru ??
      translations.en ??
      Object.values(translations)[0] ??
      null
    );
  });

  const defaultPngFaviconHref = computed(() => (
    resolveMediaSrc('/favicon.png', baseURL)
  ));

  const defaultIcoFaviconHref = computed(() => (
    resolveMediaSrc('/favicon.ico', baseURL)
  ));

  const faviconHref = computed(() => {
    const projectFavicon = normalizeFaviconSrc(projectLocaleContent.value?.page_info?.src_favicon);
    if (projectFavicon) return resolveMediaSrc(projectFavicon, baseURL);

    const homeFavicon = normalizeFaviconSrc(homeLocaleContent.value.page_info?.src_favicon);
    if (homeFavicon) return resolveMediaSrc(homeFavicon, baseURL);

    return defaultPngFaviconHref.value;
  });

  const faviconVersionedHref = computed(() => (
    `${faviconHref.value}${faviconHref.value.includes('?') ? '&' : '?'}v=20260326`
  ));
  const defaultPngFaviconVersionedHref = computed(() => (
    `${defaultPngFaviconHref.value}${defaultPngFaviconHref.value.includes('?') ? '&' : '?'}v=20260326`
  ));

  const defaultIcoFaviconVersionedHref = computed(() => (
    `${defaultIcoFaviconHref.value}${defaultIcoFaviconHref.value.includes('?') ? '&' : '?'}v=20260326`
  ));

  useHead(head);
  useHead(() => ({
    link: [
      {
        key: 'favicon',
        rel: 'icon',
        href: faviconVersionedHref.value,
      },
      {
        key: 'shortcut-favicon',
        rel: 'shortcut icon',
        type: 'image/x-icon',
        href: defaultIcoFaviconVersionedHref.value,
      },
      {
        key: 'favicon-png-fallback',
        rel: 'icon',
        type: 'image/png',
        href: defaultPngFaviconVersionedHref.value,
      },
    ],
  }));

  onMounted(() => {
    const coarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
    const isTouchDevice = coarsePointer || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) return;

    const getViewportHeight = () => window.visualViewport?.height ?? window.innerHeight;

    let prevViewportHeight = getViewportHeight();
    let isTextInputFocused = false;
    let keyboardBlurTimeout: ReturnType<typeof setTimeout> | null = null;

    const isTextInput = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };
    const isTextInputActive = () => isTextInput(document.activeElement);

    const setVh = (height = getViewportHeight()) => {
      const vh = height * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    const onResize = () => {
      // Не обновляем --vh во время ввода: это предотвращает скачки прокрутки при клавиатуре.
      if (isTextInputFocused || isTextInputActive()) return;
      const current = getViewportHeight();
      // фильтруем мелкие изменения высоты (движение панелей)
      if (Math.abs(current - prevViewportHeight) > 130) {
        prevViewportHeight = current;
        setVh(current);
      }
    };

    const onOrientationChange = () => {
      // даём WebView стабилизироваться
      setTimeout(() => {
        prevViewportHeight = getViewportHeight();
        setVh(prevViewportHeight);
      }, 300);
    };

    const onFocusIn = (event: FocusEvent) => {
      if (!isTextInput(event.target)) return;
      isTextInputFocused = true;
      if (keyboardBlurTimeout) {
        clearTimeout(keyboardBlurTimeout);
        keyboardBlurTimeout = null;
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      if (!isTextInput(event.target)) return;
      if (keyboardBlurTimeout) {
        clearTimeout(keyboardBlurTimeout);
      }
      // даем клавиатуре закрыться и пропускаем resize на этот момент
      keyboardBlurTimeout = setTimeout(() => {
        isTextInputFocused = false;
        keyboardBlurTimeout = null;
      }, 400);
    };

    // первый замер — только на клиенте, уже внутри onMounted
    setVh(prevViewportHeight);

    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onOrientationChange);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    window.visualViewport?.addEventListener('resize', onResize);

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onOrientationChange);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      window.visualViewport?.removeEventListener('resize', onResize);
      if (keyboardBlurTimeout) {
        clearTimeout(keyboardBlurTimeout);
        keyboardBlurTimeout = null;
      }
    });
  });
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<style src="@/shared/ui/theme/normalize.css"></style>
<style src="@/shared/ui/media.css"></style>
<style src="@/shared/ui/font.css"></style>
<style>
  html{
    scroll-behavior: smooth;
  }

  :root {
    --vh: 1vh; /* фоллбек */

    --strategix-dark: #202226;
    --strategix-light: #F1F1F1;
    --strategix-accent-light: #B0E3C6;
    --strategix-accent: #2AB464;
    --strategix-gray: #A7A7A7;
    
    
    --card-radius: min(24px, calc(1vw + var(--vh) * 1));
    --gap-grid: clamp(10px, 0.834vw, 20px);

    --section-width: 100%; /*Не 100vw, потому что важно учитваять вертикальный скролл, чтобы избежать горизонтального */
    --padding-section-x: 5vw;

    @media (--pc-width) {
      --padding-section-x: calc((var(--section-width) - 2560px) / 2);
    }
  }
  
  .small-text {
    font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 500;          /* Medium */
    font-size: min(14px, 3.6vw);
    line-height: 110%;         
    letter-spacing: 0;
    text-align: center;

    @media(--tablet-width){
      font-size: clamp(12px, 1.1675vw, 28px);
    }

    @media(--mobile-medium) {
      font-size: min(14px, calc(var(--vh) * 2.917));
    }

  }

  .base-text {
    font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 700;    
    letter-spacing: -3%;
    text-align: center;
    text-transform: none;
  }

  .upperscase-text {
    font-family: "Liberty-MT", "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 400;        
    letter-spacing: 0;
    text-align: center;
    text-transform: uppercase;
  }

  .hover{
    transition: all 0.3s;
  }

  .hover:hover{
    cursor: pointer;
    font-weight: 600 !important;
    text-decoration: underline !important;
    opacity: 0.9;
  }

</style>

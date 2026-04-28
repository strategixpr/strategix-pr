<script setup lang="ts">
import indexContent from '@/content/pages/index.json';
import Header from '@/widgets/header';
import Welcome from '@/widgets/welcome';
import AboutUs from '@/widgets/about-us';
import Services from '@/widgets/services';
import OurProjects from '@/widgets/our-projects';
import MarketResponse from '@/widgets/market-response';
import OurTeam from '@/widgets/our-team';
import LeaveRequest from '@/widgets/leave-request';
import Footer from '@/widgets/footer';
import { resolveMediaSrc } from '@/shared/lib/media/resolveMediaSrc';

type HomePageContent = {
  seo?: {
    title?: string;
    description?: string;
    src?: string;
  };
  page_info?: {
    seo?: {
      title?: string;
      description?: string;
      src?: string;
    };
    src_favicon?: string;
  };
  welcome?: {
    title?: string;
    subtitle?: string;
  };
  market_response?: {
    description1?: string;
  };
  footer?: {
    brand?: string;
  };
};

const { locale } = useI18n();
const { app } = useRuntimeConfig();
const currentLocale = computed(() => locale.value || 'ru');
const baseURL = app?.baseURL ?? '/';

const homeTranslations = indexContent.translations as Record<string, HomePageContent>;

const localeContent = computed(() => (
  homeTranslations[currentLocale.value] ??
  homeTranslations.ru ??
  homeTranslations.en ??
  Object.values(homeTranslations)[0] ??
  {}
));

const normalizeText = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
};

const normalizeImageSrc = (value: unknown) => {
  if (typeof value !== 'string') return '';
  return value.trim();
};

const seoBrand = computed(() => {
  const brand = normalizeText(localeContent.value.footer?.brand);
  return brand || 'STRATEGIX';
});

const pageSeo = computed(() => (
  localeContent.value.page_info?.seo ??
  localeContent.value.seo
));

const seoTitle = computed(() => {
  const customTitle = normalizeText(pageSeo.value?.title);
  if (customTitle) return customTitle;

  const title = normalizeText(localeContent.value.welcome?.title);
  return title ? `${title} | ${seoBrand.value}` : seoBrand.value;
});

const seoDescription = computed(() => {
  const customDescription = normalizeText(pageSeo.value?.description);
  if (customDescription) return customDescription;

  const subtitle = normalizeText(localeContent.value.welcome?.subtitle);
  if (subtitle) return subtitle;

  const fallbackDescription = normalizeText(localeContent.value.market_response?.description1);
  return fallbackDescription || 'Strategic reputation marketing for international markets.';
});

const seoImage = computed(() => {
  const customImage = normalizeImageSrc(pageSeo.value?.src);
  if (!customImage) return undefined;

  return resolveMediaSrc(customImage, baseURL) || undefined;
});

useSeoMeta({
  title: seoTitle,
  ogTitle: seoTitle,
  description: seoDescription,
  ogDescription: seoDescription,
  ogImage: seoImage,

  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
});
</script>

<template>
  <Header /> 
  <main>
    <Welcome />
    <AboutUs />
    <Services />
    <OurProjects />
    <MarketResponse />
    <OurTeam />
    <LeaveRequest />
  </main>
  <Footer />
</template>

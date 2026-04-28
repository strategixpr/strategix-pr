<script setup lang="ts">
import indexContent from '@/content/pages/index.json';
import Header from '@/widgets/header';
import NotFound from '@/widgets/not-found';
import Footer from '@/widgets/footer';

const { locale } = useI18n();
const currentLocale = computed(() => locale.value || 'example');

const siteTranslations = indexContent.translations as Record<string, {
  footer?: {
    brand?: string;
  };
}>;

const seoBrand = computed(() => {
  const localizedBrand = siteTranslations[currentLocale.value]?.footer?.brand?.trim();
  if (localizedBrand) return localizedBrand;

  const fallbackBrand = siteTranslations.ru?.footer?.brand?.trim() || siteTranslations.en?.footer?.brand?.trim();
  return fallbackBrand || 'STRATEGIX';
});

const notFoundTitle = computed(() => `Page not found | ${seoBrand.value}`);
const notFoundDescription = 'Requested page was not found.';

useSeoMeta({
  title: notFoundTitle,
  ogTitle: notFoundTitle,
  description: notFoundDescription,
  ogDescription: notFoundDescription,
  robots: 'noindex, nofollow',
});

const requestEvent = useRequestEvent();
if (requestEvent) {
  setResponseStatus(requestEvent, 404);
}
</script>

<template>
  <Header />
  <main>
    <NotFound theme="dark" />
  </main>
  <Footer />
</template>

<style scoped>

</style>

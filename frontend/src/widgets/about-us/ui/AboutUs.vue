<script setup lang="ts">
  import IndexSectionTitle from '@/shared/ui/index-section-title/';
  import AboutItem from './AboutItem.vue';
  import index from '@/content/pages/index.json'

  const { locale } = useI18n()
  const currentLocale = locale.value || 'example'
  const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

  const sectionTitle = translations.about_us.title
  const items = translations.about_us.items
</script>

<template>
  <section
    id="about-us"
    class="about-us"
    aria-labelledby="about-title"
  >
    <IndexSectionTitle>{{ sectionTitle }}</IndexSectionTitle>
  
    <AboutItem
      v-for="(item, index) in items"
      :key="index"
      :title="item.title"
      :subtitle="item.subtitle"
      :content="item.content"
    />
  </section>
</template>

<style scoped>
.about-us{
    width: var(--section-width);
    height: fit-content;
    padding: calc(var(--vh) * 10) var(--padding-section-x);
    box-sizing: border-box;

    background-color: var(--strategix-light);

    display: flex;
    flex-direction: column;
    /* align-items: center; */
}

</style>

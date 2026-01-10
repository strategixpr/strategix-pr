<script setup lang="ts">
  import IndexSectionTitle from '@/shared/ui/index-section-title/';
  import ServiceCard from './ServiceCard.vue';
  import ServiceCtaCard from './ServiceCtaCard.vue';
  import ModalWindow from './ModalWindow.vue';
  import AboutService from './AboutService.vue';
  import { getServices } from "../model/config"
  import index from '@/content/pages/index.json'

  const { locale } = useI18n()
  const services = computed(() => getServices(locale.value || 'example'))
  
  const currentLocale = locale.value || 'example'
  const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example
  const sectionTitle = translations.services.title
</script>

<template>
  <section
    id="services"
    class="services"
  >
    <IndexSectionTitle>{{ sectionTitle }}</IndexSectionTitle>

    <div class="services-grid">
      <template
        v-for="service in services"
        :key="service.id"
      >
        <ServiceCard
          v-if="service.id !== 'questions'"
          :service="service"
          :onclick="`
            if ('replaceState' in history) {
              history.replaceState(null, document.title, location.pathname + location.search);
            } else {
              location.hash = '';
            }
            location.hash = 'services';
            document.getElementById('${service.id}-modal').showModal();
          `"
        />
        <ServiceCtaCard
          v-else
          :service="service"
        />
        <ModalWindow :id="`${service.id}-modal`">
          <AboutService
            :grid-area="service.gridArea"
            :about-service="service.aboutService"
          />
        </ModalWindow>
      </template>
    </div>
  </section>
</template>

<style scped>
.services {
    width: var(--section-width);
    min-height: calc(var(--vh) * 100);
    height: auto;
    padding: 0 var(--padding-section-x) calc(var(--vh) * 10);
    box-sizing: border-box;

    background-color: var(--strategix-light);

    overflow: hidden;

    @media (--laptop-width) and (min-aspect-ratio: 4/3){
      height: calc(var(--vh) * 100);
    }
}

.services-grid{
  width: 100%;
  height: 90%;

  gap: var(--gap-grid);
  display: grid;
  grid-template-columns: repeat(2, calc((100% - var(--gap-grid)) / 2));
  grid-auto-rows: max(calc(var(--vh) * 25), calc(480px - var(--vh) * 37));

  @media(--mobile-width ){
    grid-template-columns: repeat(3, calc((100% - var(--gap-grid)*2) / 3));
    grid-auto-rows: max(calc(var(--vh) * 27.5), calc(575px - var(--vh) * 70));
  }

  @media (--laptop-width) and (min-aspect-ratio: 4/3){
    grid-template-columns: calc(25% - var(--gap-grid)) calc(25% - var(--gap-grid)) calc(17% - var(--gap-grid)) 33%;
    grid-template-rows: calc(29% - var(--gap-grid)) calc(29% - var(--gap-grid)) 42%;
    grid-template-areas: 
        "reputation reputation reputation ai-marketing"
        "media branding branding ai-marketing"
        "media production events ads"
    ;

    .questions{
      display: none;
    }
  }

  @media(--mobile-medium){
    grid-template-columns: repeat(auto-fit, minmax(20vw, 1fr));
    grid-template-rows: repeat(2, minmax(calc(var(--vh) * 40), max-content));
    grid-auto-columns: 20vw;
    grid-auto-rows: minmax(calc(var(--vh) * 40), max-content);
    grid-template-areas: 
      "reputation media branding production"
      "events ai-marketing ads questions"
    ;

    .questions{
      display: flex;
    }
  }
}
</style>

<script setup lang="ts">
import index from '@/content/pages/index.json'

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const title = translations.market_response.title
const description1 = translations.market_response.description1
const description2 = translations.market_response.description2
</script>

<template>
  <section
    id="market-response"
    class="market-response"
  >
    <h3 class="market-title">
      {{ title }}
    </h3>
    <p class="small-text market-description">
      {{ description1 }}
      <br>
      <br>
      {{ description2 }}
    </p>
  </section>
</template>

<style scped>
.market-response {
    width: var(--section-width);
    min-height: calc(var(--vh) * 30);
    height: fit-content;
    padding: calc(var(--vh) * 4) var(--padding-section-x) calc(var(--vh) * 2.25);
    box-sizing: border-box;

    background-color: var(--strategix-light);

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;

    @media(--tablet-width){
      padding: calc(var(--vh) * 8.5) var(--padding-section-x) calc(var(--vh) * 4);
    }
}

.market-title{
    width: 100%;
    height: fit-content;

    margin: 0;

    font-family: "Liberty-MT", "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 400;      
    line-height: 120%;  
    letter-spacing: 0;
    text-align: left;
    text-transform: none;

    color: var(--strategix-dark);
    font-size: min(25px, 6.4vw);

    @media(--tablet-width){
      width: 50.4%;
      height: fit-content;
      font-size: clamp(25px, calc(1.291vw + var(--vh) * 1.533), 52px);
    }

    @media(--mobile-medium) {
      font-size: min(25px, calc(var(--vh) * 6));
    }
    
}

.market-description{
  width: 100%;
  height: fit-content;

  margin: calc(var(--vh) * 2) 0 0;

  color: var(--strategix-dark);
  text-align: left;

  @media(--tablet-width){
    width: 49.6%;
    height: fit-content;

    margin: calc(var(--vh) * 0.5) 0 0;
  }
}
</style>

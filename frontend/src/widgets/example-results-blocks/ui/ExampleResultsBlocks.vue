<script setup lang="ts">
import ExampleSectionTitle from '@/shared/ui/example-section-title';

type ExampleResultBlock = {
  title: string;
  description: string;
  background?: string;
  border?: boolean;
};

type ExampleResultsBlocksData = {
  title?: string;
  subtitle?: string;
  blocks: ExampleResultBlock[];
};

const { data } = defineProps<{
  data: ExampleResultsBlocksData;
}>();

const normalizeBackground = (background?: string) => background?.trim().toLowerCase() ?? '';

const isAccentBackground = (background?: string) => {
  const normalized = normalizeBackground(background);

  return (
    normalized === '#2ab464' ||
    normalized === 'var(--strategix-accent)' ||
    normalized === 'rgb(42, 180, 100)' ||
    normalized === 'rgb(42,180,100)'
  );
};

const isWhiteBackground = (background?: string) => {
  const normalized = normalizeBackground(background);

  return (
    normalized === '#ffffff' ||
    normalized === 'white' ||
    normalized === 'rgb(255, 255, 255)' ||
    normalized === 'rgb(255,255,255)'
  );
};

const getCardClass = (item: ExampleResultBlock) => {
  if (isAccentBackground(item.background)) {
    return {
      'result-card--accent': true,
      'result-card--bg-accent': true,
      'result-card--bordered': Boolean(item.border),
    };
  }

  return {
    'result-card--bg-white': isWhiteBackground(item.background),
    'result-card--bg-light': !isWhiteBackground(item.background),
    'result-card--bordered': Boolean(item.border),
  };
};
</script>

<template>
  <section class="example-results-blocks">
    <div
      v-if="data.title?.trim() || data.subtitle?.trim()"
      class="results-intro"
    >
      <ExampleSectionTitle v-if="data.title?.trim()">
        {{ data.title }}
      </ExampleSectionTitle>

      <p
        v-if="data.subtitle?.trim()"
        class="results-subtitle"
      >
        {{ data.subtitle }}
      </p>
    </div>

    <ul class="results-list">
      <li
        v-for="(item, index) in data.blocks"
        :key="`${item.title}-${index}`"
        class="result-card"
        :class="getCardClass(item)"
      >
        <ExampleSectionTitle class="result-title">
          {{ item.title }}
        </ExampleSectionTitle>

        <p class="result-description small-text">
          {{ item.description }}
        </p>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.example-results-blocks{
  --results-section-gap: min(calc(var(--vh) * 5), 56px);

  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: var(--results-section-gap);

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--tablet-width){
    --results-section-gap: min(calc(var(--vh) * 10), 160px);

    gap: var(--results-section-gap);
  }

  @media(--mobile-medium){
    --results-section-gap: min(calc(var(--vh) * 4), 28px);

    gap: var(--results-section-gap);
  }
}

.results-intro{
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 3), 24px);
}

.results-subtitle{
  margin: 0;
  color: var(--strategix-dark);
  font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: min(18px, 4.6vw);
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 0;
  text-align: left;

  @media(--tablet-width){
    margin-left: calc(((100% - var(--gap-grid)) / 2) - (((100% - var(--gap-grid)) / 2) / 2));
    max-width: clamp(420px, 62vw, 980px);
    font-size: clamp(28px, 2vw, 48px);
    text-transform: uppercase;
    font-weight: 600;
  }

  @media(--mobile-medium){
    font-size: min(28px, calc(var(--vh) * 6.25));
    line-height: 125%;
    text-transform: none;
  }
}

.results-list{
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: var(--gap-grid);

  @media(--tablet-width){
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--gap-grid);
  }
}

.result-card{
  width: 100%;
  min-height: clamp(220px, 25vw, 360px);
  padding: clamp(14px, 2vw, 60px);
  box-sizing: border-box;
  border-radius: var(--card-radius);
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: clamp(16px, 2.4vw, 28px);

  @media(--tablet-width){
    min-height: clamp(140px, calc(var(--vh) * 35), 560px);
  }
}

.result-card--bg-light{
  background-color: var(--strategix-light);
}

.result-card--bg-white{
  background-color: #ffffff;
}

.result-card--bg-accent{
  background-color: var(--strategix-accent);
}

.result-card--bordered{
  border: 1px solid var(--strategix-dark);
}

.results-list .result-card:nth-child(3){
  order: 4;
}

.results-list .result-card:nth-child(4){
  order: 3;
}

@media(--tablet-width){
  .results-list .result-card:nth-child(3),
  .results-list .result-card:nth-child(4){
    order: 0;
  }
}

.result-title{
  color: var(--strategix-dark);
  font-family: 'Onest', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 600;
  line-height: 120%;
  transform: scale(0.9) translateX(-4vw) translateY(calc(var(--vh) * -0.5)); /* Костыль, т.к. текущий размер текста не влезает */

  @media(--tablet-width){
    transform: none;
  }
}

.result-description{
  margin: 0;
  margin-top: auto;
  color: var(--strategix-dark);
  text-align: left;
  text-transform: none;
  letter-spacing: 0;
  font-weight: 400;
  line-height: 120%;
  font-size: min(14px, 4.6vw);

  @media(--tablet-width){
    font-size: clamp(16px, 1.05vw, 22px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 2.9));
  }
}

.result-card--accent .result-title,
.result-card--accent .result-description{
  color: var(--strategix-light);
}
</style>

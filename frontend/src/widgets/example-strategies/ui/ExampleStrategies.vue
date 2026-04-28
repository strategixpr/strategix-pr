<script setup lang="ts">
import { ref } from 'vue'
import ExampleSectionTitle from '@/shared/ui/example-section-title';
import imagePlaceholder from '@/assets/images/image-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

type ExampleStrategiesItem = {
  title: string;
  bullets: string[];
  src?: string;
  location?: string;
  background?: string;
  border?: boolean;
};

type ExampleStrategiesData = {
  title?: string;
  subtitle?: string;
  lists: ExampleStrategiesItem[];
};

const { data } = defineProps<{
  data: ExampleStrategiesData;
}>();
const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';

const hasImage = (src?: string) => Boolean(src?.trim());

const resolveLocation = (location?: string) => {
  return location?.trim().toLowerCase() === 'left' ? 'left' : 'right';
};

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

const getRowClass = (item: ExampleStrategiesItem) => {
  if (!hasImage(item.src)) {
    return 'strategy-row--no-image';
  }

  return `strategy-row--image-${resolveLocation(item.location)}`;
};

const getTextCardClass = (item: ExampleStrategiesItem) => {
  if (isAccentBackground(item.background)) {
    return {
      'strategy-text-card--accent': true,
      'strategy-text-card--bg-accent': true,
      'strategy-text-card--bordered': Boolean(item.border),
    };
  }

  return {
    'strategy-text-card--bg-white': isWhiteBackground(item.background),
    'strategy-text-card--bg-light': !isWhiteBackground(item.background),
    'strategy-text-card--bordered': Boolean(item.border),
  };
};

const showPlaceholder = ref<Record<number, boolean>>({})
</script>

<template>
  <section class="example-strategies">
    <div
      v-if="data.title?.trim() || data.subtitle?.trim()"
      class="strategies-intro"
    >
      <ExampleSectionTitle v-if="data.title?.trim()">
        {{ data.title }}
      </ExampleSectionTitle>

      <p
        v-if="data.subtitle?.trim()"
        class="strategies-subtitle"
      >
        {{ data.subtitle }}
      </p>
    </div>

    <ul class="strategies-list">
      <li
        v-for="(item, index) in data.lists"
        :key="`${item.title}-${index}`"
        class="strategy-row"
        :class="getRowClass(item)"
      >
        <article
          class="strategy-card strategy-text-card"
          :class="getTextCardClass(item)"
        >
          <ExampleSectionTitle class="strategy-title">
            {{ item.title }}
          </ExampleSectionTitle>

          <ul class="strategy-bullets">
            <li
              v-for="(bullet, bulletIndex) in item.bullets"
              :key="`${item.title}-${bulletIndex}`"
              class="strategy-bullet"
            >
              <span
                class="strategy-bullet-dot"
                aria-hidden="true"
              />
              <p class="small-text strategy-bullet-text">
                {{ bullet }}
              </p>
            </li>
          </ul>
        </article>

        <article
          v-if="hasImage(item.src)"
          class="strategy-card strategy-media"
        >
          <NuxtImg
            v-if="!showPlaceholder[index]"
            class="strategy-image"
            :src="resolveNuxtImageSrc(item.src, baseURL)"
            :alt="item.title"
            format="webp"
            :quality="80"
            width="1280"
            height="960"
            sizes="xs:100vw sm:100vw md:100vw lg:44vw xl:44vw xxl:44vw"
            loading="lazy"
            decoding="async"
            @error="showPlaceholder[index] = true"
          />
          <img
            v-else
            class="strategy-image"
            :src="imagePlaceholder"
            :alt="item.title"
            loading="lazy"
            decoding="async"
          >
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.example-strategies{
  --strategies-gap: min(calc(var(--vh) * 4.5), 64px);

  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: var(--strategies-gap);

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--tablet-width){
    --strategies-gap: min(calc(var(--vh) * 10), 160px);;

    gap: var(--strategies-gap);
  }

  @media(--mobile-medium){
    --strategies-gap: min(calc(var(--vh) * 8), 56px);

    gap: var(--strategies-gap);
  }
}

.strategies-intro{
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 3), 24px);
  
  /* @media(--tablet-width){
    gap: min(calc(var(--vh) * 3), 24px);
  } */
}

.strategies-subtitle{
  margin: 0;
  color: var(--strategix-dark);
  font-family: "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: min(18px, 4.6vw);
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 0;
  text-align: left;

  @media(--tablet-width){
    margin-left: calc(((100% - var(--strategies-gap)) / 2) - (((100% - var(--strategies-gap)) / 2) / 2));
    max-width: clamp(420px, 62vw, 980px);
    font-size: clamp(28px, 2vw, 48px);
    font-weight: 600;
    line-height: 110%;
    text-transform: uppercase;
  }

  @media(--mobile-medium){
    font-size: min(28px, calc(var(--vh) * 6.25));
    line-height: 125%;
    text-transform: none;
  }
}

.strategies-list{
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: var(--strategies-gap);
}

.strategy-row{
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--strategies-gap);

  @media(--tablet-width){
    display: grid;
    align-items: stretch;
    gap: var(--gap-grid);
  }

  @media(--mobile-medium){
    gap: var(--gap-grid);
  }
}

.strategy-row--no-image{
  @media(--tablet-width){
    grid-template-columns: minmax(0, 1fr);
  }
}

.strategy-row--image-right{
  @media(--tablet-width){
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  }
}

.strategy-row--image-left{
  @media(--tablet-width){
    grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  }
}

.strategy-row--image-left .strategy-media{
  order: 1;

  @media(--tablet-width){
    display: block;
    height: 100%;
    min-height: 0;
    aspect-ratio: auto;
  }
}

.strategy-row--image-left .strategy-text-card{
  order: 2;
}

.strategy-row--image-right .strategy-media{
  display: none;

  @media(--tablet-width){
    display: block;
    height: 100%;
    min-height: 0;
    aspect-ratio: auto;
    order: 2;
  }
}

.strategy-row--image-right .strategy-text-card{
  @media(--tablet-width){
    order: 1;
  }
}

.strategy-card{
  width: 100%;
  border-radius: var(--card-radius);
  overflow: hidden;
  box-sizing: border-box;
}

.strategy-text-card{
  padding: calc(var(--vh) * 3.75) min(4vw, 27px);

  display: flex;
  flex-direction: column;
  /* gap: clamp(18px, 4.6vw, 30px); */

  @media(--tablet-width){
    padding: clamp(27px, 2.25vw, 54px);
    gap: clamp(2px, calc(var(--vh) * 1.5), 40px);
  }
}

.strategy-text-card--bg-light{
  background-color: var(--strategix-light);
}

.strategy-text-card--bg-white{
  background-color: #ffffff;
}

.strategy-text-card--bg-accent{
  background-color: var(--strategix-accent);
}

.strategy-text-card--bordered{
  border: 1px solid var(--strategix-dark);
}

.strategy-title{
  margin-bottom: calc(var(--vh) * 3);
  color: var(--strategix-dark);
  font-family: 'Onest', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 600;
  transform: scale(0.9) translateX(-4vw) translateY(calc(var(--vh) * -0.5)); /* Костыль, т.к. текущий размер текста не влезает */

  @media(--tablet-width){
    transform: none;
  }
  
}

.strategy-bullets{
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 2.2), 24px);

  @media(--tablet-width){
    gap: clamp(10px, calc(var(--vh) * 3.7), 60px);
  }
}

.strategy-bullet{
  margin: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: clamp(5px, 2.8vw, 64px);
}

.strategy-bullet-dot{
  width: clamp(7px, 2vw, 10px);
  height: clamp(7px, 2vw, 10px);
  border-radius: 50%;
  /* margin-top: clamp(5px, 1.5vw, 8px); */
  margin: calc(var(--vh)/4) 0 auto;
  background-color: var(--strategix-accent);

  @media(--tablet-width){
    margin-top: calc(var(--vh)/1.25);
  }
}

.strategy-bullet-text{
  margin: 0;
  color: var(--strategix-dark);
  font-weight: 300;
  text-align: left;
  text-transform: none;

  @media(--tablet-width){
    font-size: clamp(16px, 1.08vw, 32px);
    line-height: 120%;
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3));
  }
}

.strategy-text-card--accent .strategy-title,
.strategy-text-card--accent .strategy-bullet-text{
  color: var(--strategix-light);
}

.strategy-text-card--accent .strategy-bullet-dot{
  background-color: var(--strategix-light);
}

.strategy-media{
  position: relative;
  aspect-ratio: 16 / 10;
}

.strategy-image{
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  object-position: top;
}
</style>

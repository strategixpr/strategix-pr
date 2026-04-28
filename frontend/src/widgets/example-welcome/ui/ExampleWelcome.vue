<script setup lang="ts">
import { ref } from 'vue'
import VideoPlayer from '@/shared/ui/video-player';
import imagePlaceholder from '@/assets/images/image-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

type ExampleWelcomeAboutItem = {
  label: string;
  value: string;
};

type ExampleWelcomeData = {
  sphere: string;
  name: string;
  src: string;
  autoplay?: boolean;
  description: string[];
  about: ExampleWelcomeAboutItem[];
};

const props = defineProps<{
  data: ExampleWelcomeData;
}>();
const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';

const VIDEO_SRC_PATTERN = /\.(mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i;

const isVideo = computed(() => VIDEO_SRC_PATTERN.test(props.data.src ?? ''));
const shouldAutoplay = computed(() => Boolean(props.data.autoplay));
const showPlaceholder = ref(false)
</script>

<template>
  <section class="example-grid">
    <div class="example-welcome">
      <h1
        class="title"
      >
        <span class="gray"> {{ props.data.sphere }} </span> 
        <br v-if="props.data.sphere">
        {{ props.data.name }}
      </h1>
      <VideoPlayer
        v-if="isVideo"
        class="welcome-img"
        :src="props.data.src"
        :autoplay="shouldAutoplay"
        :hide-controls="true"
      />
      <NuxtImg
        v-else-if="!showPlaceholder"
        class="welcome-img"
        :src="resolveNuxtImageSrc(props.data.src, baseURL)"
        :alt="props.data.name"
        format="webp"
        :quality="80"
        width="1200"
        height="400"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
        loading="lazy"
        decoding="async"
        @error="showPlaceholder = true"
      />
      <img
        v-else
        class="welcome-img"
        :src="imagePlaceholder"
        :alt="props.data.name"
        loading="lazy"
        decoding="async"
      >
    </div>
    <div class="description">
      <p
        v-for="(paragraph, index) in props.data.description"
        :key="`paragraph-${index}`"
        class="base-text info-paragraph"
      >
        {{ paragraph }}
      </p>
    </div>
    <div class="about-case">
      <div
        v-for="(item, index) in props.data.about"
        :key="`${item.label}-${index}`"
        class="small-text about-row"
      >
        <p class="about-label">
          {{ item.label }}
        </p>
        <p class="about-value">
          {{ item.value }}
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.example-grid{
    width: var(--section-width);
    
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas:
      "welcome"
      "about"
      "description";
    grid-auto-rows: auto;
    gap: min(calc(var(--vh) * 7), 55px);
    align-items: start;

    background-color: var(--strategix-light);
    font-synthesis: none;

    @media(--tablet-width){
        grid-template-columns: minmax(0, 5fr) minmax(0, 3fr);
        grid-template-areas:
          "welcome welcome"
          "description about";
        column-gap: clamp(25px, 8.334vw, 200px);
        row-gap: clamp(36px, calc(var(--vh) * 10), 160px);
    }

    @media(--pc-width){
        grid-template-columns: minmax(0, 4fr) minmax(0, 3fr);
    }

    @media(--mobile-medium){
        grid-template-columns: minmax(0, 5fr) minmax(0, 4fr);
        grid-template-areas:
          "welcome welcome"
          "description about";
        row-gap: min(calc(var(--vh) * 14), 64px);
    }
}

.example-welcome {
    grid-area: welcome;
    width: 100%;
    min-height: calc(var(--vh) * 42.5);
    height: auto;
    max-height: calc(var(--vh) * 110);

    display: flex;
    flex-direction: column;
    
    @media(min-aspect-ratio: 5/4) and (width >= 480px){
      min-height: calc(var(--vh) * 60.5);
    }

    @media(min-aspect-ratio: 5/3) and (width >= 480px){
      min-height: calc(var(--vh) * 75);
    }

    @media(min-aspect-ratio: 2/1) and (width >= 480px){
      min-height: calc(var(--vh) * 90);
    }

    @media(--mobile-medium){
        min-height: calc(var(--vh) * 80);
    }
  }

.title {
    width: 100%;
    padding: 0 var(--padding-section-x);
    box-sizing: border-box;
    margin: auto 0;
    text-align: left;

    font-family: "Liberty-MT", "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-weight: 400;        
    letter-spacing: 0;
    font-size: min(min(10vw, calc(var(--vh) * 5.25)), 42px);
    line-height: 110%;
    color: var(--strategix-accent);

    @media(--mobile-width){
      font-size: clamp(min(min(4vw, var(--vh) * 3), 42px), 1.95vw + var(--vh) * 2.85, 100px);
    }

    @media(--tablet-width) {
      font-size: clamp(42px, calc((var(--vh) * 3) + 1vw), 140px);
      padding: calc(var(--vh) * 2) var(--padding-section-x) 0;
    }

    @media(--pc-width){
      font-size: clamp(42px, calc(var(--vh) * 7), 140px);
    }

    @media(--mobile-medium) {
       font-size: min(min(10vw, calc(var(--vh) * 5.5)), 42px);
    }
}

.gray{
  color: var(--strategix-gray);
}

.welcome-img{
  width: 100%;
  min-height: 40%;
  aspect-ratio: 390 / 185;
  height: auto;
  max-height: 100%;

  object-fit: cover;
  object-position: center;
  display: block;

  @media(--tablet-width) {
      min-height: 65%;
  }

  @media(min-aspect-ratio: 2/3){
      aspect-ratio: 1200 / 323;
  }
    
  @media(--pc-width) {
      padding-inline: var(--padding-section-x);
      box-sizing: border-box;
      max-height: 75%;
      aspect-ratio: 1200 / 572;
  }

	@media(--mobile-medium) {
	    max-height: 75%;
	}
}

.welcome-img :deep(.video-player__video),
.welcome-img :deep(.video-player__placeholder){
  width: 100%;
  height: 100%;
  max-height: 100%;
  aspect-ratio: inherit;
  object-fit: cover;
  object-position: center;
  display: block;
}

.description{
  grid-area: description;
  padding: 0 var(--padding-section-x) 0 var(--padding-section-x);
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: calc(var(--vh) * 2);

  @media(--tablet-width){
    padding: 0 0 0 var(--padding-section-x);
    gap: calc(var(--vh) * 2.75);
  }

  @media(--pc-width){
    padding: 0 0 0 calc((100vw - 2560px) / 2);
  }

  @media(--mobile-medium) {
    padding: 0 0 0 var(--padding-section-x);
  }
}

.info-paragraph{
  margin: 0;

  text-align: left;
  font-size: min(18px, 4.6vw);
  font-weight: 500;
  line-height: 120%;
  color: var(--strategix-dark);

  @media(--tablet-width){
    font-size: clamp(18px, calc(0.6175vw + var(--vh) * 2), 48px);
  }

  @media(--mobile-medium) {
    font-size: min(25px, calc(var(--vh) * 3.75));
  }
}

.about-case{
  grid-area: about;
  padding: 0 var(--padding-section-x) 0 var(--padding-section-x);
  display: grid;
  gap: min(calc(var(--vh) * 3), 30px);

  @media(--tablet-width){
    padding: 0 var(--padding-section-x) 0 0;
    gap: min(calc(var(--vh) * 1.85), 40px);
  }

  @media(--pc-width){
    padding: 0 calc((100vw - 2560px) / 2) 0 0;
  }

  @media(--mobile-medium) {
    padding: 0 var(--padding-section-x) 0 0;
    gap: min(calc(var(--vh) * 0.8), 7px);
  }
}

.about-row{
  width: 100%;
  min-height: calc(var(--vh) * 3);
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: clamp(12px, 2vw, 28px);
  align-items: start;

  font-size: min(18px, 4.6vw);

  @media(--tablet-width){
    grid-template-columns: 3fr 7fr;
    font-size: clamp(16px, 1vw, 32px);
  }

  @media(--pc-width){
    min-width: 1100px;
    max-width: calc((var(--section-width) / 3));
  }

  @media(--mobile-medium) {
    width: 100%;
    font-size: min(18px, calc(var(--vh) * 3.75));
  }
}

.about-label{
  text-align: left;
  font-weight: 400;
  color: var(--strategix-gray);

  margin: 0;
}

.about-value{
  text-align: left;
  font-weight: 400;

  margin: 0;
}
</style>

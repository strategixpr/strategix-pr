<script setup lang="ts">
import { computed, ref } from 'vue'
import imagePlaceholder from '@/assets/images/image-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

const {route, src, title, description} = defineProps<{route: string, src: string, title: string, description: string}>()

const { locale } = useI18n()
const { app } = useRuntimeConfig()
const baseURL = app?.baseURL ?? '/'

const showPlaceholder = ref(false)
const resolvedSrc = computed(() => resolveNuxtImageSrc(src, baseURL))
</script>

<template>
  <li class="project-card">
    <NuxtLink
      class="project-card-link"
      :to="`/${locale}/project/${route}`"
      no-prefetch
    >
      <NuxtImg
        v-if="!showPlaceholder && resolvedSrc"
        :src="resolvedSrc"
        class="img-card"
        sizes="xs:74.36vw sm:74.36vw md:32.5vw lg:33vw xl:33vw xxl:33vw"
        format="webp"
        :quality="80"
        :alt="title"
        loading="lazy"
        decoding="async"
        :width="1000"
        :height="1000"
        @error="showPlaceholder = true"
      />
      <img
        v-else
        :src="imagePlaceholder"
        class="img-card"
        :alt="title"
        loading="lazy"
        decoding="async"
      >
      <h4 class="base-text title-card">
        {{ title }}
      </h4>
      <p class="small-text description-card">
        {{ description }}
      </p>
    </NuxtLink>
  </li>
</template>

<style scoped>
.project-card{
  width: auto;
  height: 100%;
  flex: 0 0 auto;
  min-width: 0;
  box-sizing: border-box;

  aspect-ratio: 3 / 5;

  border-color: var(--strategix-accent);
  border-radius: var(--card-radius);

  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;

  transition: all 0.3s;
  overflow: hidden;
}

.project-card-link{
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  text-decoration: none;
}

.img-card{
  width: 100%;
  height: 60%;
  max-height: calc(var(--vh) * 45.5);

  object-fit: cover;
  border-radius: 0 0 var(--card-radius) var(--card-radius);

  @media(--tablet-width){
    max-height: calc(var(--vh) * 48.6);
  }

  @media(--mobile-medium){
    max-height: calc(var(--vh) * 40);
  }
}

.title-card{
  width: 70%;
  text-align: left;
  margin: min(7%, calc(var(--vh) * 3)) 0 0 6%;

  color: white;
  text-transform: uppercase;
  font-size: clamp(23px, calc(1.25vw + var(--vh) * 1.5), 50px);
  font-weight: 500;

  transition: all 0.3s;

  @media(--mobile-medium){
    font-size: min(23px, calc(var(--vh) * 5))
  }
}

.description-card{
  width: 90%;
  margin: auto 0 min(12.5%, calc(var(--vh) * 5)) 6%;

  color: white;
  text-align: left;
  line-height: 110%;

  transition: all 0.3s;

  @media(--laptop-width){
    width: 73%;
    margin: auto 0 min(7%, calc(var(--vh) * 3)) 6%;
  }
}

.project-card:hover{
  height: calc(100% - var(--vh) * 1);
  transform: translateY(calc(var(--vh) * 1));
  border: clamp(2px, 0.175vw, 6px) solid var(--strategix-accent);
  cursor: pointer;
}

.project-card:hover .img-card{
  height: calc(60% + var(--vh) * 0.5);
}

.project-card:hover .title-card{
  font-weight: 700;
}

.project-card:hover .description-card{
  width: 92%;
  
  @media(--laptop-width){
    width: 75%;
    margin: auto 0 min(7%, calc(var(--vh) * 2.25)) 6%;
  }
}
</style>

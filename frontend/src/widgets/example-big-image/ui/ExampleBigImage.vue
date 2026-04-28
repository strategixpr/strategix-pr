<script setup lang="ts">
import { ref } from 'vue'
import imagePlaceholder from '@/assets/images/image-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

const {data} = defineProps<{
  data: {
    src: string;
    srcMobile?: string;
    alt: string;
  };
}>();
const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';

const showPlaceholderMobile = ref(false)
const showPlaceholderDesktop = ref(false)
</script>

<template>
  <section
    class="example-big-image"
  >
    <NuxtImg
      v-if="!showPlaceholderMobile"
      :src="resolveNuxtImageSrc(data.srcMobile || data.src, baseURL)"
      :alt="data.alt"
      format="webp"
      :quality="80"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
      loading="lazy"
      decoding="async"
      @error="showPlaceholderMobile = true"
    />
    <img
      v-else
      :src="imagePlaceholder"
      :alt="data.alt"
      loading="lazy"
      decoding="async"
    >
    <NuxtImg
      v-if="!showPlaceholderDesktop"
      :src="resolveNuxtImageSrc(data.src, baseURL)"
      :alt="data.alt"
      format="webp"
      :quality="80"
      sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
      loading="lazy"
      decoding="async"
      @error="showPlaceholderDesktop = true"
    />
    <img
      v-else
      :src="imagePlaceholder"
      :alt="data.alt"
      loading="lazy"
      decoding="async"
    >
  </section>
</template>

<style scoped>
.example-big-image{
  width: var(--section-width);
  height: auto;
  max-height: min(calc(var(--vh) * 100), 1600px);
  box-sizing: border-box;

  margin: 0;
  padding-inline: 0;

  background-color: var(--strategix-light);
  font-synthesis: none;

  img{
    width: 100%;
    height: auto;
    max-height: inherit;
    object-fit: cover;

    &:first-child{ /* мобилка */
       display: block;
    }
    
    &:last-child{ /* пк */
       display: none;
    }

    @media(--tablet-width){
      &:first-child{ /* мобилка */
        display: none;
      }
      
      &:last-child{ /* пк */
        display: block;
      }
    }
  }

  @media(--pc-width){
    padding-inline: var(--padding-section-x);
  }

  @media(--mobile-medium){
    padding-inline: 0;
  }

}

</style>

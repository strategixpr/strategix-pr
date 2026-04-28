<script setup lang="ts">
import { ref } from 'vue'
import imagePlaceholder from '@/assets/images/image-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

const {data} = defineProps<{
  data: {
    src: string;
    alt: string;
    backgroundColor?: string;
  };
}>();
const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';

const showPlaceholder = ref(false)
</script>

<template>
  <section
    class="example-big-logo"
  >
    <div
      class="wrapper-logo"
      :style="data.backgroundColor ? { backgroundColor: data.backgroundColor } : {}"
    >
      <NuxtImg 
        v-if="!showPlaceholder"
        :src="resolveNuxtImageSrc(data.src, baseURL)"
        :alt="data.alt"
        format="webp"
        :quality="80"
        sizes="xs:100vw sm:100vw md:100vw lg:100vw xl:100vw xxl:100vw"
        loading="lazy"
        decoding="async"
        @error="showPlaceholder = true"
      />
      <img
        v-else
        :src="imagePlaceholder"
        :alt="data.alt"
        loading="lazy"
        decoding="async"
      >
    </div>
  </section>
</template>

<style scoped>
.example-big-logo{
  width: var(--section-width);
  max-width: var(--section-width);
  overflow: hidden;
  height: calc(var(--vh) * 17.5);
  max-height: max(calc(var(--vh) * 35), 700px);
  box-sizing: border-box;

  margin: 0;
  padding-inline: 0;

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--pc-width){
    padding-inline: var(--padding-section-x);
  }

  @media(--tablet-width){
    height: calc(var(--vh) * 35);
  }

  @media(--mobile-medium){
    height: calc(var(--vh) * 70);
    padding-inline: 0;
  }
}

.wrapper-logo{
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  img{
    width: auto;
    height: 90%;
    margin: auto;
    display: block;
    object-fit: cover;
  }
}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import imagePlaceholder from '@/assets/images/image-vertical-placeholder.svg'
import { resolveNuxtImageSrc } from '@/shared/lib/media/resolveMediaSrc'

const {src, name, lastname, position} = defineProps<{src: string, name: string, lastname: string, position: string}>()
const { app } = useRuntimeConfig()
const baseURL = app?.baseURL ?? '/'

const showPlaceholder = ref(false)
const resolvedSrc = computed(() => resolveNuxtImageSrc(src, baseURL))
</script>

<template>
  <article class="member-card">
    <NuxtImg
      v-if="!showPlaceholder && resolvedSrc"
      class="image-card"
      :src="resolvedSrc"
      sizes="xs:170px sm:170px md:25vw lg:25vw xl:25vw xxl:25vw"
      format="webp"
      :quality="70"
      :alt="`${name} ${lastname}`"
      loading="lazy"
      decoding="async"
      :width="600"
      :height="600"
      @error="showPlaceholder = true"
    />
    <img
      v-else
      class="image-card"
      :src="imagePlaceholder"
      :alt="`${name} ${lastname}`"
      loading="lazy"
      decoding="async"
    >
    <div class="text-background">
      <h4 class="small-text name">
        {{ name }} {{ lastname }}
      </h4>
      <p class="small-text position">
        {{ position }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.member-card{
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: var(--card-radius);

    position: relative;
}

.image-card{
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
}

.text-background{
    width: 85%;
    height: fit-content;
    /* height: 18%; */

    position: absolute;
    bottom: 16%;
    left: 50%;
    transform: translateX(-50%) translateY(50%);

    display: flex;
    flex-direction: column;
    justify-content: space-around;

    border-radius: calc(var(--card-radius) / 2.5);
    background-color: white;
}

.name{
    margin: 2.5% 4%;

    font-size: min(12px, calc(1.2vw + var(--vh) * 0.8));
    line-height: 110%;
    font-weight: 600;
    text-align: left;

    color: var(--strategix-dark);

    @media(--tablet-width){
      font-size: clamp(12px, calc(0.9vw + var(--vh) * 0.5), 30px);
    }

    @media(--mobile-medium) {
      font-size: min(12px, calc(var(--vh) * 2.5));
    }
}

.position{
    margin: 0 4% 2.5%;

    font-size: min(12px, calc(1.2vw + var(--vh) * 0.8));
    line-height: 110%;
    font-weight: 600;
    font-variation-settings: "wght" 500;
    text-align: left;

    color: var(--strategix-gray);

    @media(--tablet-width){
      font-size: clamp(10px, calc(0.9vw + var(--vh) * 0.5), 30px);
    }

    @media(--mobile-medium) {
      font-size: min(12px, calc(var(--vh) * 2.5));
    }
}

</style>

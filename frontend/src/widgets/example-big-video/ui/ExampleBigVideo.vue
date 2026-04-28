<script setup lang="ts">
import { computed } from 'vue';
import VideoPlayer from '@/shared/ui/video-player';
import { useMediaQueryMatch } from '@/shared/lib/media/useMediaQueryMatch';

const {data} = defineProps<{
  data: {
    src: string;
    srcMobile?: string;
    alt?: string;
    autoplay?: boolean;
  };
}>();

const isTabletViewport = useMediaQueryMatch('(min-width: 768px)');
const activeVideoSrc = computed(() => (
  isTabletViewport.value
    ? data.src
    : data.srcMobile || data.src
));
</script>

<template>
  <section
    class="example-big-video"
  >
    <VideoPlayer
      class="example-big-video__player"
      :src="activeVideoSrc"
      :autoplay="data.autoplay"
      :hide-controls="true"
    />
  </section>
</template>

<style scoped>
.example-big-video{
  width: var(--section-width);
  height: auto;
  max-height: min(calc(var(--vh) * 100), 1600px);
  box-sizing: border-box;

  margin: 0;
  padding-inline: 0;

  background-color: var(--strategix-light);
  font-synthesis: none;
}

.example-big-video__player{
  width: 100%;
  height: auto;
  max-height: inherit;
}

.example-big-video :deep(.video-player__video){
  width: 100%;
  height: auto;
  min-height: 0;
  max-height: inherit;
  aspect-ratio: auto;
  object-fit: cover;
}

@media(--pc-width){
  .example-big-video{
    padding-inline: var(--padding-section-x);
  }
}

@media(--mobile-medium){
  .example-big-video{
    padding-inline: 0;
  }
}
</style>

<script setup lang="ts">
import HorizontalSlider from '@/shared/ui/horizontal-slider';
</script>

<template>
  <HorizontalSlider class="slider">
    <slot />
  </HorizontalSlider>
</template>

<style scoped>
.slider {
  --slider-viewport-height: 78%;
  --slider-gap: 1.25%;
  --slider-spacer-size: calc(var(--padding-section-x) - 1.25%);
  --slider-item-snap-align: center;
}

@media(--tablet-width){
  .slider{
    --slider-spacer-size: var(--padding-section-x);
    --slider-spacer-margin-left: -1.25%;
  }
}

@media(--mobile-medium){
  .slider{
    --slider-spacer-size: var(--padding-section-x);
    --slider-spacer-margin-left: -1.25%;
  }
}
</style>

<script setup lang="ts">
  const {isWhite} = defineProps<{'isWhite'?: boolean}>()
</script>

<template>
  <h2
    id="about-title"
    class="base-text h2-text"
    :class="isWhite && 'color-white'"
  >
    <slot />
  </h2>
</template>

<style scoped>
  .h2-text {
    font-weight: 800;    
    letter-spacing: 0;
    text-align: left;
    text-transform: uppercase;
    font-size: clamp(18px, 2vw, 48px);
    font-weight: 800;
    margin: 0 0 min(40px, calc(var(--vh) * 4));
    color: var(--strategix-dark);

    @media(--big-laptop-width){
      margin: 0 0 clamp(40px, calc(var(--vh) * 5), 80px);
    }

    @media(--mobile-medium){
      font-size: min(24px, calc(var(--vh) * 4.25));
    }
  }

  .color-white{
    color: white;
  }
</style>
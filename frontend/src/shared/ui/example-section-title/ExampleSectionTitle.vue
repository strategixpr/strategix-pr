<script setup lang="ts">
  const {isWhite} = defineProps<{'isWhite'?: boolean}>()
</script>

<template>
  <h2
    class="upperscase-text h2-text"
    :class="isWhite && 'color-white'"
  >
    <slot />
  </h2>
</template>

<style scoped>
  .h2-text {
    margin: 0;
    color: var(--strategix-accent);

    font-size: min(28px, 7.2vw);
    font-weight: 400;
    font-synthesis: none;
    line-height: 110%;
    letter-spacing: 0;
    text-align: left;

    @media(--tablet-width){
      font-size: clamp(28px, 2vw, 48px);
    }

    @media(--mobile-medium){
      font-size: min(28px, calc(var(--vh) * 6.25));
    }
  }

  .color-white{
    color: white;
  }
</style>

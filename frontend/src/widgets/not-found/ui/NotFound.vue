<script setup lang="ts">
const { theme } = defineProps({
  theme: {
    type: String as () => 'dark' | 'light',
    default: 'dark'
  }
})
</script>

<template>
  <section
    :class="['not-found', theme]"
  >
    <h1 class="upperscase-text">
      404
    </h1>
  </section>
</template>

<style scoped>
.not-found{
  width: var(--section-width);
  height: calc(var(--vh) * 80);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  place-content: center;

  color: rgb(230, 42, 42);
}

.not-found.dark{
  background-color: var(--strategix-dark);
}

.not-found.light{
  background-color: var(--strategix-light);
}

</style>

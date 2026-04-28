<script setup lang="ts">

const {data} = defineProps<{
  data: {
    title: string;
    description: string[];
  };
}>();
</script>

<template>
  <section class="example-info">
    <h2 class="base-text info-title">
      {{ data.title }}
    </h2>
    <div class="info-text">
      <p
        v-for="(paragraph, index) in data.description"
        :key="`paragraph-${index}`"
        class="base-text info-paragraph"
      >
        {{ paragraph }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.example-info{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: grid;
  grid-template-columns: minmax(0, 1fr);
  row-gap: min(calc(var(--vh) * 4), 40px);
  align-items: start;

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--tablet-width){
    grid-template-columns: minmax(0, 19fr) minmax(0, 20fr);
    column-gap: clamp(20px, 3.333vw, 80px);
    row-gap: 0;
  }

  @media(--mobile-medium){
    row-gap: min(calc(var(--vh) * 3), 24px);
  }
}

.info-title{
  margin: 0;
  color: var(--strategix-dark);
  text-align: left;
  font-size: min(28px, 6vw);
  line-height: 129%;
  font-family: 'Onest', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0;

  @media(--tablet-width){
    font-size: clamp(26px, calc(var(--vh) * 2 + 0.75vw), 52px);
    line-height: 120%;
    /* max-width: 100%; */
  }

  @media(--mobile-medium){
    font-size: min(26px, calc(var(--vh) * 6));
  }
}

.info-text{
  display: flex;
  flex-direction: column;
  gap: clamp(16px, 3vw, 28px);
  width: 100%;

  @media(--tablet-width){
    max-width: clamp(280px, 40vw, 560px);
    gap: clamp(20px, calc(var(--vh) * 3.5), 60px);
  }
}

.info-paragraph{
  margin: 0;
  color: var(--strategix-dark);
  font-weight: 400;
  text-align: left;
  text-transform: none;
  letter-spacing: 0;
  line-height: 110%;
  font-size: min(18px, 4.6vw);

  @media(--tablet-width){
    font-size: clamp(16px, 1.1vw, 32px);
    line-height: 120%;
    width: 105%;
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3.2));
  }
}

</style>

<script lang="ts" setup>
  defineProps<{
    title: string;
    result: string;
    unit_measurement?: string;
  }>();
</script>

<template>
  <li class="cell-with-result">
    <p class="title base-text">
      {{ title }}
    </p>
    <p class="result base-text">
      {{ result }}
      <span
        v-if="unit_measurement"
        class="unit-measurement"
      > {{ unit_measurement }}</span>
    </p>
  </li>
</template>

<style scoped>
.cell-with-result{
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 2), 16px);

  color: var(--strategix-accent);

  @media(--tablet-width){
    gap: clamp(12px, calc(var(--vh) * 1.5), 24px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 2), 14px);
  }
}

.title{
  --title-dot-size: clamp(6px, 0.7vw, 12px);
  --title-gap: clamp(4px, 0.35vw, 12px);

  /* width: 100%; */
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--title-gap);
  position: relative;
  padding-bottom: clamp(4px, 0.35vw, 8px);

  text-align: left;
  font-size: min(14px, 3.8vw);
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 0;

  @media(--tablet-width){
    font-size: clamp(16px, 1vw, 32px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3));
  }
}

.title::before{
  content: "";
  width: var(--title-dot-size);
  height: var(--title-dot-size);
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  background-color: var(--strategix-accent);
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.title::after{
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: min(4px, 0.2vh);
  background-color: var(--strategix-accent);
}

.result{
  margin: 0;
  text-align: left;
  color: inherit;

  font-size: min(46px, 11vw);
  font-weight: 400;
  line-height: 90%;
  letter-spacing: -0.02em;

  @media(--tablet-width){
    font-size: clamp(50px, 5vw, 72px);
  }

  @media(--mobile-medium){
    font-size: min(48px, calc(var(--vh) * 11));
  }
}

.unit-measurement{
  display: block;
  margin-top: min(calc(var(--vh) * 2), 20px);

  font-size: min(14px, 3.6vw);
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 0;

  @media(--tablet-width){
    font-size: clamp(16px, 1vw, 32px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 2.8));
  }
}
</style>

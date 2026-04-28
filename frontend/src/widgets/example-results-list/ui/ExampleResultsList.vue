<script setup lang="ts">
import { computed } from 'vue';
import ExampleSectionTitle from '@/shared/ui/example-section-title';

type ExampleResultsListData = {
  title?: string;
  bullets: string[];
};

const { data } = defineProps<{
  data: ExampleResultsListData;
}>();

const validBullets = computed(() => (data.bullets ?? []).filter((bullet) => Boolean(bullet?.trim())));
</script>

<template>
  <section class="example-results-list">
    <div class="results-layout">
      <ExampleSectionTitle>
        {{ data.title ?? 'Результаты' }}
      </ExampleSectionTitle>

      <ul class="results-bullets">
        <li
          v-for="(bullet, index) in validBullets"
          :key="`results-bullet-${index}`"
          class="results-bullet"
        >
          <span
            class="results-bullet-dot"
            aria-hidden="true"
          />
          <p class="results-bullet-text">
            {{ bullet }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.example-results-list{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;
  background-color: var(--strategix-light);
  font-synthesis: none;
}

.results-layout{
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 3), 24px);

  @media(--tablet-width){
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 3fr);
    column-gap: clamp(28px, 3.6vw, 96px);
    align-items: start;
  }
}

.results-bullets{
  list-style: none;
  margin: 0;
  padding: 0;

  display: flex;
  flex-direction: column;
  gap: clamp(14px, 2vw, 24px);
}

.results-bullet{
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  column-gap: clamp(12px, 1.2vw, 18px);
}

.results-bullet-dot{
  width: clamp(8px, 0.72vw, 12px);
  height: clamp(8px, 0.72vw, 12px);
  margin-top: clamp(6px, 0.5vw, 9px);
  border-radius: 50%;
  background-color: var(--strategix-accent);
}

.results-bullet-text{
  margin: 0;
  color: var(--strategix-dark);
  text-align: left;
  text-transform: none;
  letter-spacing: 0;
  line-height: 120%;
  font-family: 'Onest', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: min(18px, 4.5vw);
  font-weight: 500;

  @media(--tablet-width){
    font-size: clamp(18px, 1.6vw, 34px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3.2));
    line-height: 125%;
  }
}
</style>

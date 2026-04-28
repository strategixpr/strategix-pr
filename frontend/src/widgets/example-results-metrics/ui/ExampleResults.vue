<script setup lang="ts">
    import ExampleSectionTitle from '@/shared/ui/example-section-title';
    import CellWithResult from './CellWithResult.vue';

    type ExampleResultsItem = {
      title: string;
      result: string;
      unit_measurement?: string;
    };

    type ExampleResultsData = {
      title?: string;
      description: string;
      items: ExampleResultsItem[];
    };

    defineProps<{
      data: ExampleResultsData;
    }>();
</script>

<template>
  <section class="example-rusults">
    <ExampleSectionTitle>
      {{ data.title ?? 'Результат' }}
    </ExampleSectionTitle>
    <p class="description base-text">
      {{ data.description }}
    </p>
    <ul class="cells-list">
      <CellWithResult
        v-for="(item, index) in data.items"
        :key="`${item.title}-${index}`"
        :title="item.title"
        :result="item.result"
        :unit_measurement="item.unit_measurement"
      />
    </ul>
  </section>
</template>

<style scoped>
.example-rusults{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 3), 36px);

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 3.5), 40px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 3), 24px);
  }
}

.description{
  margin: 0;

  font-size: min(16px, 4.2vw);
  font-weight: 400;
  line-height: 140%;
  letter-spacing: 0;
  text-align: left;

  @media(--tablet-width){
    font-size: clamp(16px, 1vw, 32px);
    line-height: 145%;
  }

  @media(--mobile-medium){
    font-size: min(16px, calc(var(--vh) * 3.8));
  }
}

.cells-list{
  list-style: none;
  padding: 0;
  margin: 0;

  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: clamp(16px, 6vw, 64px);
  row-gap: clamp(24px, calc(var(--vh) * 4), 48px);
  align-items: start;

  @media(--tablet-width){
    row-gap: clamp(28px, calc(var(--vh) * 4), 56px);
  }

  @media(--laptop-width){
    grid-template-columns: repeat(4, minmax(0, 1fr));
    column-gap: clamp(20px, 5.5vw, 160px);
  }

  @media(--mobile-medium){
    column-gap: min(6vw, 24px);
    row-gap: min(calc(var(--vh) * 4), 32px);
  }
}

</style>

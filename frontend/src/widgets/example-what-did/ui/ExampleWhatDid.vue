<script setup lang="ts">
  import ExampleSectionTitle from '@/shared/ui/example-section-title';
  import ExampleList from '@/shared/ui/example-list';

  type ExampleWhatDidData = {
    title?: string;
    description: string;
    list: string[];
  };

  defineProps<{
    data: ExampleWhatDidData;
  }>();
</script>

<template>
  <section class="example-goals-company">
    <ExampleSectionTitle :is-white="true">
      {{ data.title ?? 'Что сделали' }}
    </ExampleSectionTitle>
    <p class="base-text description">
      {{ data.description }}
    </p>

    <ExampleList
      :list="data.list"
      :is-white="true"
    />
  </section>
</template>

<style scoped>
.example-goals-company{
  width: var(--section-width);
  padding-block: min(calc(var(--vh) * 4), 40px);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;
  background-color: var(--strategix-accent);
  font-synthesis: none;

  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 3), 36px);

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 3.5), 40px);
    padding-block: min(calc(var(--vh) * 7.5), 140px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 3), 24px);
    padding-block: min(calc(var(--vh) * 8), 56px);
  }
}

.description{
  margin: 0;
  color: var(--strategix-light);

  font-size: min(16px, 4.2vw);
  font-weight: 600;
  line-height: 135%;
  letter-spacing: 0;
  text-transform: uppercase;
  text-align: left;

  @media(--tablet-width){
    font-size: clamp(16px, 1.6vw, 24px);
    line-height: 130%;
  }

  @media(--mobile-medium){
    font-size: min(16px, calc(var(--vh) * 3.6));
    line-height: 130%;
  }
}

</style>

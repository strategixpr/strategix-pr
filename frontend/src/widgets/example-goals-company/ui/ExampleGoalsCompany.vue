<script setup lang="ts">
    import ExampleSectionTitle from '@/shared/ui/example-section-title';
    import ExampleList from '@/shared/ui/example-list';

    type ExampleGoalsCompanyData = {
      title?: string;
      list: string[];
    };

    defineProps<{
      data: ExampleGoalsCompanyData;
    }>();
</script>

<template>
  <section class="example-goals-company">
    <ExampleSectionTitle>
      {{ data.title ?? 'Цели компании' }}
    </ExampleSectionTitle>
    <ExampleList :list="data.list" />
  </section>
</template>

<style scoped>
.example-goals-company{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;
  background-color: var(--strategix-light);
  font-synthesis: none;

  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 2.5), 28px);

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 4), 36px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 4), 24px);
  }
}
</style>

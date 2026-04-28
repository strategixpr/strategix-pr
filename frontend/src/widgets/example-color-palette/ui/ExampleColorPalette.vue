<script setup lang="ts">
import { computed } from 'vue';
import IndexSectionTitle from '@/shared/ui/index-section-title';

type ColorBlock = {
  assignment?: string;
  colors: string[];
};

type ColorPaletteData = {
  title: string;
  'colors-blocks'?: ColorBlock[];
};

const { data } = defineProps<{
  data: ColorPaletteData;
}>();

const colorBlocks = computed(() => data['colors-blocks'] ?? []);

const normalizeColorValue = (value: string) => {
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) return 'transparent';
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

const formatColorValue = (value: string) => {
  const trimmed = value?.trim?.() ?? '';
  if (!trimmed) return '';
  return trimmed.replace(/^#/, '').toUpperCase();
};
</script>

<template>
  <section class="example-color-palette">
    <IndexSectionTitle>
      {{ data.title }}
    </IndexSectionTitle>

    <div class="palette-blocks">
      <article
        v-for="(block, blockIndex) in colorBlocks"
        :key="`palette-block-${blockIndex}`"
        class="palette-block"
      >
        <p
          v-if="block.assignment?.trim()"
          class="base-text palette-assignment"
        >
          {{ block.assignment }}
        </p>
        <ul class="palette-colors">
          <li
            v-for="(color, colorIndex) in block.colors"
            :key="`${color}-${colorIndex}`"
            class="palette-color"
          >
            <span
              class="color-swatch"
              :style="{ backgroundColor: normalizeColorValue(color) }"
              aria-hidden="true"
            />
            <span class="base-text color-code">
              / {{ formatColorValue(color) }}
            </span>
          </li>
        </ul>
      </article>
    </div>
  </section>
</template>

<style scoped>
.example-color-palette{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: 0;

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 7), 140px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 4), 40px);
  }
}

.palette-blocks{
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 4), 40px);
  
  @media(--tablet-width){
    gap: min(calc(var(--vh) * 7), 140px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 4), 40px);
  }
}

.palette-block{
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 3.5), 35px);

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 6), 80px);
  }
}

.palette-assignment{
  margin: 0;
  color: var(--strategix-gray);
  text-align: left;
  font-size: min(16px, 4.2vw);
  font-weight: 400;
  line-height: 140%;
  text-align: left;

  @media(--tablet-width){
    font-size: clamp(16px, 1.25vw, 32px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3.2));
  }
}

.palette-colors{
  width: 100%;
  list-style: none;
  padding: 0;
  margin: 0;

  column-gap: auto-fit;
  gap: min(12vw, 60px);

  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;

  @media(--tablet-width){
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    column-gap: clamp(48px, 6vw, 120px);
    row-gap: clamp(16px, 3vw, 32px);
  }

  @media(--big-laptop-width){
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.palette-color{
  min-width: 0;
  display: inline-flex;
  align-items: center;
  flex-direction: column;
  justify-content: start;
  justify-items: center;
  gap: min(var(--vh), 4px);

  @media(--tablet-width){
    display: grid;
    grid-template-columns: auto max-content;
    justify-items: start;
    column-gap: clamp(12px, 2.5vw, 20px);
    row-gap: 0;
  }
}

.color-swatch{
  width: min(85px, 21.795vw);
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  flex: 0 0 auto;

  @media(--tablet-width){
    width: clamp(100px, 8.325vw, 200px);
    /* height: clamp(100px, 8.325vw, 200px); */
  }
}

.color-code{
  margin: calc(var(--vh) * 2) 0 0;
  color: var(--strategix-dark);
  
  font-size: min(16px, 4.1vw);
  font-weight: 400;
  line-height: 120%;
  letter-spacing: 0.1vw;
  text-transform: uppercase;
  text-align: center;

  @media(--tablet-width){
    font-size: clamp(16px, 1.335vw, 32px);
    text-align: left;
    white-space: nowrap;
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 3.2));
  }
}

</style>

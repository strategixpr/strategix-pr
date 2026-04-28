<script setup lang="ts">
import { computed } from 'vue';
import { useHead, useRuntimeConfig } from '#imports';
import IndexSectionTitle from '@/shared/ui/index-section-title';

type TypographyFont = {
  name: string;
  description?: string;
  assignment?: string;
  font?: {
    src?: string;
    weight?: number;
    scale?: number;
  };
};

type TypographyData = {
  title: string;
  fonts?: TypographyFont[];
  primary?: TypographyFont[];
  secondary?: TypographyFont[];
};

const {data} = defineProps<{
  data: TypographyData;
}>();

const { app } = useRuntimeConfig();
const baseURL = app?.baseURL ?? '/';

const normalizeBase = (base: string) => {
  if (!base || base === '/') return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const normalizeFontSrc = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
  const base = normalizeBase(baseURL);
  if (trimmed.startsWith('/')) return `${base}${trimmed}`;
  return `${base}/${trimmed}`;
};

const getFontFormat = (src: string) => {
  const [hashless = ''] = src.split('#');
  const [clean = ''] = hashless.split('?');
  const ext = (clean.split('.').pop() ?? '').toLowerCase();
  if (!ext) return '';
  if (ext === 'woff2') return 'woff2';
  if (ext === 'woff') return 'woff';
  if (ext === 'ttf') return 'truetype';
  if (ext === 'otf') return 'opentype';
  return '';
};

const buildFontSrc = (rawSrc: string) => {
  const normalized = normalizeFontSrc(rawSrc);
  if (!normalized) return '';
  const format = getFontFormat(normalized);
  return format
    ? `url("${normalized}") format("${format}")`
    : `url("${normalized}")`;
};

const fonts = computed(() => {
  if (data.fonts?.length) return data.fonts;
  return [
    ...(data.primary ?? []),
    ...(data.secondary ?? []),
  ];
});

const getFontFamily = (index: number) => `example-typography-font-${index}`;

const fontFaceCss = computed(() => {
  const rules = fonts.value
    .map((font, index) => {
      const src = font.font?.src?.trim();
      if (!src) return '';
      const fontSrc = buildFontSrc(src);
      if (!fontSrc) return '';
  const weight = font.font?.weight ? `  font-weight: ${font.font.weight};\n` : '';
  return (
    `@font-face {\n` +
    `  font-family: "${getFontFamily(index)}";\n` +
    `  src: ${fontSrc};\n` +
    `  font-display: swap;\n` +
    `${weight}` +
    `}`
  );
})
    .filter(Boolean)
    .join('\n\n');

  return rules.length ? rules : null;
});

useHead(() => ({
  style: fontFaceCss.value
    ? [
      {
        key: 'example-typography-fonts',
        textContent: fontFaceCss.value,
      },
    ]
    : [],
}));

const getFontStyle = (font: TypographyFont, index: number) => {
  const src = font.font?.src?.trim();
  if (!src) return undefined;
  const weight = font.font?.weight ? String(font.font.weight) : undefined;
  const scale = font.font?.scale ? String(font.font.scale) : undefined;
  return {
    fontFamily: getFontFamily(index),
    fontWeight: weight,
    '--font-scale': scale,
  };
};

</script>

<template>
  <section class="example-typography">
    <IndexSectionTitle>
      {{ data.title }}
    </IndexSectionTitle>

    <div class="fonts-list">
      <article
        v-for="(font, index) in fonts"
        :key="`${font.name}-${index}`"
        class="font-row"
      >
        <div class="font-sample">
          <span
            class="sample-text"
            :style="getFontStyle(font, index)"
          >
            Aa
          </span>
        </div>
        <div class="base-text font-info">
          <p class="font-name-row">
            <span class="assignment">
              {{ font.assignment }}
            </span>
            <span
              class="font-line"
              aria-hidden="true"
            />
            <span class="font-name">
              {{ font.name }}
            </span>
          </p>
          <p
            v-if="font.description"
            class="font-description"
          >
            {{ font.description }}
          </p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.example-typography{
  width: var(--section-width);
  padding-inline: var(--padding-section-x);
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  gap: min(var(--vh), 40px);

  background-color: var(--strategix-light);
  font-synthesis: none;

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 7), 140px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 4), 40px);
  }
}

.fonts-list{
  display: flex;
  flex-direction: column;
  gap: calc(var(--vh) * 4);

  @media(--tablet-width){
    gap: min(calc(var(--vh) * 10), 160px);
  }
}

.font-row{
  display: grid;
  grid-template-rows: 1fr auto;
  column-gap: clamp(20px, 6vw, 96px);
  gap: calc(var(--vh) * 2.5);
  align-items: start;
 
  @media(--tablet-width){
    column-gap: clamp(24px, 6vw, 120px);
    /* gap: calc(var(--vh) * 2.5); */
  }

  @media(--mobile-medium){
    grid-template-columns: 1fr;
    row-gap: min(calc(var(--vh) * 2.5), 24px);
  }
}

.font-sample{
  display: flex;
  align-items: flex-start;
}

.sample-text{
  display: block;
  margin: 0;
  color: var(--strategix-dark);
  font-size: calc(29vw * var(--font-scale, 1));
  /* line-height: 0.85; */
  margin-bottom: calc(-10px * var(--font-scale, 0.5));
  line-height: 90%;
  letter-spacing: 10px;

  @media(--tablet-width){
    font-size: clamp(32px, calc(8vw * var(--font-scale, 1)), 500px);
  }

  @media(--mobile-medium){
    font-size: clamp(32px, calc(8vw * var(--font-scale, 1)), 500px);
  };
}


.font-info{
  display: flex;
  flex-direction: row;

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

.font-name-row{
  height: fit-content;
  display: flex;
  gap: clamp(10px, 2vw, 24px);
  margin: 0;

  color: var(--strategix-gray);

}

.font-line{
  display: inline-block;
  width: min(7vw, 96px);
  height: 1px;
  background-color: var(--strategix-dark);
  opacity: 0.7;

  margin: auto 0;
}

.assignment{
  margin: 0;
}

.font-name{
  margin: 0;
  text-wrap: nowrap;
  text-transform: uppercase;
}

.font-description{
  width: 100%;
  max-width: clamp(240px, 50vw, 560px);

  margin: 0 clamp(10px, 5vw, 200px) 0 auto;
  color: var(--strategix-gray);
  font-weight: 400;
  text-align: left;
  text-transform: none;

  display: none;

  @media(--tablet-width){
    display: block;
  }

  @media(--mobile-medium){
    margin: 0 3vw 0 auto;
    display: block;
  }
}
</style>

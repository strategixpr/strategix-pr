<script setup lang="ts">
import lineMdArrowUp from '@/assets/images/line-md_arrow-up.svg';
import arrowForwardInCircle from '@/assets/images/arrow-forward-in-circle.svg';

/**
 * styleButton:
 * base  - без обводки и фона иконки, текст и иконка белые, прозрачный фон.
 *         При hover текст и иконка зелёные.
 * green - обводка и фон иконки зелёные, текст белый, фон тёмный.
 *         При hover фон зелёный, фон иконки белый.
 * white - без обводки, фон иконки белый, белый текст и тёмный фон.
 *         При hover фон белый, текст и фон иконки зелёные.
 */
const props = withDefaults(
  defineProps<{
    styleButton?: 'base' | 'green' | 'white',
    href?: string,
    target?: string,
  }>(),
  {
    styleButton: 'base',
  },
);

const iconSrc = computed(() => {
  switch (props.styleButton) {
    case 'green':
      return lineMdArrowUp;
    case 'white':
      return lineMdArrowUp;
    case 'base':
    default:
      return arrowForwardInCircle;
  }
});
</script>

<template>
  <a
    class="button base-text"
    :class="props.styleButton"
    :href="props.href"
    :target="props.target"
  >
    <slot />&nbsp;&nbsp;
    <span class="icon">
      <NuxtImg
        :src="iconSrc"
        alt="icon-arrow"
        :width="24"
        :height="24"
        loading="lazy"
      />
    </span>
  </a>
</template>

<style scoped>
  .button {
    /* duration for all transitions in this component */
    --button-transition-duration: 0.3s;

    width: 100%;
    height: fit-content;
    padding: calc(var(--vh) * 2) 9% calc(var(--vh) * 2) 0;
    box-sizing: border-box;

    text-decoration: none;
    font-size: min(20px, 5.5vw);
    font-weight: 400;
    line-height: 110%;
    letter-spacing: 0;
    text-wrap: nowrap;

    justify-content: center;
    align-items: center;

    background: transparent;
    border-width: 2px !important; /* базовая ширина, но без стиля — обводки не видно */
    border-style: none;
    border-radius: 50px;

    color: var(--strategix-light);
    cursor: pointer;
    position: relative;

    transition: background-color var(--button-transition-duration), color var(--button-transition-duration), border var(--button-transition-duration);

    @media (--tablet-width) {
      width: fit-content;
      height: fit-content;

      font-size: clamp(12px, 1.05vw, 25px);
      border-width: 1px !important;
      padding: clamp(10px, 1vw, 24px) clamp(28px, 2.75vw, 65px)
        clamp(10px, 1vw, 24px) clamp(11px, 1.2vw, 28px);
    }

    @media (--big-laptop-width) {
      border-width: 2px !important;
    }

    @media (--mobile-medium) {
      border-width: 1px !important;
      font-size: min(12px, calc(var(--vh) * 3));

      padding: calc(var(--vh) * 2) calc(var(--vh) * 6) calc(var(--vh) * 2) calc(var(--vh) * 2);
    }
  }

  /* Круг с иконкой */
  .icon {
    width: auto;
    height: 94%;
    aspect-ratio: 1 / 1;

    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    top: 3%;
    right: 0.5%;

    border-radius: 50%;
    background-color: transparent;
  }

  /* Базовые размеры иконки */
  .icon img {
    width: auto;
    height: 40%;
    aspect-ratio: 1 / 1;
  }

  /* ----------------- base ----------------- */
  /* base: без обводки, прозрачный фон, белый текст и иконка */
  .base {
    background-color: transparent;
    border-style: none;
    color: var(--strategix-light);
  }

  .base .icon {
    background-color: transparent;
  }

  .base .icon img {
    transition: filter var(--button-transition-duration);
    height: 90%;
  }

  /* hover: текст и иконка зелёные */
  .base:hover {
    color: var(--strategix-accent);
  }

  /* фильтр подбирается под зелёный акцент */
  .base:hover .icon img {
    filter: invert(62%) sepia(39%) saturate(648%) hue-rotate(94deg)
      brightness(95%) contrast(92%);
  }

  /* ----------------- green ----------------- */
  /* green: обводка и фон иконки зелёные, текст белый, фон тёмный */
  .green {
    border-style: solid;
    border-color: var(--strategix-accent);
    background-color: var(--strategix-dark);
    color: var(--strategix-light);
  }

  .green .icon {
    background-color: var(--strategix-accent);
    
    transition: background-color var(--button-transition-duration);
  } 

  .green:hover .icon img{
    transition: filter var(--button-transition-duration);
    filter: invert(0);
  }

  /* hover: фон зелёный, фон иконки белый */
  .green:hover {
    background-color: var(--strategix-accent);
  }

  .green:hover .icon {
    background-color: var(--strategix-light);
  }

  /* инвертируем иконку для контраста на белом фоне */
  .green:hover .icon img {
    filter: invert(1);
  }

  /* ----------------- white ----------------- */
  /* white: без обводки, фон иконки белый, белый текст и тёмный фон */
  .white {
    border: none;
    background-color: var(--strategix-dark);
    color: var(--strategix-light);
  }

  /* иконка крупнее, на белом фоне */
  .white .icon {
    background-color: var(--strategix-light);
    transition: background-color var(--button-transition-duration);
  }

  .white .icon img {
    transition: filter var(--button-transition-duration);
    filter: invert(1);
  }

  /* hover: фон белый, текст и фон иконки зелёные */
  .white:hover {
    background-color: var(--strategix-light);
    color: var(--strategix-accent);
    border: none;
  }

  .white:hover .icon {
    background-color: var(--strategix-accent);
  }

  /* инверсия иконки, чтобы на зелёном фоне она читалась */
  .white:hover .icon img {
    filter: invert(0);
  }
</style>

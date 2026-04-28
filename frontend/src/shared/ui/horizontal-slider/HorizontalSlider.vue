<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

const listRef = ref<HTMLElement | null>(null);
const isAutoScrolling = ref(false);

let rafId: number | null = null;
let direction = 0;
let lastTs = 0;

const startScroll = (dir: number) => {
  direction = dir;
  if (rafId !== null) return;

  isAutoScrolling.value = true;
  lastTs = 0;

  const step = (ts: number) => {
    const list = listRef.value;
    if (!list) {
      rafId = null;
      return;
    }

    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    const speed = 1; // px per ms
    list.scrollLeft += direction * speed * dt;

    rafId = requestAnimationFrame(step);
  };

  rafId = requestAnimationFrame(step);
};

const stopScroll = () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  direction = 0;
  isAutoScrolling.value = false;
};

onBeforeUnmount(() => {
  stopScroll();
});
</script>

<template>
  <div class="horizontal-slider">
    <ul
      ref="listRef"
      class="horizontal-slider__list"
      :class="{ 'horizontal-slider__list--autoscroll': isAutoScrolling }"
    >
      <li
        class="horizontal-slider__spacer"
        aria-hidden="true"
      />

      <slot />

      <li
        class="horizontal-slider__spacer"
        aria-hidden="true"
      />
    </ul>

    <div
      class="horizontal-slider__hover-zone horizontal-slider__hover-zone--left"
      @mouseenter="startScroll(-1)"
      @mouseleave="stopScroll"
    />
    <div
      class="horizontal-slider__hover-zone horizontal-slider__hover-zone--right"
      @mouseenter="startScroll(1)"
      @mouseleave="stopScroll"
    />
  </div>
</template>

<style scoped>
.horizontal-slider {
  width: var(--slider-viewport-width, calc(100% + 2 * var(--padding-section-x)));
  height: var(--slider-viewport-height, auto);
  position: relative;
  margin: 0;
  overflow: hidden;
  transform: translateX(calc(-1 * var(--slider-offset-x, var(--padding-section-x))));
}

.horizontal-slider__list {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;

  margin: 0;
  padding: 0;

  display: flex;
  justify-content: flex-start;
  gap: var(--slider-gap, 1.25%);

  list-style: none;
  scrollbar-width: none;
  scroll-snap-type: var(--slider-scroll-snap-type, x mandatory);
}

.horizontal-slider__list::-webkit-scrollbar {
  display: none;
}

.horizontal-slider__list > * {
  scroll-snap-align: var(--slider-item-snap-align, center);
}

.horizontal-slider__list--autoscroll {
  scroll-snap-type: none;
}

.horizontal-slider__spacer {
  flex: 0 0 var(--slider-spacer-size, calc(var(--padding-section-x) - var(--slider-gap, 1.25%)));
  min-width: var(--slider-spacer-size, calc(var(--padding-section-x) - var(--slider-gap, 1.25%)));
  margin-left: var(--slider-spacer-margin-left, 0);
  pointer-events: none;
}

.horizontal-slider__hover-zone {
  display: var(--slider-hover-zone-display, block);
  position: absolute;
  top: 0;
  height: 100%;
  width: var(--slider-hover-zone-width, var(--padding-section-x));
  z-index: 2;
  background: transparent;
}

.horizontal-slider__hover-zone--left {
  left: 0;
}

.horizontal-slider__hover-zone--right {
  right: 0;
}
</style>

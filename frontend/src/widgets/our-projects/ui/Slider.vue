<script setup lang="ts">

</script>

<template>
  <div
    ref="root"
    class="slider"
  >
    <ul class="slider__list">
      <!-- Spacer, чтобы казалось, что у нас плошной слайдер -->
      <span class="slider__spacer" />

      <slot />

      <span class="slider__spacer" />
    </ul>
  </div>
</template>

<style scoped>
.slider {
	width: calc(100% + 2 * var(--padding-section-x));
  height: 84%;
	position: relative;
  margin: 0;
  overflow: hidden;
  transform: translateX(calc(-1 * var(--padding-section-x)));

  @media(--tablet-width){
    width: 100%;
    transform: none;
  }

  @media(--mobile-medium){
    width: 100%;
    transform: none;
  }
}

.slider__list {
	width: 100%;
  height: 100%;
	overflow-x: auto;

  margin: 0;
  padding: 0;

  display: flex;
  justify-content: space-between;
  gap: 1.25%;
	list-style: none;
	scrollbar-width: none;
	scroll-snap-type: x mandatory; /* центрируем элементы */
}

.slider__list::-webkit-scrollbar {
	/* Chrome/Safari */
	display: none;
}

.slider__list > * {
	scroll-snap-align: center;
}

.slider__spacer {
	min-width: calc(var(--padding-section-x) - 1.25%); /* padding у края*/
	pointer-events: none;

  @media(--tablet-width){
    min-width: 0;
    margin-left: -1.25%;
  }

  @media(--mobile-medium){
    min-width: 0;
    margin-left: -1.25%;
  }
}

</style>

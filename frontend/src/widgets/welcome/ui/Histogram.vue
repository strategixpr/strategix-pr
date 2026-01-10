<script setup lang="ts">
  const columns = [
    { height: '19', color: 'gray' },
    { height: '49', color: 'gray' },
    { height: '39', color: 'gray' },
    { height: '36', color: 'gray' },
    { height: '54', color: 'green' },
    { height: '65', color: 'green' },
    { height: '77', color: 'green' },
    { height: '70', color: 'green' },
    { height: '86', color: 'green' },
  ]

  const animate = ref(true)
  const hoveredColumnIndex = ref<number | null>(null)

  const clampValue = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max)

  const getHoveredHeight = (height: number) => {
    const delta = clampValue(((100 - height) * (100 - height)) / 200, 10, 32)
    return height + delta
  }

  const getDisplayValue = (height: string, isHovered: boolean) => {
    const baseHeight = Number(height)
    const targetHeight = isHovered ? getHoveredHeight(baseHeight) : baseHeight

    return Math.floor(targetHeight * 15.78)
  }

  onMounted(() => {
    setTimeout(() => {
      animate.value = false
    }, 1000)
  })
</script>

<template>
  <div class="histogram">
    <div class="columns">
      <div
        v-for="(column, index) in columns"
        :key="index"
        class="column"
        :class="`column.color`"
      >
        <p class="small-text bar-text">
          {{ getDisplayValue(column.height, hoveredColumnIndex === index) }}
        </p>
        <div
          class="bar-column"
          :class="[column.color, { animate }]"
          :style="{ '--h': column.height + '%' }"
          @mouseenter="hoveredColumnIndex = index"
          @mouseleave="hoveredColumnIndex = null"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .histogram {
    width: 35%;
    height: 100%;
    box-sizing: border-box;
    color: white;
    opacity: 1;

    display: none;

    @media(--tablet-width){
        width: 40%;
        display: flex;
    }

    @media(--laptop-width){
        width: 40%;
    }
 }

 .columns {
    width: auto;
    height: auto;
    margin: var(--welcome-padding-top) min(1vw, 75px) var(--welcome-padding-bottom) auto;

    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;

    gap: clamp(5px, 0.6vw, 30px);

    --base-duration: 0.75s;
    --bar-glow-color: color-mix(in srgb, var(--strategix-accent) 60%, var(--strategix-dark) 40%);
  }

 .column {
    width: clamp(20px, 4vw, 80px);
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;

    @media(--laptop-width){
      width: clamp(20px, 3.25vw, 80px);
    }

    @media(--mobile-medium){
      width: clamp(20px, 3.25vw, 80px);
    }
  }

  .column:nth-child(2){
    display: none;
    
    @media(--laptop-width){
      display: flex;
    }

    @media(--mobile-medium){
      display: flex;
    }
  }

  .column:nth-child(8){
    display: none;

    @media(--laptop-width){
      display: flex;
    }

    @media(--mobile-medium){
      display: flex;
    }
  }

  .bar-text {
      width: 100%;
      margin: 0;
      margin-bottom: calc(var(--vh) * 1);
      font-weight: 300;
      text-align: center;

      z-index: 3;
  }

  .bar-column {
      width: 100%;
      height: var(--h);
      border-radius: calc(var(--card-radius) / 2);

      transition: height 0.25s ease-in-out;
  }

  .bar-column:hover{
    height: calc(var(--h) + clamp(10%, ((100% - var(--h)) * (100% - var(--h)) / 200%), 32%));
  }

  /* анимация только когда есть класс */
  .animate {
    animation-name: wobble-height, bar-glow;
    animation-timing-function: ease-out;
    animation-iteration-count: 1;
    animation-fill-mode: forwards;
  }

  /* разная длительность для каждого столбца */
  .columns .column:nth-child(1) .bar-column { animation-duration: calc(var(--base-duration) + 0.45s); }
  .columns .column:nth-child(2) .bar-column { animation-duration: calc(var(--base-duration) + 0.325s); }
  .columns .column:nth-child(3) .bar-column { animation-duration: calc(var(--base-duration) + 0.425s); }
  .columns .column:nth-child(4) .bar-column { animation-duration: calc(var(--base-duration) + 0.45s); }
  .columns .column:nth-child(5) .bar-column { animation-duration: calc(var(--base-duration) + 0.3s); }
  .columns .column:nth-child(6) .bar-column { animation-duration: calc(var(--base-duration) + 0.2s); }
  .columns .column:nth-child(7) .bar-column { animation-duration: calc(var(--base-duration) + 0.15s); }
  .columns .column:nth-child(8) .bar-column { animation-duration: calc(var(--base-duration) + 0.175s); }
  .columns .column:nth-child(9) .bar-column { animation-duration: calc(var(--base-duration) + 0.1s); }

  .gray {
      background-color: var(--strategix-gray);
  }

  .green {
      background-color: var(--strategix-accent);
  }

  @keyframes wobble-height {
    0% {
      height: 0;   /* 0% */
    }
    40% {
      height: 100%;   /* 100% */
    }
    60% {
      height: calc(var(--h) * 1.05);   /* 105% */
    }
    70% {
      height: calc(var(--h) * 0.95);   /* 95% */
    }
    80% {
      height: calc(var(--h) * 1.025);  /* 102.5% */
    }
    90% {
      height: calc(var(--h) * 0.975);  /* 97.5% */
    }
    100% {
      height: var(--h);               /* 100%*/
    }
  }

  @keyframes bar-glow {
    0% {
      box-shadow: 0 0 0 0 var(--bar-glow-color);
    }
    15% {
      box-shadow: 0 calc(var(--vh) * -25) var(--bar-glow-color);
    }
    40% {
      box-shadow: 0 0 var(--bar-glow-color);
    }
    60% {
      box-shadow: 0 calc(var(--vh) * -3) var(--bar-glow-color);
    }
    70% {
      box-shadow: 0 0 var(--bar-glow-color);
    }
    100% {
      box-shadow: 0 0 var(--bar-glow-color);
    }
  }
</style>

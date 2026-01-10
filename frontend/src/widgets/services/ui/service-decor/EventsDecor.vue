<template>
  <div class="events__decor">
    <div class="events__decor__quarter-square" />
    <div class="events__decor__quarter-square" />
    <div class="events__decor__quarter-square" />
    <div class="events__decor__quarter-square" />
  </div>
</template>

<style>
.events__decor {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0;
}

.events__decor__quarter-square{
  width: 94.12%;
  height: 94.12%;

  margin: auto;

  /* animation: media-anim 2s infinite ease-in-out; /* запускается в ServiceCard.vue */
}

.events__decor__quarter-square:nth-child(1){
  grid-column: 1;
  grid-row: 1;
  
  background-color: var(--strategix-accent-light);
}

.events__decor__quarter-square:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
  
  background-color: var(--strategix-accent);

  animation-delay: 0.5s !important;
}

.events__decor__quarter-square:nth-child(3){
  grid-column: 1;
  grid-row: 2;

  background-color: var(--strategix-accent);

  animation-delay: 1.5s !important;
}

.events__decor__quarter-square:nth-child(4){
  grid-column: 2;
  grid-row: 2;

  background-color: var(--strategix-accent-light);

  animation-delay: 1s !important;
}

@keyframes events-anim {
  0%{
    background-color: var(--strategix-accent-light);
  }

  50%{
    background-color: var(--strategix-accent);
  }

  100%{
    background-color: var(--strategix-accent);
  }
}
</style>

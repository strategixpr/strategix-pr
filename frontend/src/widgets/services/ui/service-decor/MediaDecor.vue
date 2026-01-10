<template>
  <div class="media__decor">
    <div class="media__decor__dot" />
    <div class="media__decor__dot" />
    <div class="media__decor__dot" />
    <div class="media__decor__dot" />
  </div>
</template>

<style>
.media__decor {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0;
}

.media__decor__dot{
  width: 100%;
  height: 100%;

  margin: auto;

  background-color: var(--strategix-accent);
  border-radius: 50%;

  /* animation: media-anim 2s infinite ease-in-out; /* запускается в ServiceCard.vue */
}

.media__decor__dot:nth-child(1){
  grid-column: 2;
  grid-row: 1;

  animation-delay: 0.5s !important;
}

.media__decor__dot:nth-child(2) {
  grid-column: 1;
  grid-row: 2;
  background-color: var(--strategix-accent-light);
}

.media__decor__dot:nth-child(3){
  grid-column: 3;
  grid-row: 2;
  background-color: var(--strategix-accent-light);

  animation-delay: 1s !important;
}

.media__decor__dot:nth-child(4){
  grid-column: 2;
  grid-row: 3;

  animation-delay: 1.5s !important;
}

@keyframes media-anim {
  0%{
    width: 100%;
    height: 100%;
    background-color: var(--strategix-light);
  }

  50%{
    width: 50%;
    height: 50%;
    background-color: var(--strategix-accent-light);
  }

  100%{
    width: 100%;
    height: 100%;
    background-color: var(--strategix-light);
  }
}
</style>

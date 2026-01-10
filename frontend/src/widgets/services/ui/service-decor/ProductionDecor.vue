<template>
  <div class="production__decor">
    <div class="production__decor__quarter-circle" />
    <div class="production__decor__quarter-circle" />
    <div class="production__decor__quarter-circle" />
    <div class="production__decor__quarter-circle" />
  </div>
</template>

<style>
.production__decor {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  gap: 0;
}

.production__decor__quarter-circle{
  width: 100%;
  height: 100%;

  margin: auto;

  /* animation: media-anim 2s infinite ease-in-out; /* запускается в ServiceCard.vue */
}

.production__decor__quarter-circle:nth-child(1){
  grid-column: 1;
  grid-row: 1;
  
  border-radius: 100% 0 0 0;
  background-color: var(--strategix-accent-light);
}

.production__decor__quarter-circle:nth-child(2) {
  grid-column: 2;
  grid-row: 1;
  
  border-radius: 0 100% 0 0;
  background-color: var(--strategix-accent);

  animation-delay: 0.5s !important;
}

.production__decor__quarter-circle:nth-child(3){
  grid-column: 1;
  grid-row: 2;

  border-radius: 0 0 0 100%;
  background-color: var(--strategix-accent);

  animation-delay: 1.5s !important;
}

.production__decor__quarter-circle:nth-child(4){
  grid-column: 2;
  grid-row: 2;

  border-radius: 0 0 100% 0;
  background-color: var(--strategix-accent-light);

  animation-delay: 1s !important;
}

@keyframes production-anim {
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
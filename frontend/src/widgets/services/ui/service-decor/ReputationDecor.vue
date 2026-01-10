<template>
  <div class="reputation__decor">
    <div class="reputation__decor__column" />
    <div class="reputation__decor__column" />
    <div class="reputation__decor__column" />
  </div>
</template>

<style>
.reputation__decor {
  width: 100%;
  height: auto;
  aspect-ratio: 28 / 36;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20%;
}

.reputation__decor__column {
  width: 100%;
  height: 100%;
  background-color: var(--strategix-accent);
  border-radius: 5px;

  align-self: center;

  /* animation: point 3s infinite; /* запускается в ServiceCard.vue */
}

.reputation__decor__column:nth-child(1){
  background-color: var(--strategix-accent-light);
}

.reputation__decor__column:nth-child(2) {
  height: 15%;
  animation-delay: 0.25s !important;
  /* animation-direction: alternate-reverse !important; */
}

.reputation__decor__column:nth-child(3){
  background-color: var(--strategix-accent-light);
  animation-delay: 0.5s !important;
}

@keyframes reputation-anim {
  0%{
    height: 100%;
    background-color: var(--strategix-accent-light);
  }

  25%{
    height: 15%;
    background-color: var(--strategix-light);
  }

  75%{
    height: 15%;
    background-color: var(--strategix-light);
  }

  100%{
    height: 100%;
    background-color: var(--strategix-accent-light);
  }
}
</style>

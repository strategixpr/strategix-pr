<template>
  <div class="ai-marketing__decor">
    <div class="ai-marketing__decor__dot" />
    <div class="ai-marketing__decor__dot" />
    <div class="ai-marketing__decor__dot" />
  </div>
</template>

<style>
.ai-marketing__decor {
  width: 100%;
  height: auto;
  aspect-ratio: 2 / 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16.75%;
}

.ai-marketing__decor__dot {
  width: 100%;
  height: auto;

  aspect-ratio: 1 / 1;

  background-color: var(--strategix-accent);
  border-radius: 100%;

  align-self: center;

  transform: all 0.3s ease-in-out;

  /* animation: ai-marketing-anim 3s infinite; /* запускается в ServiceCard.vue */
}

.ai-marketing__decor__dot:nth-child(1){
  background-color: var(--strategix-accent-light);
}

.ai-marketing__decor__dot:nth-child(2) {
  transform: scale(1.5);
  animation-delay: 0.25s !important;
}

.ai-marketing__decor__dot:nth-child(3){
  background-color: var(--strategix-accent-light);
  animation-delay: 0.5s !important;
}

@keyframes ai-marketing-anim {
  0%{
    transform: translateY(0);
    background-color: var(--strategix-accent-light);
  }

  50%{
    transform: translateY(-110%);
    background-color: var(--strategix-light);
  }

  100%{
    transform: translateY(0);
    margin-bottom: 0;
    background-color: var(--strategix-accent-light);
  }
}
</style>

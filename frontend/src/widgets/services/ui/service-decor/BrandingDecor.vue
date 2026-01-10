<template>
  <div class="branding__decor">
    <div class="branding__decor__square" />
  </div>
</template>

<style>
.branding__decor {
  width: 100;
  height: auto;
  aspect-ratio: 1 / 1;

  display: flex;
  justify-content: center;
  align-items: center;

  /* animation: branding-anim 2s infinite ease-in-out; /* запускается в ServiceCard.vue */
}

.branding__decor__square{
  width: 70.71%; /* 100% / √2 ≈ 70.71%*/
  height: 70.71%;

  transform: rotate(45deg);

  background-color: var(--strategix-accent);
}

@keyframes branding-anim {
  0%{
    transform: rotate(0);
  }

  100%{
    transform: rotate(360deg);
  }
}
</style>

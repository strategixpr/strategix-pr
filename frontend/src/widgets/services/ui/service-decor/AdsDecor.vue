<template>
  <div class="ads__decor">
    <div class="ads__decor__circle" />
    <div class="ads__decor__orbit">
      <div class="ads__decor__point" />
    </div>
  </div>
</template>

<style>
.ads__decor {
  width: 100%;
  height: auto;
  aspect-ratio: 1 / 1;
  position: relative;

  transition: all 0.3s ease-in-out;
}

.ads__decor__circle{
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  border: 1.5px solid var(--strategix-accent);
  border-radius: 100%;

  background-color: transparent;
  
  transition: all 0.3s ease-in-out;
}

/* орбита — на весь блок, центр в середине */
.ads__decor__orbit {
  width: 100%;
  height: 100%;
  position: absolute;
  inset: 0;

  /* animation: ads-anim 2s infinite linear; /* запускается в ServiceCard.vue */
}

/* точка внизу по центру орбиты */
.ads__decor__point{
  width: 33.25%;
  height: 33.25%;

  position: absolute;
  left: 50%;
  bottom: 1.5px;
  transform: translateX(-50%);

  border-radius: 100%;
  background-color: var(--strategix-accent);

  transition: all 0.3s ease-in-out;
}

@keyframes ads-anim {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

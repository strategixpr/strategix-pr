<script setup lang="ts">
const {src, name, lastname, position} = defineProps<{src: string, name: string, lastname: string, position: string}>()
</script>

<template>
  <article class="member-card">
    <NuxtImg
      class="image-card"
      :src="src"
      sizes="(max-width: 767px) 170px, (max-width: 1023px) 25vw, 25vw"
      format="webp"
      :quality="70"
      :alt="`${name} ${lastname}`"
      loading="lazy"
      :width="600"
      :height="600"
    />
    <div class="text-background">
      <h4 class="small-text name">
        {{ name }} {{ lastname }}
      </h4>
      <p class="small-text position">
        {{ position }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.member-card{
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: var(--card-radius);

    position: relative;
}

.image-card{
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
}

.text-background{
    width: 85%;
    height: fit-content;
    /* height: 18%; */

    position: absolute;
    bottom: 16%;
    left: 50%;
    transform: translateX(-50%) translateY(50%);

    display: flex;
    flex-direction: column;
    justify-content: space-around;

    border-radius: calc(var(--card-radius) / 2.5);
    background-color: white;
}

.name{
    margin: 2.5% 4% 0;

    font-size: min(12px, calc(1.2vw + var(--vh) * 0.8));
    line-height: 110%;
    font-weight: 600;
    text-align: left;

    color: var(--strategix-dark);

    @media(--tablet-width){
      font-size: clamp(12px, calc(0.9vw + var(--vh) * 0.5), 30px);
    }

    @media(--mobile-medium) {
      font-size: min(12px, calc(var(--vh) * 2.5));
    }
}

.position{
    margin: 0 4% 2.5%;

    font-size: min(12px, calc(1.2vw + var(--vh) * 0.8));
    line-height: 110%;
    font-weight: 600;
    text-align: left;

    color: var(--strategix-gray);

    @media(--tablet-width){
      font-size: clamp(10px, calc(0.9vw + var(--vh) * 0.5), 30px);
    }

    @media(--mobile-medium) {
      font-size: min(12px, calc(var(--vh) * 2.5));
    }
}

</style>

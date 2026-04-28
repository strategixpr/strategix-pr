<script setup lang="ts">
  const props = defineProps({
    list: {
      type: Array as () => Array<string>,
      required: true,
    },
    isWhite: {
      type: Boolean,
      default: false,
    },
  })
</script>

<template>
  <ul
    class="list"
  >
    <li
      v-for="(content, index) in list"
      :key="content"
      class="item base-text"
      :class="{ 'white': isWhite }"
    >
      <span :class="`number ${isWhite ? 'white' : ''}`">{{ index + 1 }}</span> {{ content }}
    </li>
  </ul>
</template>

<style scoped>
.list{
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;
  flex-direction: column;
  gap: clamp(12px, calc(var(--vh) * 2), 20px);

  @media(--tablet-width){
    gap: clamp(16px, calc(var(--vh) * 3), 24px);
  }

  @media(--mobile-medium){
    gap: min(calc(var(--vh) * 2), 12px);
  }
}

.item{
  margin: 0;
  display: flex;
  align-items: center;
  align-items: baseline;
  gap: clamp(10px, 2.6vw, 16px);

  font-size: min(18px, 4.5vw);
  font-weight: 400;
  line-height: 140%;
  letter-spacing: 0;
  text-align: left;

  @media(--tablet-width){
    font-size: clamp(16px, 1vw, 32px);
    gap: clamp(10px, 1vw, 20px);
    line-height: 145%;
  }

  @media(--mobile-medium){
    font-size: min(16px, calc(var(--vh) * 3.8));
    gap: min(3.6vw, 14px);
  }
}

.item.white{
  color: var(--strategix-light);
}

.number{
  display: inline-flex;
  justify-content: center;
  align-items: center;

  width: clamp(22px, 2.2vw, 30px);
  height: clamp(22px, 2.2vw, 30px);
  aspect-ratio: 1 / 1;

  background-color: transparent;
  border: solid clamp(1px, 0.12vw, 2px) var(--strategix-dark);
  border-radius: 50%;

  text-align: center;

  @media(--tablet-width){
    width: clamp(24px, 2vw, 32px);
    height: clamp(24px, 2vw, 32px);
  }

  @media(--mobile-medium){
    width: min(calc(var(--vh) * 3.5 + 2vw), 28px);
    height: min(calc(var(--vh) * 3.5 + 2vw), 28px);
  }
}

.number.white{
  border-color: var(--strategix-light);
  background-color: var(--strategix-light);
  color: var(--strategix-accent);
}
</style>

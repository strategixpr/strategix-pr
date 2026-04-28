<script setup lang="ts">
  const {
    categories,
    activeCategory = null,
    isEnabled = true,
  } = defineProps<{
    categories: string[]
    activeCategory?: string | null
    isEnabled?: boolean
  }>()

  const emit = defineEmits<{
    (e: 'select', category: string): void
  }>()

  const onCategoryClick = (category: string) => {
    if (!isEnabled) return

    emit('select', category)
  }
</script>

<template>
  <ul
    class="projects-filters"
    aria-label="Фильтр проектов"
  >
    <li
      v-for="(category) in categories"
      :key="category"
      class="filter-item"
    >
      <button 
        type="button" 
        class="item"
        :class="{'disabled': !isEnabled, 'enabled': isEnabled, 'active': category === activeCategory || activeCategory === categories[0]}"
        :disabled="!isEnabled"
        :aria-pressed="category === activeCategory"
        @click="onCategoryClick(category)"
      >
        {{ category }}
      </button>
    </li>
  </ul>
</template>

<style scoped>
.projects-filters{
    width: 100%;
    height: fit-content;

    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    list-style-type: none;
    gap: min(10px, 2.5vw);
    padding-inline-start: 0;
    margin-block-start: 0;
    margin-block-end: 0;

    margin: 0 0 min(20px, calc(var(--vh) * 1.5));

    @media(--tablet-width){
      margin: 0 0 min(60px, calc(var(--vh) * 3.5));
    }

    @media(--mobile-width){
      gap: clamp(10px, 1.5%, 40px);
    }
}

.filter-item{
    width: fit-content;
    height: fit-content;
    padding: 0;
    padding-inline-start: 0;
    margin-block-start: 0;
    margin-block-end: 0;
}

.item{
    border: 0;
    color: black;
    background-color: white;
    /* padding: 10px 13px; */
    padding: clamp(9px, 0.75vw, 18px) clamp(12px, 0.916vw, 22px);
    border-radius: 50px;

    /* text-decoration: none; */
    font-family: "Liberty-MT", "Onest", Arial, sans-serif;
    font-size: clamp(15px, 1.334vw, 36px);
    line-height: 110%;
    font-weight: 400;
    font-synthesis: none;
    letter-spacing: 0;
    opacity: 0.5;

    display: inline-flex;
    text-wrap: none;
    text-align: center;    
    align-items: center;       /* вертикальное выравнивание по центру */
    justify-content: center;   /* горизонтальное выравнивание внутри кнопки/тэга */

    transition: all 0.2s ease-in;

    @media(--mobile-medium){
        font-size: min(15px, calc(var(--vh) * 3.35));
        padding: calc(var(--vh) * 2) 1vw;
    }
}

.disabled{
    opacity: 1 !important;
}

.enabled{
    opacity: 0.5;
}

.enabled:hover{
    cursor: pointer;
    background-color: var(--strategix-accent);
    color: var(--strategix-light);
    opacity: 1;
}

.active{
    opacity: 1 !important;
}
</style>

<script setup lang="ts">
    const {navData} = defineProps<{
            navData: {
                links: { href: string; label: string }[]
            }
        }>()
</script>

<template>
  <nav class="navigation">
    <ul>
      <li
        v-for="(link, index) in navData.links"
        :key="index"
      >
        <a
          :href="link.href"
          class="small-text hover"
        >{{ link.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
  .navigation{
    width: min(370px, 40vw);
    height: fit-content;

    display: none;

    @media(--tablet-width){
      display: inline;
      width: clamp(300px, 31vw, 780px);
    }

    @media(--mobile-medium){
      display: inline;
    }
    
    @media(width <= 768px){
      display: none;
    }
  }

  .navigation ul{
    list-style: none;
    
    margin: 0;
    padding: 0;

    display: flex;
    justify-content: space-between;
    flex-direction: row;
    align-items: center;
  }

  .navigation ul li a{
    text-decoration: none;
    color: white;
    text-wrap: nowrap;
  }
</style>

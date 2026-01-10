<script setup lang="ts">
import Contacts from './Contacts.vue';
import Form from './Form.vue';
</script>

<template>
  <section class="leave-request">
    <Contacts />
    <Form />
  </section>
</template>

<style scped>
.leave-request {
    width: var(--section-width);
    min-height: calc(var(--vh) * 100);
    height: fit-content;
    padding: 0;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    flex-wrap: wrap;

    background-color: var(--strategix-accent);

    @media(--tablet-width){
        min-height: calc(var(--vh) * 90);
        height: calc(var(--vh) * 90);
        flex-direction: row;
        flex-wrap: nowrap;
    }
    
    @media(--mobile-medium){
      min-height: calc(var(--vh) * 105);
      height: calc(var(--vh) * 105);
      height: max(calc(var(--vh) * 105), calc(320px + var(--vh) * 10));
    }
}
</style>

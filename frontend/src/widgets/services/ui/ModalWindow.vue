<script setup lang="ts">
const { id } = defineProps<{ id: string }>();
</script>

<template>
  <dialog
    :id="id"
    class="modal"
    closedby="any"
  >
    <!-- "Фон", клика по которому закрывает диалог -->
    <form
      method="dialog"
      class="modal__backdrop-form"
    >
      <button
        type="submit"
        class="modal__backdrop-button"
        aria-label="Закрыть модальное окно по клику на фон"
      />
    </form>

    <div class="modal__window">
      <slot />
    </div>
  </dialog>
</template>


<style>
  /* Блокировка скролла сайта, когда модалка открыта */
  body:has(dialog.modal[open]) {
    overflow: hidden;
  }
</style>

<style scoped>
.modal {
  width: var(--section-width);
  height: calc(var(--vh) * 100);

  /* убираем чёрную стандартную рамку/фон */
  border: none;
  outline: none;
  padding: 0;
  background: transparent;
}

/* форма-фон, растянутая на весь экран */
.modal__backdrop-form {
  position: fixed;
  inset: 0; /* top:0; right:0; bottom:0; left:0; */
  margin: 0;
  padding: 0;
}

.modal__backdrop-button {
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;
  margin: 0;
  /* cursor: pointer; */

  background: rgba(0, 0, 0, 0.6);
}


.modal__window {
  width: calc(var(--section-width) - 2 * var(--padding-section-x));
  height: auto;
  max-height: calc(var(--vh) * 86);
  overflow-y: auto;
  scrollbar-width: none;

  position: fixed;
  left: var(--padding-section-x);
  right: var(--padding-section-x);
  top: calc(clamp(18px, 2vw, 48px) + min(40px, var(--vh) * 4)); /*Рассчет идет исходя из margin-bottom IndexSectionTitle.vue и padding-bottom у Services.vue */
  
  /* margin: calc(clamp(18px, 2vw, 48px) + min(40px, 4vh)) var(--padding-section-x) 10vh;  */

  animation: modal-fly-in 0.3s ease-in-out;

  @media(--tablet-width){
    /* height: calc(100vh - (clamp(14px, 2.25vw, 52px) + clamp(40px, 5vh, 80px)) - 10vh);*/
    top: calc(clamp(14px, 2.25vw, 52px) + clamp(40px, var(--vh) * 5, 80px));
    /* top: 50%; */
    /* transform: translateY(-50%); */
  }

  @media(--mobile-medium){
    height: calc(var(--vh) * 100 - clamp(40px, var(--vh) * 5, 80px) - var(--vh) * 10);
    top: clamp(40px, var(--vh) * 5, 80px);
  }
}


/* анимация "влёта" */
@keyframes modal-fly-in {
  0% {
    filter: blur(2px);
    transform: scale(0.98);
  }

  100% {
    filter: blur(0);
    transform: scale(1);
  }
}
</style>

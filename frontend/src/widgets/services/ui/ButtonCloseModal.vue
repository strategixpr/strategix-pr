<template>
  <form
    method="dialog"
    class="button-close-modal"
  >
    <button
      type="submit"
      aria-label="Закрыть модальное окно"
    />
  </form>
</template>

<style scoped>
.button-close-modal {
  width: min(5vw, 20px);
  height: min(5vw, 20px);
  box-sizing: border-box;
  position: absolute;
  top: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);
  right: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);
  background: transparent;
  border: 1px solid white;
  border-top: 1px;
  border-right: 1px;
  z-index: 5;
}

.button-close-modal::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5px;
  width: 141%;
  height: 1px;
  background-color: white;
  transform-origin: left bottom;
  transform: rotate(-45deg);

  z-index: -1;
}

.button-close-modal button {
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
}

@media(--tablet-width) {
  .button-close-modal {
    width: clamp(20px, 2.5vw, 60px);
    height: clamp(20px, 2.5vw, 60px);
    border: 2px solid white;
    border-top: 2px;
    border-right: 2px;
  }
  .button-close-modal::after {
    width: 135%;
    height: 2px;
  }
}

@media(--mobile-medium) {
  .button-close-modal {
    width: min(calc(var(--vh) * 4.1675), 20px);
    height: min(calc(var(--vh) * 4.1675), 20px);
  }
}
</style>

<!-- .icon-arrow{
  width: min(5vw, 20px);
  height: min(5vw, 20px);
  box-sizing: border-box;

  position: absolute;
  top: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);
  right: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);

  background: transparent;
  border: 1px solid white;
  border-top: 1px;
  border-right: 1px;

  z-index: 5;

  @media(--tablet-width){
    width: clamp(20px, 2.5vw, 60px);
    height: clamp(20px, 2.5vw, 60px);
    border: 2px solid white;
    border-top: 2px;
    border-right: 2px;
  }

  @media(--mobile-medium){
    width: min(calc(var(--vh) * 4.1675), 20px);
    height: min(calc(var(--vh) * 4.1675), 20px);
  }
}

.icon-arrow::after{
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5px;

  /* длина линии чуть больше диагонали квадрата: √2 ≈ 1.414 */
  width: 141%;
  height: 1px;

  background-color: white;

  transform-origin: left bottom;
  transform: rotate(-45deg);

  @media(--tablet-width){
    width: 135%;
    height: 2px;
  }
}

.icon-arrow button{
  width: 100%;
  height: 100%;
  padding: 0;
  margin: 0;

  /* новое — чтобы не было дефолтного вида кнопки */
  border: 0;
  background: transparent;
  cursor: pointer;
  outline: none;
} -->

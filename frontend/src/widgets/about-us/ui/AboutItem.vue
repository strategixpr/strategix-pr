<script setup lang="ts">
  import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
  import plusIconUrl from "@/assets/images/plus-icon.svg";
  
  const props = defineProps({
    title: { type: String, required: true },
    subtitle: { type: String, required: false, default: "" },
    content: { type: String, required: false, default: "" },
  });
  
  const isOpen = ref(false);
  const bodyEl = ref<HTMLElement | null>(null);
  const ro = ref<ResizeObserver | null>(null);
  
  function measureAndAnimate(open: boolean) {
    const el = bodyEl.value;
    if (!el) return;
  
    // Во время анимации используем height, чтобы получить реальное "раскрытие"
    el.style.willChange = "height, opacity, margin-top";
    el.style.overflow = "hidden";
  
    const target = open ? el.scrollHeight : 0;
  
    // “пружина”: сначала чуть перелёт, потом возврат (двухфазная анимация)
    // Перелёт делаем только при открытии
    const overshoot = open ? Math.round(target * 1.06) : 0;
  
    // Сброс предыдущих transition, чтобы корректно применить новую последовательность
    el.style.transition = "none";
  
    // Текущее значение height берём с вычисленного стиля, чтобы корректно анимировать из середины
    const current = parseFloat(getComputedStyle(el).height);
    el.style.height = `${isNaN(current) ? 0 : current}px`;
  
    // форсируем reflow
    void el.offsetHeight;
  
    if (open) {
      el.style.opacity = "1";
      el.style.marginTop = "min(13px, calc(var(--vh) * 1.5))";
  
      // Фаза 1 — быстрый разгон до overshoot
      el.style.transition =
        "height 320ms cubic-bezier(0.22, 1.4, 0.36, 1), opacity 220ms ease, margin-top 320ms ease";
      el.style.height = `${overshoot}px`;
  
      // Фаза 2 — мягкий возврат на точную высоту контента
      const t1 = window.setTimeout(() => {
        if (!bodyEl.value) return;
        bodyEl.value.style.transition = "height 180ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        bodyEl.value.style.height = `${target}px`;
      }, 320);
  
      // После завершения — ставим height:auto, чтобы контент мог меняться (и не ломался layout)
      const t2 = window.setTimeout(() => {
        if (!bodyEl.value || !isOpen.value) return;
        bodyEl.value.style.height = "auto";
        bodyEl.value.style.overflow = "visible";
        bodyEl.value.style.willChange = "auto";
      }, 320 + 180);
  
      // чтобы TypeScript не ругался на “висящие” таймеры — можно хранить/чистить, но обычно не критично
      void t1; void t2;
    } else {
      // При закрытии сначала фиксируем текущую реальную высоту (если была auto)
      const real = el.scrollHeight;
      el.style.height = `${real}px`;
      void el.offsetHeight;
  
      el.style.transition =
        "height 260ms cubic-bezier(0.4, 0, 0.2, 1), opacity 180ms ease, margin-top 260ms ease";
      el.style.height = "0px";
      el.style.opacity = "0";
      el.style.marginTop = "0px";
  
      const t = window.setTimeout(() => {
        if (!bodyEl.value || isOpen.value) return;
        bodyEl.value.style.overflow = "hidden";
        bodyEl.value.style.willChange = "auto";
      }, 260);
      void t;
    }
  }
  
  function toggle() {
    isOpen.value = !isOpen.value;
  }
  
  function onKeydown(e: KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  }
  
  watch(isOpen, async (v) => {
    await nextTick();
    measureAndAnimate(v);
  });
  
  onMounted(() => {
    // Если контент внутри может меняться (например, responsive переносы/шрифты),
    // ResizeObserver будет подправлять высоту во время открытого состояния
    if ("ResizeObserver" in window && bodyEl.value) {
      ro.value = new ResizeObserver(() => {
        if (!isOpen.value || !bodyEl.value) return;
        // если height:auto — ничего не нужно; если идёт анимация height — подстроим
        if (getComputedStyle(bodyEl.value).height !== "auto") {
          bodyEl.value.style.height = `${bodyEl.value.scrollHeight}px`;
        }
      });
      ro.value.observe(bodyEl.value);
    }
  
    // Инициализация закрытого состояния
    if (bodyEl.value) {
      bodyEl.value.style.height = "0px";
      bodyEl.value.style.opacity = "0";
      bodyEl.value.style.marginTop = "0px";
      bodyEl.value.style.overflow = "hidden";
    }
  });
  
  onBeforeUnmount(() => {
    ro.value?.disconnect();
  });
  </script>
  
<template>
  <div
    class="about-item"
    :class="{ open: isOpen }"
  >
    <!-- заменили summary на обычную кнопку/заголовок -->
    <button
      class="about-summary"
      type="button"
      :aria-expanded="isOpen"
      @click="toggle"
      @keydown="onKeydown"
    >
      <span class="base-text about-title">{{ title }}</span>
  
      <span
        class="base-text about-subtitle"
        aria-hidden="true"
      >
        {{ subtitle }}
      </span>
  
      <span
        class="about-icon"
        aria-hidden="true"
      >
        <NuxtImg
          :src="plusIconUrl"
          :width="20"
          :height="20"
          loading="lazy"
        />
      </span>
    </button>
  
    <!-- раскрываемый блок -->
    <div
      ref="bodyEl"
      class="about-answer"
    >
      <p class="base-text about-answer-inner">
        <span class="base-text about-subtitle-2">{{ subtitle }}</span><br>
        {{ content }}
      </p>
    </div>
  </div>
</template>
  
  <style scoped>
  .about-item {
    border-top: clamp(1px, 0.125vw, 4px) solid var(--strategix-dark);
    padding: min(23px, calc(var(--vh) * 2.5)) 0;
  
    @media(--tablet-width){
      padding: 20.5px 0;
    }
  
    @media(--big-laptop-width){
      padding: clamp(23px, calc(var(--vh) * 3), 50px) 0;
    }
  
    @media(--mobile-medium){
      padding: min(23px, calc(var(--vh) * 2.5)) 0;
      border-top: 1px solid var(--strategix-dark);
    }
  }
  
  .about-item:last-child {
    border-bottom: clamp(1px, 0.125vw, 4px) solid var(--strategix-dark);
  
    @media(--mobile-medium){
      border-bottom: 1px solid var(--strategix-dark);
    }
  }
  
  .about-summary {
    display: flex;
    align-items: center;
    cursor: pointer;
    list-style: none;
  
    width: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    text-align: left;
  
    /* чтобы не было выделения “кнопки” и таб-обводка была нормальной */
    outline: none;
  }
  
  .about-summary:focus-visible {
    outline: 2px solid var(--strategix-accent);
    outline-offset: 6px;
    border-radius: 14px;
  }
  
  .about-title {
    width: 70vw;
    text-align: left;
    font-weight: 600;
    font-size: clamp(28px, 2.4vw, 56px);
    color: var(--strategix-dark);
  
    @media(--tablet-width){
      width: 30vw;
    }
  
    @media(--mobile-medium){
      font-size: min(28px, calc(var(--vh) * 5));
    }
  }
  
  .about-subtitle {
    width: 70vw;
    font-weight: 700;
    text-align: left;
    font-size: clamp(20px, 1.65vw, 40px);
    display: none;
  
    color: var(--strategix-dark);
  
    @media(--mobile-medium){
      font-size: min(20px, calc(var(--vh) * 3.6));
    }
  
    @media(--tablet-width){
      width: 55vw;
      display: block;
    }
  }
  
  .about-subtitle-2 {
    width: 90%;
    font-weight: 700;
    text-align: left;
    font-size: min(23px, 10vw);
    display: block;
  
    color: var(--strategix-dark);
  
    @media(--mobile-medium){
      font-size: min(23px, calc(var(--vh) * 4));
    }
  
    @media(--tablet-width){
      width: 55vw;
      display: none;
    }
  }
  
  .about-answer {
    width: 98%;
    color: var(--strategix-dark);

    /* стартовые значения ставим и в JS, и тут как фоллбек */
    height: 0;
    overflow: hidden;
    opacity: 0;
    margin-top: 0;
  
    @media (--mobile-medium) {
      font-size: min(16px, calc(var(--vh) * 2.8));
    }
  
    @media (--tablet-width) {
      margin-left: min(30vw, 875px);
      width: min(55vw, 1600px);
      display: block;
    }
  }
  
  .about-answer-inner {
    margin: 0;
    font-size: clamp(16px, 1.2vw, 32px);
    text-align: left;
    font-weight: 300;
  }
  
  .about-icon {
    width: auto;
    height: min(40px, calc(var(--vh) * 6));
    aspect-ratio: 1/1;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.5s ease;
    margin-left: auto;
    background-color: white;
    border-radius: 50%;
  
    @media(--big-laptop-width){
      height: clamp(40px, calc(var(--vh) * 6), 80px);
    }
  
    @media (--mobile-medium) {
      height: min(40px, calc(var(--vh) * 6));
    }
  }
  
  .about-icon img{
    width: 50%;
    height: 50%;
  }
  
  .about-item.open .about-icon {
    transform: rotate(45deg);
    background-color: var(--strategix-accent);
  }
  
  .about-item.open .about-icon img {
    filter: invert(1);
  }
  
  @media (--tablet-width) {
    .about-item.open .about-answer {
      /* JS ставит min(13px, ...), а тут — как у вас было на tablet */
      margin-top: min(33px, calc(var(--vh) * 3.3));
    }
  }
  </style>
  
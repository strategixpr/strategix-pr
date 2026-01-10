<script setup lang="ts">
import strategixLogo from "@/assets/images/strategix-white-2.svg";
import ButtonWithIcon from "@/shared/ui/button-with-icon";
import index from '@/content/pages/index.json'

const { navData } = defineProps<{
  navData: {
    links: { href: string; label: string }[]
  }
}>();

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const buttonText = translations.header.mobile_menu.button.text
const buttonHref = translations.header.mobile_menu.button.href
</script>

<template>
  <div class="navigation-menu">
    <!-- Триггер открытия меню -->
    <a
      id="menu-toggle"
      class="checkbox checkbox--open"
      href="#menu"
      aria-label="Открыть меню"
    />

    <!-- Триггер закрытия меню (показывается только при открытом меню) -->
    <a
      class="checkbox checkbox--close"
      href="#"
      aria-label="Закрыть меню"
    />

    <!-- Визуальный "бургер" -->
    <div class="checkbox-button">
      <span />
      <span />
      <span />
    </div>

    <!-- Само меню: работает через :target -->
    <div
      id="menu"
      class="menu"
    >
      <NuxtImg
        class="strategix-logo"
        :src="strategixLogo"
        alt="strategix logo"
        :width="172"
        :height="36"
        loading="lazy"
      />

      <nav class="navigation">
        <ul>
          <li
            v-for="(link, index) in navData.links"
            :key="index"
          >
            <a
              :href="link.href"
              class="base-text big-text"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </nav>

      <ButtonWithIcon
        class="button"
        style-button="white"
        :href="buttonHref"
      >
        {{ buttonText }}
      </ButtonWithIcon>
    </div>
  </div>
</template>

<style>
  :root{
    /* Базовая величина анимации — меняйте только эту, чтобы скорректировать все скорости */
    --anim-base: 0.05s;
    /* Производные значения, используемые в этом компоненте */
    --anim-menu: calc(3 * var(--anim-base)); /* 0.15s */
    --anim-span: calc(8 * var(--anim-base)); /* 0.4s  */
    --anim-ui: calc(4 * var(--anim-base));   /* 0.2s  */
    --anim-delay-initial: calc(3.4 * var(--anim-base)); /* ~0.17s */
    --anim-delay-show: calc(4 * var(--anim-base));     /* 0.2s  */
 }

  /* Блокировка скролла, когда меню открыто */
  body:has(#menu:target) {
    overflow: hidden;
  }

  /* Переключение «открыть / закрыть» триггеров */
  body:has(#menu:target) .checkbox--open {
    display: none;
  }

  body:has(#menu:target) .checkbox--close {
    display: block;
  }
</style>

<style scoped>
.navigation-menu{
    width: 28px;
    height: 18px;

    position: relative;

    @media(--tablet-width){
     display: none;
    }

    @media(--mobile-medium) {
      display: none;
    }

    @media(width <= 768px){
      display: inline;
    }
    
}

/* Два "чекбокса" теперь — два <a>, наложенные друг на друга */
.checkbox{
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;

  position: absolute;
  top: 0;
  left: 0;

  opacity: 0;
  pointer-events: auto;
  z-index: 3;
  cursor: pointer;
}

/* По умолчанию закрывающий триггер скрыт, его включает body:has(#menu:target) */
.checkbox--close{
  display: none;
}

.checkbox-button{
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.checkbox-button span{
    display: block;
    width: 100%;
    height: 16.6%;
    margin: 0;
    padding: 0;

    background-color: var(--strategix-accent);
    border-radius: 1px;

    transition: all var(--anim-span) ease;
    z-index: 2;
}

/* При открытом меню перекрашиваем полоски бургера */
.navigation-menu:has(#menu:target) .checkbox-button span{
    background-color: var(--strategix-dark);
}

.menu{
  width: var(--section-width);
  height: calc(var(--vh) * 100);
  padding: calc(var(--vh) * 6.75) var(--padding-section-x) var(--padding-section-x);
  box-sizing: border-box;

  position: fixed;
  top: 0;
  right: 0;

  opacity: 0;
  transform: translateX(100%);

  background-color: var(--strategix-accent);

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  transition: all var(--anim-menu) ease;
}

/* Открытие меню через :target */
.menu:target{
  transform: translateX(0);
  opacity: 1;
}

.strategix-logo{
    width: min(172px, 44.1vw);
    height: auto;
    aspect-ratio: 4.77 / 1;

    @media(--tablet-width) {
      width: clamp(121px, 10.1vw, 245px);
    }

    @media(--mobile-small) {
      width: auto;
      height: 100%;
    }
  }

.navigation{
    width: 100%;
    height: fit-content;
    padding: 0;
    margin: calc(var(--vh) * 10) 0 auto;
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.navigation ul{
    width: 100%;
    height: fit-content;
    padding: 0;
    margin: 0;
    list-style: none;

    display: flex;
    flex-direction: column;
    text-align: right;
    gap: calc(var(--vh) * 3);

}

.big-text{
    width: 100%;
    height: fit-content;
    text-decoration: none;

    /* font-size: min(60px, 15vw); */
    font-size: min(min(60px, 15vw), 10vh);
    font-weight: 800;
    line-height: 110%;
    letter-spacing: 0;
    text-align: right;
    text-transform: uppercase;

    color: white;
}

/* Начальное состояние: логотип и нижняя кнопка скрыты и слегка смещены вниз. */
.menu .button,
.menu .strategix-logo {
    opacity: 0;
    transition: all var(--anim-ui) ease;
    transition-delay: var(--anim-delay-initial); /* ждать пока .menu завершит появление */
}

.menu .navigation ul li{
  opacity: 0;
  transform: translateX(20px);
  transition: all var(--anim-ui) ease;
  transition-delay: var(--anim-delay-initial); /* ждать пока .menu завершит появление */
}

/* После открытия меню — показать элементы с небольшой задержкой. */
.menu:target .strategix-logo,
.menu:target .button {
  opacity: 1;
  transform: translateX(0);
  transition-delay: var(--anim-delay-show);
}

.menu:target .navigation ul li:nth-child(1) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(5 * var(--anim-base));
}

.menu:target .navigation ul li:nth-child(2) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(6 * var(--anim-base));
}

.menu:target .navigation ul li:nth-child(3) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(7 * var(--anim-base));
}

.menu:target .navigation ul li:nth-child(4) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(8 * var(--anim-base));
}

.menu:target .navigation ul li:nth-child(5) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(9 * var(--anim-base));
}

.menu:target .navigation ul li:nth-child(6) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(10 * var(--anim-base));
}

.menu:target .navigation ul li:nth-child(7) {
  opacity: 1;
  transform: translateX(0);
  transition-delay: calc(11 * var(--anim-base));
}
</style>

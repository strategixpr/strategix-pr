<script setup lang="ts">
import localesConfig from '@/content/locales.json'


const { locale, setLocale } = useI18n()
const isDropdown = localesConfig.locales.length >= 5
const CurrentLanguage = localesConfig.locales.find(langConfig => langConfig.code === locale.value)

const changeLanguage = (langCode: string) => {
  // @ts-ignore
  setLocale(langCode);

  window.setTimeout(() => location.hash = '', 50);
};

</script>

<template>
  <nav class="lang-nav">
    <div class="lang-switcher">
      <!-- активный язык со стрелкой -->
      <button
        :class="['small-text', 'lang-current', !isDropdown ? 'lang-current-inline' : '']"
        type="button"
      >
        {{ CurrentLanguage ? CurrentLanguage.name : localesConfig.default }}
      </button>

      <!-- список всех языков -->
      <ul :class="isDropdown ? 'lang-list-column' : 'lang-list'">
        <li
          v-for="language in localesConfig.locales"
          :key="language.name"
          class="lang-item"
        >
          <button
            class="small-text lang-link hover"
            @click.prevent="changeLanguage(language.code)"
          >
            {{ language.name }}
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
  .lang-nav {
    position: relative;
  }

  .lang-switcher {
    position: relative;
    display: inline-block;     
    margin: 0;
    padding: 0;      
    list-style: none;
  }

  /* активный язык + стрелка */
  .lang-current {
    display: inline-flex;
    align-items: center;
    gap: 6px;

    padding: 0;
    margin: 0;
    margin-left: 0;

    border: none;
    background: transparent;
    color: #ffffff;

    cursor: pointer;
    white-space: nowrap;
 
    @media(width < 768px){
       margin-left: 15vw;
       font-size: min(18px, 4.5vw);
    }

    @media(--mobile-medium){
      margin-left: 0;
      font-size: min(14px, calc(var(--vh) * 2.917));
    }
  }

  /* стрелка вниз по умолчанию */
  .lang-current::after {
    content: "";
    width: 6px;
    height: 6px;

    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
    transform: translateY(-2px) rotate(45deg);      /* стрелка вниз */
    transform-origin: center;
    transition: transform 0.15s ease;
  }

  /* сам дропдаун */
  .lang-list,
  .lang-list-column {
    position: absolute;
    top: 100%;
    right: -12px;

    margin: 0;
    padding: 12px 18px;
    list-style: none;

    border-radius: var(--card-radius);
    background-color: #262626;

    opacity: 0;
    pointer-events: none;
    /* transform: translateX(50%); */
    transition:
      opacity 0.15s ease,
      transform 0.15s ease;

    z-index: 10;
  }

  .lang-item + .lang-item {
    margin-top: 6px;
  }

  .lang-link {
    border: none;
    background: transparent;
    outline: none;

    text-decoration: none;
    color: white;
    white-space: nowrap;

    @media(width < 768px){
       font-size: min(18px, 4.5vw);
    }

    @media(--mobile-medium){
      font-size: min(14px, calc(var(--vh) * 2.917));
    }
  }

  .lang-switcher:hover .lang-list,
  .lang-switcher:hover .lang-list-column,
  .lang-list-column:hover,
  .lang-list:hover {
    opacity: 1;
    pointer-events: auto;
  }

  .lang-switcher:hover .lang-current::after,
  .lang-list-column:hover ~ .lang-current::after,
  .lang-list:hover ~ .lang-current::after {
    transform: translateY(3px) rotate(-135deg);
  }

  .lang-current-inline {
    display: inline-flex;
  }

  @media (--laptop-width) {
    .lang-switcher {
      display: block;
    }

    /* кнопку прячем, оставляем только горизонтальный список */
    .lang-current-inline {
      display: none;
    }

    /* список становится обычным горизонтальным рядом */
    .lang-list {
      position: static;

      display: flex;
      align-items: center;
      justify-content: space-between;

      padding: 0;
      margin: 0;

      background: transparent;
      border-radius: 0;

      opacity: 1;
      pointer-events: auto;
      transform: none;
    }

    .lang-list .lang-item + .lang-item {
      margin-top: 0;
      margin-left: clamp(20px, 2vw, 48px); /* расстояние между языками */
    }
  }
</style>

<script setup lang="ts">
import ButtonWithIcon from '~/shared/ui/button-with-icon';
import index from '@/content/pages/index.json'

type WelcomeUrl = {
  text: string;
  href: string;
};

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const title = translations.welcome.title
const subtitle = translations.welcome.subtitle
const buttonText = translations.welcome.button.text
const buttonHref = translations.welcome.button.href

const rawUrls = translations.welcome.urls as WelcomeUrl[] | Record<string, WelcomeUrl> | undefined
const urls: WelcomeUrl[] = Array.isArray(rawUrls)
  ? rawUrls
  : rawUrls
    ? Object.values(rawUrls)
    : []

const mobileUrls = urls.slice(0, 2)
const desktopUrls = urls
</script>

<template>
  <div class="text-content">
    <h1 class="upperscase-text title">
      {{ title }}
    </h1>
    <h2 class="base-text subtitle">
      {{ subtitle }}
    </h2>
    <div class="welcome-buttons">
      <ButtonWithIcon
        style-button="green"
        :href="buttonHref"
      >
        {{ buttonText }}
      </ButtonWithIcon>
      <ButtonWithIcon
        v-for="(url, index) in mobileUrls"
        :key="`mobile-${index}-${url.href}`"
        class="mobile"
        style-button="green"
        :href="url.href"
        target="_blank"
      >
        {{ url.text }}
      </ButtonWithIcon>
      <ButtonWithIcon
        v-for="(url, index) in desktopUrls"
        :key="`desktop-${index}-${url.href}`"
        class="desktop"
        :href="url.href"
        target="_blank"
      >
        {{ url.text }}
      </ButtonWithIcon>
    </div>
  </div>
</template>

<style scoped>
.text-content{
  width: 100%;
  height: 100%;
  margin: 0;

  display: flex;
  flex-direction: column;
  z-index: 1;

  @media(--tablet-width){
    width: 60%;
    height: 100%;
  }

  @media(--laptop-width){
    width: 60%;
  }
}

.title{
  max-width: 100%;
  overflow: hidden;
  text-align: left;
  font-size: min(min(10vw, calc(var(--vh) * 5.25)), 42px);
  color: white;
  line-height: 120%;

  margin-top: var(--welcome-padding-top);
  margin-bottom: 0;

  @media(--mobile-width){
    margin-top: calc(var(--welcome-padding-top) + var(--vh) * 10);
    font-size: clamp(min(min(4vw, var(--vh) * 3), 42px), 1.95vw + var(--vh) * 2.85, 100px);
  }

  @media (--mobile-width) and (max-aspect-ratio: 4/5){
      width: 100%;
      margin-top: var(--welcome-padding-top);
      font-size: clamp(min(4vw, var(--vh) * 3), min(10vw, calc(var(--vh) * 5.25)), 100px);
  }

  @media(--mobile-medium) {
    font-size: min(min(10vw, calc(var(--vh) * 5.5)), 42px);
  }
}

.subtitle{
  width: 100%;
  text-align: left;
  font-size: min(min(5.125vw, calc(var(--vh) * 2.5)), 20px);
  color: var(--strategix-accent);
  line-height: 120%;

  margin-top: 1.5%;
  margin-bottom: 0;

  @media(--tablet-width){
    width: 82%;
    font-size: clamp(20px, calc(1vw + var(--vh) * 1.25), 50px);
    margin-top: 3.5%;
  }

  @media(--mobile-medium) {
    font-size: min(14px, calc(var(--vh) * 3.75));
  }
  
}

.welcome-buttons{
  width: 100%;
  margin-top: auto;
  margin-bottom: var(--padding-section-x);
  gap: calc(var(--vh) * 1.2);

  display: flex;
  flex-wrap: wrap;
  align-items: center;

  @media(--tablet-width){
    margin: auto 0 var(--welcome-padding-bottom);
    gap: clamp(7px, 0.2vw, 40px);
  }

  @media(--mobile-medium){
    padding-top: calc(var(--vh) * 5);
  }
}

.mobile{
  display: flex;

  @media(--tablet-width){
    display: none;
  }
}

.desktop{
  display: none;

  @media(--tablet-width){
    display: flex;
  }
}
</style>

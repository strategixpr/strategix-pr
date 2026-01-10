
<script setup lang="ts">
import type { ServiceItem } from "../model/config";
import index from '@/content/pages/index.json'

const {service} = defineProps<{service: ServiceItem;}>();

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const email = translations.services.questions.email;
</script>

<template>
  <article
    class="service-cta-card"
    :class="service.gridArea"
  >
    <div class="content">
      <h3 class="base-text title">
        {{ service.title }}
      </h3>

      <p class="small-text description">
        {{ service.description }}
      </p>
    </div>

    <a
      class="email"
      :href="`mailto:${email}`"
    >
      <span class="base-text email-icon">
        @
      </span>
      <span class="small-text email-text">
        {{ email }}
      </span>
    </a>
  </article>
</template>

<style scoped>
.service-cta-card {
  width: auto;
  height: auto;
  border-radius: var(--card-radius);
  background-color: var(--strategix-accent);
  padding: clamp(12px, 1.666vw, 40px);
  display: flex;
  justify-content: space-between;
  flex-direction: column;
}

.content {
  height: 86%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.title {
  margin: calc(var(--vh) * 0.3) 0;
  text-align: left;
  color:  var(--strategix-dark);
  font-weight: 500;
  line-height: 110%;
  font-size: clamp(18px, calc(3.52vw + var(--vh) * 5.12), 24px);

  @media(--mobile-medium){
    font-size: min(18px, calc(var(--vh) * 3.75));
  }
}

.description {
  margin: 0;
  font-weight: 400;   
  color:  var(--strategix-dark);
  text-align: left;
}

.email {
  height: 10%;
  display: inline-flex;
  align-items: center;

  text-decoration: none;
  gap: 4%;

}

.email-icon {
  width: min(6%, 16px);
  height: auto;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  border: 1px solid white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 50%;
  font-weight: 600;
  color: white;
}

.email-text {
  line-height: 115%;
  font-weight: 400;
  text-align: left;

  color: white;
  
  font-size: min(11px, 2.8vw);

  @media(--tablet-width){
    font-size: clamp(5px, calc(1.411vw + var(--vh) * 2.052), 15px);
  }

  @media(--mobile-medium) {
      font-size: min(10px, calc(var(--vh) * 2.075));
  }
}
</style>

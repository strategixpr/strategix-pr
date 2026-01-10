<script setup lang="ts">
import index from '@/content/pages/index.json'

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const title = translations.our_team.lastcard.title
const description = translations.our_team.lastcard.description
const email = translations.our_team.lastcard.email
</script>

<template>
  <article class="team-cta-card">
    <div class="content">
      <h3 class="base-text title">
        {{ title }}
      </h3>

      <p class="base-text description">
        {{ description }}
      </p>
    </div>

    <a
      class="email"
      :href="`mailto:${email}`"
    >
      <span class="base-text email-icon">
        @
      </span>
      <span class="base-text email-text hover">
        {{ email }}
      </span>
    </a>
  </article>
</template>

<style scoped>
.team-cta-card {
  width: 100%;
  height: 50%;
  padding: min(10px, calc(var(--vh) * 2.25)) min(14px, 3.5vw);
  box-sizing: border-box;
  border-radius: var(--card-radius);
  background-color: var(--strategix-accent);

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  grid-column: 1 / -1;
  
  @media(--tablet-width){
    height: 100%;
    padding: clamp(16px, 6%, 32px) clamp(10px, 7%, 40px);
    grid-column: auto;
  }

  @media(--mobile-medium){
    height: 100%;
    padding: min(10px, calc(var(--vh) * 2.25)) min(14px, 3.5vw);
    grid-column: auto;
  }
}

.content {
  height: 65%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  @media(--tablet-width){
    height: 88%;
  }
  @media(--mobile-medium){
    height: 100%;
  }
}

.title {
  margin: 0;

  font-size: min(20px, 5.25vw);
  line-height: 115%;
  font-weight: 500;
  text-align: left;

  color:  var(--strategix-dark);

  text-wrap: nowrap;

  @media(--tablet-width){
    font-size: clamp(20px, calc(1.5vw + var(--vh) * 1), 56px);
    color: white;
    text-wrap: wrap;
  }

  @media(--mobile-medium){
    font-size: min(20px, calc(var(--vh) * 3.575));
    text-wrap: wrap;
  }
}

.description {
  margin: 0;

  font-size: min(14px, 3.6vw);
  line-height: 115%;
  font-weight: 400;
  text-align: left;

  color:  var(--strategix-dark);

  text-wrap: nowrap;

  @media(--tablet-width){
    font-size: clamp(14px, calc(1vw + var(--vh) * 0.35), 28px);
    text-wrap: wrap;
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 2.21));
    text-wrap: wrap;
  }
}

.email {
  height: 30%;
  display: inline-flex;
  align-items: center;

  text-decoration: none;
  gap: 1.5%;

  @media(--tablet-width){
    height: 9%;
  }
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
  font-size: min(16px, 4.1vw);
  line-height: 115%;
  font-weight: 400;
  text-align: left;

  color: white;

  @media(--tablet-width){
    font-size: clamp(16px, calc(1vw + var(--vh) * 0.35), 28px);
  }

  @media(--mobile-medium){
    font-size: min(14px, calc(var(--vh) * 2.71));
  }
}
</style>

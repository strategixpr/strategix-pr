<script setup lang="ts">

import MemberCard from './MemberCard.vue';
import TeamInfoCard from './TeamInfoCard.vue';
import TeamCtaCard from './TeamCtaCard.vue';
import index from '@/content/pages/index.json'

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const members = translations.our_team.members
</script>


<template>
  <section
    id="our-team"
    class="our-team"
  >
    <div class="team">
      <TeamInfoCard 
        class="team-info-card"
        :class="members.length % 2 !== 0 && 'display-flex'" 
      />

      <MemberCard
        v-for="(member, index) in members"
        :key="index"
        :src="member.src"
        :name="member.name"
        :lastname="member.lastname"
        :position="member.position"
      />

      <TeamCtaCard />
    </div>
  </section>
</template>

<style scoped>
.our-team {
    width: var(--section-width);
    min-height: calc(var(--vh) * 70);
    height: fit-content; 
    padding: 0 var(--padding-section-x);
    margin-bottom: calc(-2.5 * var(--padding-section-x));
    box-sizing: border-box;

    background-color: var(--strategix-light);

    @media(--mobile-width){
      margin-bottom: calc(-2 * var(--padding-section-x));
    }

    @media(--tablet-width){
      padding: 0 var(--padding-section-x) calc(var(--vh) * 8);
      margin: 0;
    }

    @media(--mobile-medium){
      min-height: calc(var(--vh) * 110);
      margin-bottom: calc(-1.5 * var(--padding-section-x));
    }
}

.team{
  width: 100%;
  height: 100%;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  grid-auto-rows: min(calc(var(--vh) * 23), 250px);

  gap: var(--gap-grid);

  @media(--mobile-width){
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    grid-auto-rows: 1fr;
  }

  @media(--tablet-width){
    grid-template-columns: repeat(auto-fit, minmax(calc(25.175% - var(--gap-grid)), 1fr));
    grid-auto-rows: clamp(250px, calc(var(--vh) * 20.75), 600px);
  }

  @media(--laptop-width){
    grid-template-columns: repeat(auto-fit, minmax(calc(25.175% - var(--gap-grid)), 1fr));
    grid-auto-rows: clamp(250px, calc(var(--vh) * 30.75), 600px);
  }

  @media(--mobile-medium){
    grid-template-columns: repeat(auto-fit, minmax(calc(25.175% - var(--gap-grid)), 1fr));
    grid-auto-rows: calc(var(--vh) * 40);
  }
  
}

.team-info-card{
  display: none;

  @media(--tablet-width){
    display: flex;
  }
  @media(--mobile-medium){
    display: flex;
  }
}

.display-flex{
  display: flex;
}
</style>

<script setup lang="ts">
  import ButtonCloseModal from "./ButtonCloseModal.vue";
  import type { AboutServiceForModal } from "../model/config";

  const props = defineProps<{ aboutService: AboutServiceForModal, gridArea: string }>();

  const {title, Decor, lead, bullets, text} = props.aboutService

</script>

<template>
  <div class="about-service">
    <div
      class="about-service-mobile"
      :class="props.gridArea"
    >
      <div class="service-decor">
        <component :is="Decor" />
      </div>
      <ButtonCloseModal />
      
      <h3 class="upperscase-text about-service-title">
        {{ title }}
      </h3>
       
      <p class="base-text about-service-lead">
        {{ lead }}
      </p>
      
      <ul class="about-service-bullets">
        <li
          v-for="(bulletText, i) in bullets"
          :key="i"
          class="bullet"
        >
          <span class="small-text bullet-text">{{ bulletText }}</span>
        </li>
      </ul>

      <div class="service-decor" />
    </div>
    <div class="about-service-pc">
      <div class="pc-left-content">
        <ButtonCloseModal />

        <h3 class="upperscase-text about-service-title">
          {{ title }}
        </h3>

        <ul class="about-service-bullets">
          <li
            v-for="(bulletText, i) in bullets"
            :key="i"
            class="bullet"
          >
            <span class="small-text bullet-text">{{ bulletText }}</span>
          </li>
        </ul>
      </div>
      <div class="pc-right-content">
        <p class="base-text about-service-lead">
          {{ lead }}
        </p>
        <p class="small-text bullet-text about-service-text">
          {{ text }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-service {
  width: 100%;
  height: 100%;
  max-height: calc(var(--vh) * 86);
  box-sizing: border-box;
  display: flex;

  border-radius: var(--card-radius);
  overflow-y: scroll;
  scrollbar-width: none;
}

.about-service-mobile{
  width: 100%;
  height: 100%;
  padding: min(20px, calc(2.5vw + var(--vh) * 1.2));
  box-sizing: border-box;

  position: relative;
  display: flex;
  flex-direction: column;
  gap: min(32px, calc(var(--vh) * 3.2));

  background: var(--strategix-accent);
  border-radius: var(--card-radius);

  overflow-y: scroll;
  scrollbar-width: none;

  @media(--tablet-width){
    display: none;
  }

  @media(--mobile-medium){
    display: flex;
  }
}

.about-service-pc{
  width: 100%;
  height: fit-content;

  display: none;
  flex-direction: row;
  flex-wrap: nowrap;
  background: white;
  border-radius: var(--card-radius);

  @media(--tablet-width){
    display: flex;
  }

  @media(--mobile-medium){
    display: none;
  }
}

.pc-left-content{
  min-height: 100%;
  width: 40%;
  max-width: 40%;
  padding: clamp(30px, calc(var(--vh) * 8.75), 135px) clamp(20px, 3.75vw, 90px);
  box-sizing: border-box;
  background-color: var(--strategix-accent);
  border-radius: var(--card-radius);

  display: flex;
  flex-direction: column;
  gap: clamp(15px, calc(var(--vh) * 4.325), 70px);

  position: relative;

  /* @media(--mobile-medium){
    padding: min(30px, calc(var(--vh) * 6.25)) min(20px, 3.75vw);
  } */
}

.pc-right-content{
    min-height: 100%;
    width: 60%;
    max-width: 60%;
    padding: clamp(30px, calc(var(--vh) * 8.75), 135px) clamp(20px, 3.75vw, 90px);
    box-sizing: border-box;

    display: flex;
    flex-direction: column;
    gap: clamp(15px, calc(var(--vh) * 4.325), 70px);
}

.service-decor{
  width: min(calc(var(--vh) * 15), min(22.58%, 120px));
  height: auto;
  aspect-ratio: 1 / 1 ;
  margin: 0;

  transition: all 0.3s ease-in-out;
}

.about-service__card{
  background: var(--strategix-accent);
  border-radius: var(--card-radius);
  padding: clamp(18px, calc(var(--vh) * 2.2), 32px);
  color: white;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: clamp(12px, calc(var(--vh) * 1.2), 18px);
}

.about-service-title{
  margin: 0;

  text-align: left;
  font-size: min(32px, 8.2vw);
  color: white;

  @media(--tablet-width){
    font-size: clamp(24px, 2.9175vw, 64px);
  }

  @media(--mobile-medium){
    font-size: min(28px, calc(var(--vh) * 5));
  }
}

.about-service-lead{
  margin: 0;
  padding: 0;

  font-size: min(18px, 4.65vw);
  text-align: left;
  line-height: 130%;
  color: white;

  @media(--tablet-width){
    font-size: clamp(18px, calc(1.4vw + var(--vh) * 1.025), 42px);
    color: var(--strategix-accent);
  }

  @media(--mobile-medium) {
    font-size: min(18px, calc(var(--vh) * 3.75));
  }
}

.about-service__lead{
  text-align: left;
  color: rgba(255,255,255,0.95);
  font-weight: 500;
  font-size: clamp(12px, 2.9vw, 18px);
  line-height: 1.2;
}

.about-service-bullets{
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: min(calc(var(--vh) * 1.2), 12px);
  color: white;
}

.bullet{
  margin-left: min(4.4%, 15px);

  @media(--tablet-width){
    font-size: 36px; /* Изменение размера точек рядом с шрифтом*/
    line-height: 60%;
    margin-left: 7.75%;
    margin-bottom: calc(var(--vh) * 0.8);
  }

  @media(--mobile-medium){
    font-size: min(16px, 4.1vw);
    margin-left: min(5%, 15px);
    line-height: 110%;
  }
}

.bullet-text{
  margin: 0;
  
  text-align: left;
  font-size: min(16px, 4.1vw);
  line-height: 130%;

  @media(--tablet-width){
    font-size: clamp(14px, 1.335vw, 32px);

    vertical-align: top;
    line-height: 165%;
  }

  @media(--mobile-medium) {
    font-size: min(16px, calc(var(--vh) * 3.325));
  }
}

.about-service-text{
    font-weight: 300;
}
</style>

<style>
    .reputation .service-decor .reputation__decor .reputation__decor__column{
        animation: reputation-anim 4s infinite ease-in-out;
    }


    .media .service-decor .media__decor .media__decor__dot{
        background-color: var(--strategix-accent-light);
        animation: media-anim 4s infinite ease-in-out;
    }


    .branding .service-decor .branding__decor{
        animation: branding-anim 6s infinite linear;
    }
    .branding .service-decor .branding__decor .branding__decor__square{
        background-color: var(--strategix-accent-light);
    }


    .production .service-decor .production__decor .production__decor__quarter-circle{
        background-color: var(--strategix-accent);
        animation: production-anim 4s infinite linear;
    }


    .events .service-decor .events__decor .events__decor__quarter-square{
        background-color: var(--strategix-accent);
        animation: events-anim 4s infinite linear;
    }


    .ai-marketing .service-decor{
        transform: translateY(30%);
    }
    .ai-marketing .service-decor .ai-marketing__decor .ai-marketing__decor__dot{
        transform: scale(1);
        background-color: var(--strategix-accent);
        animation: ai-marketing-anim 4s infinite ease-in-out;
    }


    .ads .service-decor .ads__decor .ads__decor__circle{
        border-color: white;
    }

    .ads .service-decor .ads__decor .ads__decor__point{
        width: 20%;
        height: 20%;
        background-color: var(--strategix-accent-light);
    }

    .ads .service-decor .ads__decor .ads__decor__orbit{
        animation: ads-anim 4s infinite linear;
    }
</style>

<script setup lang="ts">
// import arrowForward from '@/assets/images/arrow-forward.svg';

import type { ServiceItem } from "../model/config";

const {service} = defineProps<{service: ServiceItem;}>();
</script>

<template>
  <article
    class="service-card"
    :class="service.gridArea"
  >
    <div class="service-card__decor">
      <component
        :is="service.Decor"
      />
    </div>

    <div class="icon-arrow" />

    <h3 class="base-text service-card__title">
      {{ service.title }}
    </h3>

    <p class="small-text service-card__description">
      {{ service.description }}
    </p>
  </article>
</template>

<style>
.service-card {
  width: 100%;
  height: 100%;
  max-height: 100%;
  box-sizing: border-box;
  border-radius: var(--card-radius);
  background: white;
  padding: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  position: relative;

  transition: all 0.3s ease-in-out;
}

.icon-arrow{
  width: 8.75%;
  height: auto;
  box-sizing: border-box;
  aspect-ratio: 1 / 1;

  position: absolute;
  top: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);
  right: clamp(12px, calc(0.666vw + var(--vh) * 1.5), 40px);

  background: transparent;
  border: 1px solid var(--strategix-accent);
  border-bottom: 1px;
  border-left: 1px;

  transition: all 0.3s ease-in-out;

  @media(--tablet-width){
    width: clamp(15px, 2.1vw, 50px);
    height: auto;

    transform: scale(0.7);

    border-color: white;
  }

  @media(--mobile-medium){
    width: 8.75%;
    height: auto;

    border-color: var(--strategix-accent);
  }
}

.icon-arrow::after{
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;

  /* длина линии чуть больше диагонали квадрата: √2 ≈ 1.414 */
  width: 141%;
  height: 1px;

  background-color: var(--strategix-accent);

  transform-origin: left bottom;
  transform: rotate(-45deg);

  @media(--tablet-width){
    background-color: white;
  }

  @media(--mobile-medium){
    background-color: var(--strategix-accent);
  }
}

.service-card__title {
  padding-top: 5px;
  margin: auto 0 auto;
  text-align: left;

  text-transform: uppercase;
  font-size: min(16px, 3.75vw);
  color: var(--strategix-dark);

  transition: all 0.3s ease-in-out;

  @media(--tablet-width){
    font-size: clamp(16px, calc(0.525vw + var(--vh) * 1.35), 40px);
  }

  @media (--laptop-width) and (min-aspect-ratio: 4/3){
    font-size: clamp(16px, calc(0.525vw + var(--vh) * 1.75), 40px);
  }

  @media(--mobile-medium){
    font-size: min(16px, calc(var(--vh) * 3.35));
  }
}

.service-card__decor{
  width: min-content;
  min-height: 18.75%;
  height: 18.75%;
  aspect-ratio: 1 / 1 ;
  margin: 0;

  transition: all 0.3s ease-in-out;
}

.service-card__description {
  width: 100%;

  margin: 0;
  font-weight: 400;   
  color: var(--strategix-gray);
  text-align: left;

  font-size: clamp(12px, calc(0.446vw + var(--vh) * 1.14), 32px);
  /* line-height: 100%; */
  transition: all 0.3s ease-in-out;

  @media (--laptop-width) and (min-aspect-ratio: 4/3){
    width: 85%;
  }

  @media(--mobile-medium) {
      font-size: min(12px, calc(var(--vh) * 2));
  }
}

@media (--laptop-width) and (min-aspect-ratio: 4/3){
  .service-card:hover{
    /* padding: calc(clamp(12px, 0.666vw + 1.5vh, 40px) / 2) clamp(12px, 0.666vw + 1.5vh, 40px); */
    padding: clamp(12px, 0.666vw + var(--vh) * 1.5, 40px) clamp(12px, 0.666vw + var(--vh) * 1.5, 40px) calc(clamp(12px, 0.666vw + var(--vh) * 1.5, 40px) / 2);
    background-color: var(--strategix-accent);
    cursor: pointer;
  }

  .service-card:hover .icon-arrow{
    transform: scale(1);
  }

  .service-card:hover .service-card__title{
    padding-top: 15px;
    
    color: var(--strategix-light);

    font-size: clamp(20px, calc(0.675vw + var(--vh) * 2.1), 44px);

    @media(--mobile-medium){
      font-size: min(20px, calc(var(--vh) * 4.6));
    }
  }

  .service-card:hover .service-card__description {
    width: 97%;

    color: var(--strategix-light);

    font-size: clamp(14px, calc(0.4vw + var(--vh) * 1.5), 34px);

    @media(--mobile-medium) {
        font-size: min(14px, calc(var(--vh) * 3.325));
    }
  }



  /*При hover каждая из икнок по размеру становиться в 1.3 раза больше оригинала*/
  .reputation{
      grid-area: reputation;
  }

  .reputation .service-card__decor {
    width: 4.075%;
    height: auto;
  }

  .reputation:hover .service-card__decor{
    /* width: 5.35%; */
    transform: scale(1.3) translateX(15%) translateY(10%);
  }

  .reputation:hover .service-card__decor .reputation__decor .reputation__decor__column{
    animation: reputation-anim 2s infinite ease-in-out;
  }




  .media{
      grid-area: media;
  }

  .media .service-card__decor {
    width: 15.8%;
    height: auto;
  }

  .media:hover .service-card__decor{
    transform: scale(1.3) translateX(15%) translateY(15%);
  }

  .media:hover .service-card__decor .media__decor .media__decor__dot{
    background-color: var(--strategix-accent-light);
    animation: media-anim 2s infinite ease-in-out;
  }




  .branding{
      grid-area: branding;
  }

  .branding .service-card__decor {
    width: 8.5415%;
    height: auto;
  }

  .branding:hover .service-card__decor{
    transform: scale(1.3) translateX(15%) translateY(15%);
  }

  .branding:hover .service-card__decor .branding__decor{
    animation: branding-anim 3s infinite linear;
  }

  .branding:hover .service-card__decor .branding__decor .branding__decor__square{
    background-color: var(--strategix-accent-light);
  }



  .production{
    grid-area: production;
  }

  .production .service-card__decor {
    width: 15.85%;
    height: auto;
  }

  .production:hover .service-card__decor{
    transform: scale(1.3) translateX(15%) translateY(15%);
  }

  .production:hover .service-card__decor .production__decor .production__decor__quarter-circle{
    background-color: var(--strategix-accent);
    animation: production-anim 2s infinite linear;
  }



  .events{
    grid-area: events;
  }

  .events .service-card__decor {
    width: 26.54%;
    height: auto;
  }

  .events:hover .service-card__decor{
    transform: scale(1.3) translateX(15%) translateY(15%);
  }

  .events:hover .service-card__decor .events__decor .events__decor__quarter-square{
    background-color: var(--strategix-accent);
    animation: events-anim 2s infinite linear;
  }

  

  .ai-marketing{
    grid-area: ai-marketing;
  }

  .ai-marketing .service-card__decor {
    width: 16.4025%; /*если разделить на 1.5, то размер будет как у всех остальных */
    height: auto;
  }

  .ai-marketing:hover .service-card__decor{
    width: 14.7%;
    transform: scale(1.3) translateX(15%) translateY(15%);
  }

  .ai-marketing:hover .service-card__decor .ai-marketing__decor {
    gap: 13%;
  }

  .ai-marketing:hover .service-card__decor .ai-marketing__decor .ai-marketing__decor__dot{
    transform: scale(1);
    background-color: var(--strategix-accent);
    animation: ai-marketing-anim 2s infinite ease-in-out;
  }




  .ads{
    grid-area: ads;
  }

  .ads .service-card__decor {
    width: 10.935%;
    height: auto;
  }

  .ads:hover .ads__decor{
    transform: scale(1.3) translateX(15%) translateY(15%);
  }

  .ads:hover .service-card__decor .ads__decor .ads__decor__circle{
    border-color: white;
  }

  .ads:hover .service-card__decor .ads__decor .ads__decor__point{
    width: 20%;
    height: 20%;
    background-color: var(--strategix-accent-light);
  }

  .ads:hover .service-card__decor .ads__decor .ads__decor__orbit{
     animation: ads-anim 2s infinite linear;
  }




  .questions{
      grid-area: questions;
  }
}
</style>

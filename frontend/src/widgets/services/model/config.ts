import type { Component } from "vue";
import index from '@/content/pages/index.json'
import {
  ReputationDecor,
  MediaDecor,
  BrandingDecor,
  ProductionDecor,
  EventsDecor,
  AiMarketingDecor,
  AdsDecor,
} from "../ui/service-decor";

export type ServiceId =
  | "reputation"
  | "media"
  | "branding"
  | "production"
  | "events"
  | "aiMarketing"
  | "ads"
  | "questions";

export interface AboutServiceForModal {
  title: string;
  Decor: Component;
  lead: string;
  bullets: string[];
  text: string;
}

export interface ServiceItem {
  id: ServiceId;
  title: string;
  description: string;
  Decor: Component;
  gridArea: string;
  aboutService: AboutServiceForModal;
}

export const getServices = (locale: string = 'example'): ServiceItem[] => {
  const currentLocale = locale || 'example'
  const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example
  const servicesData = translations.services

  return [
  {
    id: "reputation",
    title: servicesData.reputation.title,
    description: servicesData.reputation.description,
    Decor: ReputationDecor,
    gridArea: "reputation",
    aboutService: {
      title: servicesData.reputation.title,
      Decor: ReputationDecor,
      lead: servicesData.reputation.lead,
      bullets: servicesData.reputation.bullets,
      text: servicesData.reputation.text
    }
  },
  {
    id: "media",
    title: servicesData.media.title,
    description: servicesData.media.description,
    Decor: MediaDecor,
    gridArea: "media",
    aboutService: {
      title: servicesData.media.title,
      Decor: MediaDecor,
      lead: servicesData.media.lead,
      bullets: servicesData.media.bullets,
      text: servicesData.media.text
    }
  },
  {
    id: "branding",
    title: servicesData.branding.title,
    description: servicesData.branding.description,
    Decor: BrandingDecor,
    gridArea: "branding",
    aboutService: {
      title: servicesData.branding.title,
      Decor: BrandingDecor,
      lead: servicesData.branding.lead,
      bullets: servicesData.branding.bullets,
      text: servicesData.branding.text
    }
  },
  {
    id: "production",
    title: servicesData.production.title,
    description: servicesData.production.description,
    Decor: ProductionDecor,
    gridArea: "production",
    aboutService: {
      title: servicesData.production.title,
      Decor: ProductionDecor,
      lead: servicesData.production.lead,
      bullets: servicesData.production.bullets,
      text: servicesData.production.text
    }
  },
  {
    id: "events",
    title: servicesData.events.title,
    description: servicesData.events.description,
    Decor: EventsDecor,
    gridArea: "events",
    aboutService: {
      title: servicesData.events.title,
      Decor: EventsDecor,
      lead: servicesData.events.lead,
      bullets: servicesData.events.bullets,
      text: servicesData.events.text
    }
  },
  {
    id: "aiMarketing",
    title: servicesData.aiMarketing.title,
    description: servicesData.aiMarketing.description,
    Decor: AiMarketingDecor,
    gridArea: "ai-marketing",
    aboutService: {
      title: servicesData.aiMarketing.title,
      Decor: AiMarketingDecor,
      lead: servicesData.aiMarketing.lead,
      bullets: servicesData.aiMarketing.bullets,
      text: servicesData.aiMarketing.text
    }
  },
  {
    id: "ads",
    title: servicesData.ads.title,
    description: servicesData.ads.description,
    Decor: AdsDecor,
    gridArea: "ads",
    aboutService: {
      title: servicesData.ads.title,
      Decor: AdsDecor,
      lead: servicesData.ads.lead,
      bullets: servicesData.ads.bullets,
      text: servicesData.ads.text
    }
  },
  {
    id: "questions",
    title: servicesData.questions.title,
    description: servicesData.questions.description,
    Decor: AdsDecor,
    gridArea: "questions",
    aboutService: {
      title: servicesData.questions.title,
      Decor: AdsDecor,
      lead: servicesData.questions.description,
      bullets: [],
      text: ""
    }
  }
  ]
}

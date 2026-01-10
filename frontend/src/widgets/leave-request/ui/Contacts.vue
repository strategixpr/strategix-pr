<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import index from '@/content/pages/index.json'

type ContactItemType = 'link' | 'phone' | 'email'
type ContactItem = {
  type: ContactItemType
  src?: string
  text?: string
  href?: string
  value?: string
}

type ContactDisplayItem =
  | { type: 'link'; src: string; text: string; href: string }
  | { type: 'phone'; value: string; href: string }
  | { type: 'email'; value: string; href: string }

const { locale } = useI18n()
const currentLocale = locale.value || 'example'
const translations = index.translations[currentLocale as keyof typeof index.translations] || index.translations.example

const contacts = translations.leave_request.contacts || {}
const title = contacts.title || ''
const rawItems = Array.isArray(contacts.items) ? (contacts.items as ContactItem[]) : []

const normalizeContact = (item: ContactItem): ContactDisplayItem | null => {
  const type: ContactItemType = item?.type === 'phone' || item?.type === 'email' ? item.type : 'link'

  if (type === 'link') {
    const src = item?.src || ''
    const text = item?.text || ''
    const href = item?.href || ''
    if (!src && !text && !href) return null
    return { type, src, text, href }
  }

  const value = item?.value || ''
  if (!value) return null
  const href = type === 'email' ? `mailto:${value}` : `tel:${value.replace(/\s/g, '')}`
  return { type, value, href }
}

const sourceItems = rawItems || []

const contactItems = sourceItems
  .map(normalizeContact)
  .filter((item): item is ContactDisplayItem => Boolean(item))

const normalizeIconSrc = (src?: string) => {
  if (!src) return ''
  return src.startsWith('@/public') ? src.replace(/^@\/public/, '') : src
}

const hasTripleGrid = computed(() => contactItems.length > 0 && (contactItems.length % 3 === 0 || contactItems.length % 5 === 0))
</script>

<template>
  <div
    id="contacts"
    class="contacts"
  >
    <h3 class="title">
      {{ title }}
    </h3>

    <div
      class="lr-contacts"
      :class="{ 'lr-contacts--three': hasTripleGrid }"
    >
      <a
        v-for="item in contactItems"
        :key="item.href || (item.type === 'link' ? item.text : item.value)"
        class="contact-link"
        :href="item.href"
        :target="item.type === 'link' ? '_blank' : undefined"
        :rel="item.type === 'link' ? 'noopener' : undefined"
      >
        <NuxtImg
          v-if="item.type === 'link' && item.src"
          class="contact-icon"
          :src="normalizeIconSrc(item.src)"
          :alt="item.text || 'contact link'"
          :width="24"
          :height="24"
          loading="lazy"
        />
        <span class="base-text contact-text hover">
          {{ item.type === 'link' ? item.text : item.value }}
        </span>
      </a>
    </div>
  </div>
</template>

<style scoped>
.contacts {
  width: 100%;
  height: 24%;
  padding: 0 var(--padding-section-x) var(--padding-section-x);
  box-sizing: border-box;
  background-color: var(--strategix-dark);

  @media (--tablet-width) {
    width: 50%;
    height: 100%;
    padding: 0 0 0 var(--padding-section-x);
  }
}

.lr-contacts {
  width: 100%;
  height: fit-content;
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: calc(var(--vh) * 2);

  @media (--laptop-width) {
    width: 93%;
  }
}

@media (--laptop-width) {
  .lr-contacts--three {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.title {
  margin: calc(var(--vh) * 3.75) 0 calc(var(--vh) * 1.25);

  font-family: "Liberty-MT", "Onest", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  text-align: left;
  color: white;
  font-size: min(28px, calc(4.2vw + var(--vh) * 1.5));
  line-height: 110%;
  font-weight: 400;

  @media (--tablet-width) {
    width: 90%;
    font-size: clamp(28px, calc(2vw + var(--vh) * 1.5), 72px);
    margin: calc(var(--vh) * 5.75) 0;
  }

  @media(--mobile-medium){
    font-size: min(28px, calc(var(--vh) * 6));
  }
}

.contact-link {
  text-decoration: none;
  color: white;
  display: flex;
  align-items: center;
  gap: min(1vh, 8px);
}

.contact-icon {
  width: auto;
  height: min(80%, 28px);
  aspect-ratio: 1 / 1;
  flex-shrink: 0;

  @media(--mobile-medium){
    height: min(80%, 14px);
  }
}

.email-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 400;
  font-size: 50%;
  border: 1px solid white;
  border-radius: 50%;
}

.contact-text {
  font-size: min(16px, 4.1vw);
  font-weight: 400;
  line-height: 115%;
  text-wrap: nowrap;

  @media (--tablet-width) {
    font-size: clamp(16px, calc(0.8vw + var(--vh) * 0.6), 36px);
  }

  @media (--mobile-medium) {
    font-size: min(14px, calc(var(--vh) * 2.71));
  }
}
</style>

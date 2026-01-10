<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch, type Ref } from 'vue';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/shadcn/ui/alert';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { ButtonGroup } from '@/shared/ui/shadcn/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/ui/card';
import { Input } from '@/shared/ui/shadcn/ui/input';
import { ScrollArea, ScrollBar } from '@/shared/ui/shadcn/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/shadcn/ui/tabs';
import { Textarea } from '@/shared/ui/shadcn/ui/textarea';
import localesConfig from '@/content/locales.json';
import indexPageContent from '@/content/pages/index.json';
import Header from '@/widgets/header';
import Welcome from '@/widgets/welcome';
import AboutUs from '@/widgets/about-us';
import Services from '@/widgets/services';
import OurProjects from '@/widgets/our-projects';
import MarketResponse from '@/widgets/market-response';
import OurTeam from '@/widgets/our-team';
import LeaveRequest from '@/widgets/leave-request';
import Footer from '@/widgets/footer';

type LocaleConfig = { code: string; name: string; iso?: string }
type NavItem = { text: string; href: string }
type LocaleTranslation = Record<string, any>
type TranslationsMap = Record<string, LocaleTranslation>
type ServiceKey = 'reputation' | 'media' | 'branding' | 'production' | 'events' | 'aiMarketing' | 'ads'
type ContactItemType = 'link' | 'phone' | 'email'
type ContactItem = { type: ContactItemType; src?: string; text?: string; href?: string; value?: string }
type FooterIcon = { src?: string; href?: string }

const normalizeContactItem = (item: any): ContactItem => {
  const normalizedType: ContactItemType =
    item?.type === 'phone' || item?.type === 'email' ? item.type : 'link';

  if (normalizedType === 'link') {
    return {
      type: 'link',
      src: item?.src ?? '',
      text: item?.text ?? '',
      href: item?.href ?? '',
    };
  }

  return {
    type: normalizedType,
    value: item?.value ?? '',
  };
};

const contactUrlsToItems = (urls: Record<string, any>): ContactItem[] => {
  if (!urls || typeof urls !== 'object') return [];
  const items: ContactItem[] = [];

  if (typeof urls.email === 'string' && urls.email) {
    items.push({ type: 'email', value: urls.email });
  }

  if (typeof urls.phone === 'string' && urls.phone) {
    items.push({ type: 'phone', value: urls.phone });
  }

  const linkEntries = Object.entries(urls || {})
    .filter(([key, value]) => key.startsWith('url') && value && typeof value === 'object')
    .sort(([aKey], [bKey]) => {
      const aNum = Number(aKey.replace(/\D/g, '')) || 0;
      const bNum = Number(bKey.replace(/\D/g, '')) || 0;
      return aNum - bNum;
    });

  linkEntries.forEach(([, value]) => {
    const link = value as Record<string, any>;
    const src = link?.src ?? '';
    const text = link?.text ?? '';
    const href = link?.href ?? '';
    if (src || text || href) {
      items.push({ type: 'link', src, text, href });
    }
  });

  return items.map(normalizeContactItem);
};

const collectLegacyContactUrls = (contacts: Record<string, any>) => {
  const sourceUrls = contacts?.urls;
  const contactUrls: Record<string, any> = typeof sourceUrls === 'object' && sourceUrls ? { ...sourceUrls } : {};

  contactUrls.url1 = { ...(contactUrls.url1 || {}) };
  contactUrls.url2 = { ...(contactUrls.url2 || {}) };

  if (typeof contacts.email === 'string' && contacts.email && !contactUrls.email) {
    contactUrls.email = contacts.email;
  }
  if (typeof contacts.phone === 'string' && contacts.phone && !contactUrls.phone) {
    contactUrls.phone = contacts.phone;
  }
  if (contacts.telegram?.text && !contactUrls.url1.text) contactUrls.url1.text = contacts.telegram.text;
  if (contacts.telegram?.href && !contactUrls.url1.href) contactUrls.url1.href = contacts.telegram.href;
  if (contacts.whatsapp?.text && !contactUrls.url2.text) contactUrls.url2.text = contacts.whatsapp.text;
  if (contacts.whatsapp?.href && !contactUrls.url2.href) contactUrls.url2.href = contacts.whatsapp.href;

  contactUrls.url1.src ??= '';
  contactUrls.url2.src ??= '';

  return contactUrls;
};

const dropLegacyContactFields = (contacts: Record<string, any>) => {
  delete contacts.email;
  delete contacts.phone;
  delete contacts.telegram;
  delete contacts.whatsapp;
  delete contacts.urls;
};

const normalizeIconSrc = (src?: string) => {
  if (!src || typeof src !== 'string') return '';
  if (src.startsWith('@/public')) return src.replace(/^@\/public/, '');
  if (src.startsWith('./')) return src.replace(/^\.\//, '/');
  return src;
};

const normalizeFooterIconItem = (icon: any): FooterIcon => ({
  src: icon?.src || '',
  href: icon?.href || '',
});

const queueIconForDeletion = (src?: string) => {
  const normalized = normalizeIconSrc(src);
  if (!normalized || !normalized.startsWith('/icons/')) return;
  if (!pendingIconDeletes.value.includes(normalized)) {
    pendingIconDeletes.value.push(normalized);
  }
};

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const baseTranslations = (indexPageContent.translations || {}) as TranslationsMap;
const editedTranslations = ref<TranslationsMap>({});

const locales = computed<LocaleConfig[]>(() => localesConfig?.locales || []);
const initialActiveLocale = locales.value[0]?.code || Object.keys(baseTranslations)[0] || '';
const activeLocale = ref(initialActiveLocale);

const isSaving = ref(false);
const saveMessage = ref('');
const saveError = ref('');
let saveMessageFlashToken: symbol | null = null;
const uploadingMember = ref<number | null>(null);
const pendingImageDeletes = ref<string[]>([]);
const pendingIconDeletes = ref<string[]>([]);
const pendingMemberUploads = reactive(new Map<any, { file: File; preview: string }>());
const pendingMemberVersion = ref(0);
const uploadingContactIcon = ref<number | null>(null);
const pendingContactIconUploads = reactive(new Map<ContactItem, { file: File; preview: string }>());
const pendingContactIconVersion = ref(0);
const uploadingFooterIcon = ref<number | null>(null);
const pendingFooterIconUploads = reactive(new Map<FooterIcon, { file: File; preview: string }>());
const pendingFooterIconVersion = ref(0);
const pendingAgreePdfUploads = reactive(new Map<string, { file: File; name: string; oldHref?: string }>());
const pendingPrivacyPdfUploads = reactive(new Map<string, { file: File; name: string; oldHref?: string }>());
const agreePdfInputs = new Map<string, HTMLInputElement>();
const privacyPdfInputs = new Map<string, HTMLInputElement>();
const agreePdfUploading = ref(false);
const privacyPdfUploading = ref(false);

const flashSaveMessage = (message: string, duration = 5000) => {
  saveMessage.value = message;
  const token = Symbol('saveMessageFlash');
  saveMessageFlashToken = token;
  setTimeout(() => {
    if (saveMessageFlashToken !== token) return;
    if (saveMessage.value === message) {
      saveMessage.value = '';
    }
  }, duration);
};

const welcomeLinkMode = reactive<Record<string, 'urls' | 'flat'>>({});

const serviceCards: { key: ServiceKey; label: string }[] = [
  { key: 'reputation', label: 'Reputation' },
  { key: 'media', label: 'Media' },
  { key: 'branding', label: 'Branding' },
  { key: 'production', label: 'Production' },
  { key: 'events', label: 'Events' },
  { key: 'aiMarketing', label: 'AI Marketing' },
  { key: 'ads', label: 'Ads' },
];

const defaultSectionIds = ['#', '#about-us', '#services', '#our-projects', '#market-response', '#contacts', '#our-team', '#data-collection-form'];
const sectionIdLabelMap: Record<string, string> = {
  '#': 'Главная',
  '#about-us': 'О нас',
  '#services': 'Услуги',
  '#our-projects': 'Наши проекты',
  '#market-response': 'Ответы на вызовы',
  '#contacts': 'Контакты',
  '#our-team': 'Наша команда',
  '#data-collection-form': 'Форма сбора',
};
const getSectionLabel = (id: string) => sectionIdLabelMap[id] || id;

const ensureDefaults = (localeData: LocaleTranslation) => {
  localeData.header ??= {};
  const header = localeData.header;
  if (!Array.isArray(header.navigation_desktop)) header.navigation_desktop = [];
  header.button ??= { text: '', href: '#contacts' };
  header.mobile_menu ??= {};
  if (!Array.isArray(header.mobile_menu.navigation_mobile)) header.mobile_menu.navigation_mobile = [];
  if (header.mobile_menu.navigation_mobile.length === 0) {
    header.mobile_menu.navigation_mobile.push({ text: '', href: defaultSectionIds[0] });
  }
  header.mobile_menu.button ??= { text: '', href: header.button?.href || '#contacts' };

  localeData.welcome ??= {};
  const welcome = localeData.welcome;
  welcome.button ??= { text: '', href: '#contacts' };
  if (!welcome.urls || typeof welcome.urls !== 'object') {
    welcome.urls = {};
  }
  if (Array.isArray(welcome.urls)) {
    const normalized: Record<string, { text: string; href: string }> = {};
    welcome.urls.forEach((entry: any, idx: number) => {
      normalized[`button${idx + 1}`] = entry;
    });
    welcome.urls = normalized;
  }

  localeData.about_us ??= { title: '', items: [] };
  if (!Array.isArray(localeData.about_us.items)) localeData.about_us.items = [];
  if (localeData.about_us.items.length === 0) {
    localeData.about_us.items.push({ title: '', subtitle: '', content: '' });
  }

  localeData.services ??= { title: '' };
  const services = localeData.services;
  serviceCards.forEach(({ key }) => {
    services[key] ??= { title: '', description: '', lead: '', bullets: [''], text: '' };
    if (!Array.isArray(services[key].bullets) || services[key].bullets.length === 0) {
      services[key].bullets = [''];
    }
  });
  services.questions ??= { title: '', description: '', email: '' };

  localeData.our_projects ??= {};
  const projects = localeData.our_projects;
  projects.enable ??= false;
  projects.title ??= '';
  if (!Array.isArray(projects.filters) || projects.filters.length === 0) {
    projects.filters = [''];
  }

  localeData.market_response ??= { title: '', description1: '', description2: '' };

  localeData.our_team ??= { firstcard: { title: '', description: '' }, members: [], lastcard: { title: '', description: '', email: '' } };
  const team = localeData.our_team;
  team.firstcard ??= { title: '', description: '' };
  if (!Array.isArray(team.members)) team.members = [];
  team.lastcard ??= { title: '', description: '', email: '' };

  localeData.leave_request ??= { contacts: {}, form: {} };
  const contacts = localeData.leave_request.contacts ??= {};
  contacts.title ??= '';
  const contactUrls = collectLegacyContactUrls(contacts);
  const itemsSource = Array.isArray(contacts.items) && contacts.items.length
    ? contacts.items
    : contactUrlsToItems(contactUrls);
  contacts.items = (itemsSource || []).map(normalizeContactItem);
  dropLegacyContactFields(contacts);
  const form = localeData.leave_request.form ??= {};
  form.title ??= '';
  form.name ??= '';
  form.phone ??= '';
  form.title2 ??= '';
  form.question ??= '';
  form.question2 ??= '';
  form.button ??= '';
  const agree = form.agree ??= {};
  agree.text ??= '';
  agree.link ??= '';
  agree.href_pdf ??= '';

  localeData.footer ??= { brand: '', rights: '', privacy_policy: { text: '', href: '', href_pdf: '' }, email: '', icons: [] };
  const footer = localeData.footer;
  footer.privacy_policy ??= { text: '', href: '', href_pdf: '' };

  if (!Array.isArray(footer.icons)) footer.icons = [];
  const footerIcons = (footer.icons as any[]).map(normalizeFooterIconItem);
  while (footerIcons.length < 2) {
    footerIcons.push({ src: '', href: '' });
  }
  footer.icons = footerIcons;
};

const initializeTranslations = () => {
  const filled: TranslationsMap = {};
  const codes = locales.value.map((loc) => loc.code);

  codes.forEach((code) => {
    const source = baseTranslations[code] ? clone(baseTranslations[code]) : {};
    ensureDefaults(source);
    filled[code] = source;
    const welcome = source?.welcome || {};
    welcomeLinkMode[code] = welcome.urls ? 'urls' : 'flat';
  });

  Object.keys(baseTranslations).forEach((code) => {
    if (filled[code]) return;
    const source = clone(baseTranslations[code] || {});
    ensureDefaults(source);
    filled[code] = source;
    const welcome = source?.welcome || {};
    welcomeLinkMode[code] = welcome.urls ? 'urls' : 'flat';
  });

  editedTranslations.value = filled;
};

initializeTranslations();

const currentLocaleData = computed(() =>
  editedTranslations.value[activeLocale.value] ||
  editedTranslations.value[locales.value[0]?.code as string] ||
  ({} as LocaleTranslation),
);

const sectionIdOptions = computed(() => {
  const ids = new Set(defaultSectionIds);
  Object.values(editedTranslations.value).forEach((locale) => {
    const header = locale?.header || {};
    (header.navigation_desktop || []).forEach((item: NavItem) => item?.href && ids.add(item.href));
    (header.mobile_menu?.navigation_mobile || []).forEach((item: NavItem) => item?.href && ids.add(item.href));
  });
  return Array.from(ids).filter((id) => id !== '#welcome');
});

const desktopNavCharCount = computed(() =>
  (currentLocaleData.value.header.navigation_desktop || []).reduce(
    (acc: number, item: NavItem) => acc + (item?.text?.length || 0),
    0,
  ),
);
const desktopNavError = computed(() => desktopNavCharCount.value > 40);
const hasBlockingErrors = computed(() => desktopNavError.value);

const hasLongWord = (text: string) => /\S{11,}/.test(text || '');
const mobileNavWarnings = computed(() =>
  (currentLocaleData.value.header.mobile_menu.navigation_mobile || []).map((item: NavItem) =>
    hasLongWord(item?.text || ''),
  ),
);

const welcomeButtonsList = computed(() => {
  const welcome = currentLocaleData.value.welcome;
  const container = welcomeLinkMode[activeLocale.value] === 'urls' ? welcome.urls : welcome;
  const entries = Object.entries(container || {}).filter(
    ([key, value]) => /^button\d+/.test(key) && value && typeof value === 'object',
  );
  return entries.map(([key, value]) => ({ key, value: value as { text: string; href: string } }));
});

const agreePdfUrl = computed(() => {
  const href = currentLocaleData.value.leave_request?.form?.agree?.href_pdf || '';
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return href;
  const normalized = href.replace(/^\.\//, '');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
});

const agreePdfFileName = computed(() => {
  const url = agreePdfUrl.value;
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1] || '';
});

const pendingAgreePdfName = computed(() => {
  const pending = pendingAgreePdfUploads.get(activeLocale.value);
  return pending?.name || '';
});

const agreePdfIsSameOrigin = computed(() => !!agreePdfUrl.value && agreePdfUrl.value.startsWith('/'));
const agreePdfIsPublic = computed(() => agreePdfUrl.value.startsWith('/pdf/'));

const privacyPdfUrl = computed(() => {
  const href = currentLocaleData.value.footer?.privacy_policy?.href_pdf || '';
  if (!href) return '';
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return href;
  const normalized = href.replace(/^\.\//, '');
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
});

const privacyPdfFileName = computed(() => {
  const url = privacyPdfUrl.value;
  if (!url) return '';
  const parts = url.split('/');
  return parts[parts.length - 1] || '';
});

const pendingPrivacyPdfName = computed(() => {
  const pending = pendingPrivacyPdfUploads.get(activeLocale.value);
  return pending?.name || '';
});

const privacyPdfIsSameOrigin = computed(() => !!privacyPdfUrl.value && privacyPdfUrl.value.startsWith('/'));
const privacyPdfIsPublic = computed(() => privacyPdfUrl.value.startsWith('/pdf/'));

const agreePdfExists = ref<boolean | null>(null);
const privacyPdfExists = ref<boolean | null>(null);
const lastCheckedPdfUrl: Record<'agree' | 'privacy', string> = { agree: '', privacy: '' };

const checkPdfExists = async (url: string, target: Ref<boolean | null>, key: 'agree' | 'privacy') => {
  target.value = null;
  lastCheckedPdfUrl[key] = url;

  if (!url) return;
  const isSameOrigin = url.startsWith('/');
  if (!isSameOrigin) return;

  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (lastCheckedPdfUrl[key] !== url) return;
    const contentType = response.headers.get('content-type') || '';
    const isPdf = contentType.includes('pdf');
    target.value = response.ok && isPdf;
  } catch {
    if (lastCheckedPdfUrl[key] !== url) return;
    target.value = false;
  }
};

const appendLocaleToFileName = (name: string, locale: string) => {
  const lastDot = name.lastIndexOf('.');
  if (lastDot <= 0) return `${name}_${locale}`;
  const base = name.slice(0, lastDot);
  const ext = name.slice(lastDot);
  return `${base}_${locale}${ext}`;
};

const setAgreePdfInputRef = (locale: string, el: HTMLInputElement | null) => {
  if (el) {
    agreePdfInputs.set(locale, el);
  } else {
    agreePdfInputs.delete(locale);
  }
};

const getAgreePdfInput = (locale?: string) => agreePdfInputs.get(locale || activeLocale.value) || null;

const setPrivacyPdfInputRef = (locale: string, el: HTMLInputElement | null) => {
  if (el) {
    privacyPdfInputs.set(locale, el);
  } else {
    privacyPdfInputs.delete(locale);
  }
};

const getPrivacyPdfInput = (locale?: string) => privacyPdfInputs.get(locale || activeLocale.value) || null;

const normalizeIndex = (index: number | string) => {
  const normalized = typeof index === 'string' ? Number(index) : index;
  return Number.isInteger(normalized) ? normalized : null;
};

const addDesktopNav = () => {
  const header = currentLocaleData.value.header;
  header.navigation_desktop.push({ text: '', href: sectionIdOptions.value[0] || '#header' });
};

const removeDesktopNav = (index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const nav = currentLocaleData.value.header.navigation_desktop;
  nav.splice(idx, 1);
};

const addMobileNav = () => {
  const nav = currentLocaleData.value.header.mobile_menu.navigation_mobile;
  if (nav.length >= 5) return;
  nav.push({ text: '', href: sectionIdOptions.value[0] || '#header' });
};

const removeMobileNav = (index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const nav = currentLocaleData.value.header.mobile_menu.navigation_mobile;
  if (nav.length <= 1) return;
  nav.splice(idx, 1);
};

const addWelcomeLink = () => {
  const welcome = currentLocaleData.value.welcome;
  const container = welcomeLinkMode[activeLocale.value] === 'urls' ? welcome.urls : welcome;
  const nextIndex = Object.keys(container || {}).filter((key) => key.startsWith('button')).length + 1;
  container[`button${nextIndex}`] = { text: '', href: '' };
};

const removeWelcomeLink = (key: string) => {
  const welcome = currentLocaleData.value.welcome;
  const container = welcomeLinkMode[activeLocale.value] === 'urls' ? welcome.urls : welcome;
  delete container[key];
};

const addAboutItem = () => {
  currentLocaleData.value.about_us.items.push({ title: '', subtitle: '', content: '' });
};

const removeAboutItem = (index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const items = currentLocaleData.value.about_us.items;
  if (items.length <= 1) return;
  items.splice(idx, 1);
};

const moveAboutItem = (index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const items = currentLocaleData.value.about_us.items;
  const targetIndex = idx + direction;
  if (targetIndex < 0 || targetIndex >= items.length) return;
  const [item] = items.splice(idx, 1);
  items.splice(targetIndex, 0, item);
};

const moveDesktopNav = (index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const items = currentLocaleData.value.header.navigation_desktop;
  const target = idx + direction;
  if (target < 0 || target >= items.length) return;
  const [item] = items.splice(idx, 1);
  items.splice(target, 0, item);
};

const moveMobileNav = (index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const items = currentLocaleData.value.header.mobile_menu.navigation_mobile;
  const target = idx + direction;
  if (target < 0 || target >= items.length) return;
  const [item] = items.splice(idx, 1);
  items.splice(target, 0, item);
};

const addServiceBullet = (key: ServiceKey) => {
  const bullets = currentLocaleData.value.services[key].bullets;
  bullets.push('');
};

const moveServiceBullet = (key: ServiceKey, index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const bullets = currentLocaleData.value.services[key].bullets;
  const target = idx + direction;
  if (target < 0 || target >= bullets.length) return;
  const [item] = bullets.splice(idx, 1);
  bullets.splice(target, 0, item);
};

const removeServiceBullet = (key: ServiceKey, index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const bullets = currentLocaleData.value.services[key].bullets;
  if (bullets.length <= 1) return;
  bullets.splice(idx, 1);
};

const addContactLink = () => {
  const items = currentLocaleData.value.leave_request.contacts.items;
  items.push({ type: 'link', src: '', text: '', href: '' });
};

const addContactPhone = () => {
  const items = currentLocaleData.value.leave_request.contacts.items;
  items.push({ type: 'phone', value: '' });
};

const addContactEmail = () => {
  const items = currentLocaleData.value.leave_request.contacts.items;
  items.push({ type: 'email', value: '' });
};

const moveContactItem = (index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const items = currentLocaleData.value.leave_request.contacts.items;
  const target = idx + direction;
  if (target < 0 || target >= items.length) return;
  const [item] = items.splice(idx, 1);
  items.splice(target, 0, item);
};

const removeContactItem = (index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const items = currentLocaleData.value.leave_request.contacts.items;
  const contact = items[idx];
  if (contact?.type === 'link') {
    queueIconForDeletion(contact?.src);
    const pending = pendingContactIconUploads.get(contact);
    if (pending?.preview) {
      URL.revokeObjectURL(pending.preview);
    }
    pendingContactIconUploads.delete(contact);
    pendingContactIconVersion.value += 1;
  }
  items.splice(idx, 1);
};

const getContactIconSrc = (contact: ContactItem) => {
  pendingContactIconVersion.value;
  const pending = pendingContactIconUploads.get(contact);
  return pending?.preview || normalizeIconSrc(contact?.src);
};

const hasPendingContactIcon = (contact: ContactItem) => pendingContactIconUploads.has(contact);

const uploadContactIcon = (
  index: number | string,
  fileList: FileList | null,
  inputEl?: HTMLInputElement | null,
) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const contact = currentLocaleData.value.leave_request.contacts.items[idx];
  if (!contact || contact.type !== 'link') return;
  const file = fileList?.[0];
  if (!file) return;

  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  if (!isSvg) {
    saveError.value = 'Загрузите иконку в формате SVG.';
    saveMessage.value = '';
    if (inputEl) inputEl.value = '';
    return;
  }

  const existing = pendingContactIconUploads.get(contact);
  if (existing?.preview) {
    URL.revokeObjectURL(existing.preview);
  }
  const preview = URL.createObjectURL(file);
  pendingContactIconUploads.set(contact, { file, preview });
  pendingContactIconVersion.value += 1;
  flashSaveMessage('Иконка выбрана, загрузится после сохранения');
  saveError.value = '';
  if (inputEl) inputEl.value = '';
};

const addFooterIcon = () => {
  currentLocaleData.value.footer.icons.push({ src: '', href: '' });
};

const moveFooterIcon = (index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const icons = currentLocaleData.value.footer.icons;
  const target = idx + direction;
  if (target < 0 || target >= icons.length) return;
  const [item] = icons.splice(idx, 1);
  icons.splice(target, 0, item);
};

const removeFooterIcon = (index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const icons = currentLocaleData.value.footer.icons;
  const icon = icons[idx];
  queueIconForDeletion(icon?.src);
  const pending = pendingFooterIconUploads.get(icon);
  if (pending?.preview) {
    URL.revokeObjectURL(pending.preview);
  }
  pendingFooterIconUploads.delete(icon);
  pendingFooterIconVersion.value += 1;
  icons.splice(idx, 1);
};

const getFooterIconSrc = (icon: FooterIcon) => {
  pendingFooterIconVersion.value;
  const pending = pendingFooterIconUploads.get(icon);
  return pending?.preview || normalizeIconSrc(icon?.src);
};

const hasPendingFooterIcon = (icon: FooterIcon) => pendingFooterIconUploads.has(icon);

const uploadFooterIcon = (
  index: number | string,
  fileList: FileList | null,
  inputEl?: HTMLInputElement | null,
) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const icons = currentLocaleData.value.footer.icons;
  const icon = icons[idx];
  if (!icon) return;
  const file = fileList?.[0];
  if (!file) return;

  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  if (!isSvg) {
    saveError.value = 'Загрузите иконку в формате SVG.';
    saveMessage.value = '';
    if (inputEl) inputEl.value = '';
    return;
  }

  const existing = pendingFooterIconUploads.get(icon);
  if (existing?.preview) {
    URL.revokeObjectURL(existing.preview);
  }
  const preview = URL.createObjectURL(file);
  pendingFooterIconUploads.set(icon, { file, preview });
  pendingFooterIconVersion.value += 1;
  flashSaveMessage('Иконка выбрана, загрузится после сохранения');
  saveError.value = '';
  if (inputEl) inputEl.value = '';
};

const addTeamMember = () => {
  currentLocaleData.value.our_team.members.push({ src: '', name: '', lastname: '', position: '' });
};

const moveTeamMember = (index: number | string, direction: number) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const members = currentLocaleData.value.our_team.members;
  const target = idx + direction;
  if (target < 0 || target >= members.length) return;
  const [item] = members.splice(idx, 1);
  members.splice(target, 0, item);
};

const removeTeamMember = (index: number | string) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const members = currentLocaleData.value.our_team.members;
  const member = members[idx];
  const src = member?.src;
  const pending = pendingMemberUploads.get(member);
  if (pending?.preview) {
    URL.revokeObjectURL(pending.preview);
  }
  pendingMemberUploads.delete(member);
  pendingMemberVersion.value += 1;
  members.splice(idx, 1);
  if (src && src.startsWith('/images/') && !pendingImageDeletes.value.includes(src)) {
    pendingImageDeletes.value.push(src);
  }
};

const getMemberImage = (member: any) => {
  pendingMemberVersion.value;
  const pending = pendingMemberUploads.get(member);
  return pending?.preview || member?.src || '';
};

const hasPendingUpload = (member: any) => pendingMemberUploads.has(member);

const openAgreePdf = () => {
  if (!agreePdfUrl.value || typeof window === 'undefined') return;
  window.open(agreePdfUrl.value, '_blank', 'noopener');
};

const openPrivacyPdf = () => {
  if (!privacyPdfUrl.value || typeof window === 'undefined') return;
  window.open(privacyPdfUrl.value, '_blank', 'noopener');
};

const triggerAgreePdfUpload = (locale?: string) => {
  const inputEl = getAgreePdfInput(locale);
  if (!inputEl) {
    saveError.value = 'Поле выбора файла недоступно. Обновите страницу и попробуйте ещё раз.';
    return;
  }
  inputEl.click();
};

const handleAgreePdfSelected = (locale: string, fileList: FileList | null) => {
  const file = fileList?.[0];
  if (!file) return;
  const targetLocaleData = editedTranslations.value[locale];
  if (!targetLocaleData) return;
  const targetInput = getAgreePdfInput(locale);

  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    saveError.value = 'Загрузите файл в формате PDF.';
    saveMessage.value = '';
    if (targetInput) targetInput.value = '';
    return;
  }

  const nameWithLocale = appendLocaleToFileName(file.name, locale);
  const renamedFile = new File([file], nameWithLocale, { type: file.type || 'application/pdf' });
  const currentHref = targetLocaleData.leave_request?.form?.agree?.href_pdf;

  pendingAgreePdfUploads.set(locale, { file: renamedFile, name: nameWithLocale, oldHref: currentHref });
  flashSaveMessage('PDF выбран, загрузится после сохранения');
  saveError.value = '';

  if (targetInput) targetInput.value = '';
};

const triggerPrivacyPdfUpload = (locale?: string) => {
  const inputEl = getPrivacyPdfInput(locale);
  if (!inputEl) {
    saveError.value = 'Поле выбора файла недоступно. Обновите страницу и попробуйте ещё раз.';
    return;
  }
  inputEl.click();
};

const handlePrivacyPdfSelected = (locale: string, fileList: FileList | null) => {
  const file = fileList?.[0];
  if (!file) return;
  const targetLocaleData = editedTranslations.value[locale];
  if (!targetLocaleData) return;
  const targetInput = getPrivacyPdfInput(locale);

  if (file.type && file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    saveError.value = 'Загрузите файл в формате PDF.';
    saveMessage.value = '';
    if (targetInput) targetInput.value = '';
    return;
  }

  const nameWithLocale = appendLocaleToFileName(file.name, locale);
  const renamedFile = new File([file], nameWithLocale, { type: file.type || 'application/pdf' });
  const currentHref = targetLocaleData.footer?.privacy_policy?.href_pdf;

  pendingPrivacyPdfUploads.set(locale, { file: renamedFile, name: nameWithLocale, oldHref: currentHref });
  flashSaveMessage('PDF выбран, загрузится после сохранения');
  saveError.value = '';

  if (targetInput) targetInput.value = '';
};

const uploadMemberImage = (index: number | string, fileList: FileList | null) => {
  const idx = normalizeIndex(index);
  if (idx === null) return;
  const file = fileList?.[0];
  if (!file) return;
  const member = currentLocaleData.value.our_team.members[idx];
  if (!member) return;
  const existing = pendingMemberUploads.get(member);
  if (existing?.preview) {
    URL.revokeObjectURL(existing.preview);
  }
  const preview = URL.createObjectURL(file);
  pendingMemberUploads.set(member, { file, preview });
  pendingMemberVersion.value += 1;
  flashSaveMessage('Фото выбрано, загрузится после сохранения');
};

const updateLayoutMetrics = () => {
  if (typeof window === 'undefined') return;
  const vw = window.innerWidth || 1;
  const gap = 1;
  const panelWidth = Math.min(450, Math.max(300, vw * 0.28));
  const available = Math.max(0, vw - (panelWidth + gap));
  const scale = Math.min(0.9, Math.max(0.55, available / vw));

  const root = document.documentElement;
  root.style.setProperty('--cms-panel-width', `${panelWidth}px`);
  root.style.setProperty('--cms-panel-gap', `${gap}px`);
  root.style.setProperty('--cms-scale', scale.toString());
};

if (typeof window !== 'undefined') {
  watch(
    agreePdfUrl,
    (url) => {
      checkPdfExists(url, agreePdfExists, 'agree');
    },
    { immediate: true },
  );

  watch(
    privacyPdfUrl,
    (url) => {
      checkPdfExists(url, privacyPdfExists, 'privacy');
    },
    { immediate: true },
  );
}

onMounted(() => {
  updateLayoutMetrics();
  window.addEventListener('resize', updateLayoutMetrics, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateLayoutMetrics);
  pendingMemberUploads.forEach((value) => {
    if (value.preview) URL.revokeObjectURL(value.preview);
  });
  pendingContactIconUploads.forEach((value) => {
    if (value.preview) URL.revokeObjectURL(value.preview);
  });
  pendingContactIconUploads.clear();
  pendingFooterIconUploads.forEach((value) => {
    if (value.preview) URL.revokeObjectURL(value.preview);
  });
  pendingFooterIconUploads.clear();
  pendingAgreePdfUploads.clear();
  pendingPrivacyPdfUploads.clear();
  agreePdfInputs.clear();
  privacyPdfInputs.clear();
});

const inputClass = 'h-8 px-3 py-2 text-sm leading-tight w-full box-border';
const selectTriggerClass = 'h-8 w-full justify-between';
const textareaClass = 'w-full box-border resize-vertical min-h-[88px] px-3 py-2 text-sm leading-tight';
const rowTwoCols = 'grid w-full box-border grid-cols-[43%_55%] gap-[2%] items-center';

const collapsed = reactive<Record<string, boolean>>({});

const isCollapsed = (key: string) => collapsed[key] ?? true;
const toggleSection = (key: string) => {
  collapsed[key] = !isCollapsed(key);
};

const syncContactsItems = () => {
  Object.values(editedTranslations.value).forEach((locale) => {
    const contacts = locale?.leave_request?.contacts;
    if (!contacts) return;

    const hasItems = Array.isArray(contacts.items) && contacts.items.length > 0;
    if (!hasItems) {
      contacts.items = contactUrlsToItems(collectLegacyContactUrls(contacts));
    } else {
      contacts.items = contacts.items.map((item: ContactItem) => {
        const normalized = normalizeContactItem(item);
        Object.assign(item, normalized);
        if (item.type !== 'link') {
          item.src = '';
          item.text = '';
          item.href = '';
        } else {
          item.value = '';
        }
        return item;
      });
    }

    dropLegacyContactFields(contacts);
  });
};

const syncFooterIcons = () => {
  Object.values(editedTranslations.value).forEach((locale) => {
    const footer = locale?.footer;
    if (!footer) return;
    if (!Array.isArray(footer.icons)) {
      footer.icons = [];
    }
    footer.icons = (footer.icons as any[]).map(normalizeFooterIconItem);
    while (footer.icons.length < 2) {
      footer.icons.push({ src: '', href: '' });
    }
  });
};

const collectUsedIconSources = (translations: TranslationsMap) => {
  const sources = new Set<string>();
  Object.values(translations || {}).forEach((locale) => {
    if (!locale) return;
    const contacts = locale?.leave_request?.contacts?.items;
    if (Array.isArray(contacts)) {
      contacts.forEach((item: ContactItem) => {
        if (!item || item.type !== 'link') return;
        const normalized = normalizeIconSrc(item.src);
        if (normalized && normalized.startsWith('/icons/')) {
          sources.add(normalized);
        }
      });
    }
    const footerIcons = locale?.footer?.icons;
    if (Array.isArray(footerIcons)) {
      footerIcons.forEach((icon: FooterIcon) => {
        const normalized = normalizeIconSrc(icon?.src);
        if (normalized && normalized.startsWith('/icons/')) {
          sources.add(normalized);
        }
      });
    }
  });
  return sources;
};

const saveIndex = async () => {
  if (hasBlockingErrors.value) {
    saveError.value = 'Сначала исправьте ошибки перед сохранением.';
    return;
  }
  isSaving.value = true;
  saveMessage.value = '';
  saveError.value = '';
  try {
    const contactItems = Array.isArray(currentLocaleData.value.leave_request.contacts.items)
      ? currentLocaleData.value.leave_request.contacts.items
      : [];

    for (const [index, contact] of contactItems.entries()) {
      if (!contact || contact.type !== 'link') continue;
      const pendingIcon = pendingContactIconUploads.get(contact);
      if (!pendingIcon) continue;
      uploadingContactIcon.value = index;
      const formData = new FormData();
      formData.append('file', pendingIcon.file);
      formData.append('targetDir', 'icons');
      const oldSrc = normalizeIconSrc(contact.src);
      if (oldSrc && !/^https?:\/\//i.test(oldSrc)) {
        formData.append('oldSrc', oldSrc);
      }

      const responseUploadIcon = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });

      if (!responseUploadIcon.ok) {
        const text = await responseUploadIcon.text().catch(() => '');
        throw new Error(text || `Не удалось загрузить иконку (${responseUploadIcon.status})`);
      }

      const uploadIconData = await responseUploadIcon.json();
      contact.src = uploadIconData.path;
      if (pendingIcon.preview) URL.revokeObjectURL(pendingIcon.preview);
      pendingContactIconUploads.delete(contact);
      pendingContactIconVersion.value += 1;
      uploadingContactIcon.value = null;
    }

    const footerIcons = Array.isArray(currentLocaleData.value.footer.icons)
      ? currentLocaleData.value.footer.icons
      : [];

    for (const [index, icon] of footerIcons.entries()) {
      const pendingIcon = pendingFooterIconUploads.get(icon);
      if (!pendingIcon) continue;
      uploadingFooterIcon.value = index;
      const formData = new FormData();
      formData.append('file', pendingIcon.file);
      formData.append('targetDir', 'icons');
      const oldSrc = normalizeIconSrc(icon.src);
      if (oldSrc && !/^https?:\/\//i.test(oldSrc)) {
        formData.append('oldSrc', oldSrc);
      }

      const responseUploadFooterIcon = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });

      if (!responseUploadFooterIcon.ok) {
        const text = await responseUploadFooterIcon.text().catch(() => '');
        throw new Error(text || `Не удалось загрузить иконку (${responseUploadFooterIcon.status})`);
      }

      const uploadFooterIconData = await responseUploadFooterIcon.json();
      icon.src = uploadFooterIconData.path;
      if (pendingIcon.preview) URL.revokeObjectURL(pendingIcon.preview);
      pendingFooterIconUploads.delete(icon);
      pendingFooterIconVersion.value += 1;
      uploadingFooterIcon.value = null;
    }

    // Сначала заливаем все новые изображения участников
    for (const member of currentLocaleData.value.our_team.members) {
      const pending = pendingMemberUploads.get(member);
      if (!pending) continue;
      uploadingMember.value = currentLocaleData.value.our_team.members.indexOf(member);
      const formData = new FormData();
      formData.append('file', pending.file);
      if (member.src) {
        formData.append('oldSrc', member.src);
      }
      const responseUpload = await fetch('/api/cms/upload', {
        method: 'POST',
        body: formData,
      });
      if (!responseUpload.ok) {
        const text = await responseUpload.text().catch(() => '');
        throw new Error(text || `Не удалось загрузить файл (${responseUpload.status})`);
      }
      const uploadData = await responseUpload.json();
      member.src = uploadData.path;
      if (pending.preview) URL.revokeObjectURL(pending.preview);
      pendingMemberUploads.delete(member);
      pendingMemberVersion.value += 1;
      uploadingMember.value = null;
    }

    const pendingAgreeEntries = Array.from(pendingAgreePdfUploads.entries());
    if (pendingAgreeEntries.length) {
      agreePdfUploading.value = true;
    }

    for (const [locale, pending] of pendingAgreeEntries) {
      const formData = new FormData();
      formData.append('file', pending.file);
      if (pending.oldHref) {
        formData.append('oldSrc', pending.oldHref);
      }

      const responsePdf = await fetch('/api/cms/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!responsePdf.ok) {
        const text = await responsePdf.text().catch(() => '');
        throw new Error(text || `Не удалось загрузить PDF (${responsePdf.status})`);
      }

      const uploadPdfData = await responsePdf.json();
      const localeData = editedTranslations.value[locale];
      if (localeData?.leave_request?.form?.agree) {
        localeData.leave_request.form.agree.href_pdf = uploadPdfData.path;
      }
      pendingAgreePdfUploads.delete(locale);
    }

    const pendingPrivacyEntries = Array.from(pendingPrivacyPdfUploads.entries());
    if (pendingPrivacyEntries.length) {
      privacyPdfUploading.value = true;
    }

    for (const [locale, pending] of pendingPrivacyEntries) {
      const formData = new FormData();
      formData.append('file', pending.file);
      if (pending.oldHref) {
        formData.append('oldSrc', pending.oldHref);
      }

      const responsePdf = await fetch('/api/cms/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!responsePdf.ok) {
        const text = await responsePdf.text().catch(() => '');
        throw new Error(text || `Не удалось загрузить PDF (${responsePdf.status})`);
      }

      const uploadPdfData = await responsePdf.json();
      const localeData = editedTranslations.value[locale];
      if (localeData?.footer?.privacy_policy) {
        localeData.footer.privacy_policy.href_pdf = uploadPdfData.path;
      }
      pendingPrivacyPdfUploads.delete(locale);
    }

    syncContactsItems();
    syncFooterIcons();

    const translationsPayload = clone(editedTranslations.value);
    const payload = { ...indexPageContent, translations: translationsPayload };
    const usedIconSources = collectUsedIconSources(translationsPayload);
    const response = await fetch('/api/cms', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Ошибка сохранения (${response.status})`);
    }

    saveMessage.value = 'Сохранено в файл';

    if (pendingIconDeletes.value.length) {
      const toDeleteIcons = Array.from(new Set(
        pendingIconDeletes.value
          .map((src) => normalizeIconSrc(src))
          .filter((src): src is string => !!src && src.startsWith('/icons/')),
      )).filter((src) => !usedIconSources.has(src));

      pendingIconDeletes.value = [];

      for (const src of toDeleteIcons) {
        try {
          await fetch('/api/cms/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ src }),
          });
        } catch (error: any) {
          saveError.value = error?.message || 'Не удалось удалить файл иконки.';
        }
      }
    }

    if (pendingImageDeletes.value.length) {
      const toDelete = [...pendingImageDeletes.value];
      pendingImageDeletes.value = [];
      for (const src of toDelete) {
        try {
          await fetch('/api/cms/delete-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ src }),
          });
        } catch (error: any) {
          // не блокируем сохранение, только показываем сообщение
          saveError.value = error?.message || 'Не удалось удалить файл изображения.';
        }
      }
    }
  } catch (error: any) {
    saveError.value = error?.data?.message || error?.message || 'Не удалось сохранить изменения.';
  } finally {
    agreePdfUploading.value = false;
    privacyPdfUploading.value = false;
    uploadingMember.value = null;
    uploadingContactIcon.value = null;
    uploadingFooterIcon.value = null;
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="main">
    <Header />
    <main>
      <Welcome />
      <AboutUs />
      <Services />
      <OurProjects />
      <MarketResponse />
      <OurTeam />
      <LeaveRequest />
    </main>
    <Footer />
  </div>
  <div class="edit-json">
    <ScrollArea class="w-full h-full">
      <div class="edit-card p-3 box-border">
        <div class="flex items-center justify-between gap-2">
          <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            index.json
          </p>
          <span class="text-[11px] text-muted-foreground/80">
            {{ activeLocale }}
          </span>
        </div>

        <Tabs
          v-model:model-value="activeLocale"
          class="space-y-3"
        >
          <TabsList class="flex flex-wrap justify-start sbg-muted/70 p-3 gap-2 bg-[hsl(var(--card))]">
            <TabsTrigger
              v-for="tab in locales"
              :key="tab.code"
              :value="tab.code"
              class="w-19 flex items-center text-sm bg-[var(--background)] hover"
            >
              <span class="font-semibold mr-1">{{ tab.name }}</span>
              <span class="text-[11px] text-muted-foreground">({{ tab.code }})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent
            v-for="tab in locales"
            :key="`panel-${tab.code}`"
            :value="tab.code"
            class="space-y-3"
          >
            <Card>
              <CardHeader class="flex flex-row items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Header
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('header')"
                    aria-label="Toggle header"
                    @click="toggleSection('header')"
                  >
                    {{ isCollapsed('header') ? '▼' : '▲' }}
                  </button>
                </div>
                <span class="text-[11px] text-muted-foreground">
                  Навигация: {{ desktopNavCharCount }}/40
                </span>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('header')"
              >
                <CardContent class="space-y-4">
                  <div>
                    <div class="mb-1 text-sm font-medium text-foreground">
                      Навигация на пк
                    </div>
                    <Alert
                      v-if="desktopNavError"
                      variant="destructive"
                      class="my-4 box-border"
                    >
                      <AlertTitle class="mt-1">
                        Лимит 40 символов
                      </AlertTitle>
                      <AlertDescription>
                        Превышено 40 символов. Удалите пункт или сократите текст.
                      </AlertDescription>
                    </Alert>
                    <div class="space-y-2">
                      <div
                        v-for="(item, index) in currentLocaleData.header.navigation_desktop"
                        :key="`nav-${index}`"
                        class="row-wrap"
                      >
                        <div :class="rowTwoCols">
                          <Input
                            v-model="item.text"
                            :class="inputClass"
                            placeholder="Текст"
                          />
                          <Select v-model="item.href">
                            <SelectTrigger :class="selectTriggerClass">
                              <SelectValue placeholder="Секция" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                v-for="id in sectionIdOptions"
                                :key="id"
                                :value="id"
                              >
                                {{ getSectionLabel(id) }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div class="action-stack">
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === 0"
                            @click="moveDesktopNav(index, -1)"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === currentLocaleData.header.navigation_desktop.length - 1"
                            @click="moveDesktopNav(index, 1)"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            @click="removeDesktopNav(index)"
                          >
                            −
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      class="mt-2 h-8 w-full hover"
                      @click="addDesktopNav"
                    >
                      + Пункт
                    </Button>
                  </div>

                  <div class="space-y-2">
                    <p class="text-sm font-medium text-foreground">
                      Кнопка ведущая к форме на пк
                    </p>
                    <Input
                      v-model="currentLocaleData.header.button.text"
                      :class="inputClass"
                      placeholder="Текст кнопки"
                    />
                  </div>

                  <div>
                    <div class="mb-1 flex items-center justify-between">
                      <p class="text-sm font-medium text-foreground">
                        Навигация в боковом меню на телефоне
                      </p>
                      <p class="text-[11px] text-muted-foreground">
                        {{ currentLocaleData.header.mobile_menu.navigation_mobile.length }}/5
                      </p>
                    </div>
                    <div class="space-y-2">
                      <div
                        v-for="(item, index) in currentLocaleData.header.mobile_menu.navigation_mobile"
                        :key="`mobile-${index}`"
                        class="row-wrap"
                      >
                        <div
                          :class="rowTwoCols"
                          class="items-start"
                        >
                          <Input
                            v-model="item.text"
                            :class="inputClass"
                            placeholder="Текст"
                          />
                          <Select v-model="item.href">
                            <SelectTrigger :class="selectTriggerClass">
                              <SelectValue placeholder="Секция" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                v-for="id in sectionIdOptions"
                                :key="id"
                                :value="id"
                              >
                                {{ getSectionLabel(id) }}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Alert
                            v-if="mobileNavWarnings[index]"
                            class="border-amber-200 bg-amber-50 text-amber-800 w-full col-span-2 box-border my-2"
                          >
                            <AlertDescription class="text-[11px]">
                              >10 символов подряд без пробелов — вёрстка может поехать.
                            </AlertDescription>
                          </Alert>
                        </div>
                        <div class="action-stack">
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === 0"
                            @click="moveMobileNav(index, -1)"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === currentLocaleData.header.mobile_menu.navigation_mobile.length - 1"
                            @click="moveMobileNav(index, 1)"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="currentLocaleData.header.mobile_menu.navigation_mobile.length <= 1"
                            @click="removeMobileNav(index)"
                          >
                            −
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      class="mt-2 h-8 w-full hover"
                      :disabled="currentLocaleData.header.mobile_menu.navigation_mobile.length >= 5"
                      @click="addMobileNav"
                    >
                      + Пункт
                    </Button>
                  </div>

                  <div class="space-y-2">
                    <p class=" text-sm font-medium text-foreground">
                      Кнопка ведущая к форме в боковом меню на телефоне
                    </p>
                    <Input
                      v-model="currentLocaleData.header.mobile_menu.button.text"
                      placeholder="Текст кнопки"
                      :class="inputClass"
                    />
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Welcome
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('welcome')"
                    aria-label="Toggle welcome"
                    @click="toggleSection('welcome')"
                  >
                    {{ isCollapsed('welcome') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('welcome')"
              >
                <CardContent class="space-y-4">
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-foreground">
                      Заголовок
                    </p>
                    <Textarea
                      v-model="currentLocaleData.welcome.title"
                      :class="textareaClass"
                      placeholder="Текст заголовка"
                    />
                  </div>
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-foreground">
                      Подзаголовок
                    </p>
                    <Textarea
                      v-model="currentLocaleData.welcome.subtitle"
                      :class="textareaClass"
                      placeholder="Текст подзаголовка"
                    />
                  </div>
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-foreground">
                      Кнопка ведущая на форму заолнения
                    </p>
                    <Input
                      v-model="currentLocaleData.welcome.button.text"
                      :class="inputClass"
                      placeholder="Текст кнопки"
                    />
                  </div>

                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-foreground">
                        Кнопки со ссылками
                      </p>
                      <p class="text-[11px] text-muted-foreground">
                        {{ welcomeButtonsList.length }} шт.
                      </p>
                    </div>
                    <div class="space-y-2">
                      <div
                        v-for="link in welcomeButtonsList"
                        :key="link.key"
                        class="row-wrap"
                      >
                        <div :class="rowTwoCols">
                          <Input
                            v-model="link.value.text"
                            :class="inputClass"
                            placeholder="Текст"
                          />
                          <Input
                            v-model="link.value.href"
                            :class="inputClass"
                            placeholder="Ссылка"
                          />
                        </div>
                        <div class="action-stack">
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            @click="removeWelcomeLink(link.key)"
                          >
                            −
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="secondary"
                      class="h-8 w-full hover"
                      @click="addWelcomeLink"
                    >
                      + Кнопка
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    About us
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('about_us')"
                    aria-label="Toggle about us"
                    @click="toggleSection('about_us')"
                  >
                    {{ isCollapsed('about_us') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('about_us')"
              >
                <CardContent class="space-y-4">
                  <div class="mt-2">
                    <Input
                      v-model="currentLocaleData.about_us.title"
                      :class="inputClass"
                      placeholder="Заголовок"
                    />
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-foreground">
                        Пункты
                      </p>
                      <p class="text-[11px] text-muted-foreground">
                        {{ currentLocaleData.about_us.items.length }} шт.
                      </p>
                    </div>
                    <div class="space-y-3">
                      <Card
                        v-for="(item, index) in currentLocaleData.about_us.items"
                        :key="`about-${index}`"
                        class="bg-card/80 row-wrap"
                      >
                        <CardHeader class="pb-2">
                          <CardTitle class="text-[12px] uppercase tracking-wide text-muted-foreground">
                            Пункт {{ Number(index) + 1 }}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-2">
                          <Input
                            v-model="item.title"
                            :class="inputClass"
                            placeholder="Заголовок"
                          />
                          <Input
                            v-model="item.subtitle"
                            :class="inputClass"
                            placeholder="Подзаголовок"
                          />
                          <Textarea
                            v-model="item.content"
                            class="min-h-[96px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                            placeholder="Контент"
                          />
                        </CardContent>
                        <div class="action-stack">
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === 0"
                            @click="moveAboutItem(index, -1)"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === currentLocaleData.about_us.items.length - 1"
                            @click="moveAboutItem(index, 1)"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="currentLocaleData.about_us.items.length <= 1"
                            @click="removeAboutItem(index)"
                          >
                            −
                          </Button>
                        </div>
                      </Card>
                    </div>
                    <Button
                      variant="secondary"
                      class="h-8 w-full hover"
                      @click="addAboutItem"
                    >
                      + Пункт
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Services
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('services')"
                    aria-label="Toggle services"
                    @click="toggleSection('services')"
                  >
                    {{ isCollapsed('services') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('services')"
              >
                <CardContent class="space-y-4">
                  <div class="mt-2">
                    <Input
                      v-model="currentLocaleData.services.title"
                      :class="inputClass"
                      placeholder="Заголовок секции"
                    />
                  </div>

                  <div class="space-y-3">
                    <Card
                      v-for="card in serviceCards"
                      :key="card.key"
                      class="bg-card/80"
                    >
                      <CardHeader class="flex items-center justify-between pb-2">
                        <CardTitle class="text-[12px] uppercase tracking-wide text-muted-foreground">
                          {{ card.label }}
                        </CardTitle>
                      </CardHeader>
                      <CardContent class="space-y-2">
                        <Input
                          v-model="currentLocaleData.services[card.key].title"
                          :class="inputClass"
                          placeholder="Заголовок"
                        />
                        <Textarea
                          v-model="currentLocaleData.services[card.key].description"
                          class="min-h-[72px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                          placeholder="Описание"
                        />
                        <p class="text-sm font-medium text-foreground pt-2">
                          Контент модального окна
                        </p>
                        <Textarea
                          v-model="currentLocaleData.services[card.key].lead"
                          class="min-h-[72px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                          placeholder="Заголовок модального окна"
                        />
                        <div class="space-y-2 pb-2">
                          <div class="flex items-center justify-between">
                            <p class="text-sm font-medium text-foreground my-0">
                              Пункты
                            </p>
                            <p class="text-[11px] text-muted-foreground">
                              {{ currentLocaleData.services[card.key].bullets.length }} шт.
                            </p>
                          </div>
                          <div class="space-y-2">
                            <div
                              v-for="(bullet, bulletIndex) in currentLocaleData.services[card.key].bullets"
                              :key="`bullet-${card.key}-${bulletIndex}`"
                              class="row-wrap"
                            >
                              <Textarea
                                v-model="currentLocaleData.services[card.key].bullets[bulletIndex]"
                                class="min-h-[60px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                                placeholder="Текст пункта"
                              />
                              <div class="action-stack">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  class="icon-fab"
                                  :disabled="bulletIndex === 0"
                                  @click="moveServiceBullet(card.key, bulletIndex, -1)"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  class="icon-fab"
                                  :disabled="bulletIndex === currentLocaleData.services[card.key].bullets.length - 1"
                                  @click="moveServiceBullet(card.key, bulletIndex, 1)"
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  class="icon-fab"
                                  :disabled="currentLocaleData.services[card.key].bullets.length <= 1"
                                  @click="removeServiceBullet(card.key, bulletIndex)"
                                >
                                  −
                                </Button>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="secondary"
                            class="h-8 w-full hover"
                            @click="addServiceBullet(card.key)"
                          >
                            + Пункт
                          </Button>
                        </div>
                        <Textarea
                          v-model="currentLocaleData.services[card.key].text"
                          class="min-h-[96px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                          placeholder="Текст модального окна"
                        />
                      </CardContent>
                    </Card>
                  </div>

                  <Card class="bg-card/80">
                    <CardHeader class="pb-2">
                      <CardTitle class="text-[12px] uppercase tracking-wide text-muted-foreground">
                        Questions (mobile/tablet)
                      </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-2">
                      <Input
                        v-model="currentLocaleData.services.questions.title"
                        :class="inputClass"
                        placeholder="Заголовок"
                      />
                      <Textarea
                        v-model="currentLocaleData.services.questions.description"
                        class="min-h-[72px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                        placeholder="Подзаголовок"
                      />
                      <Input
                        v-model="currentLocaleData.services.questions.email"
                        type="email"
                        :class="inputClass"
                        placeholder="Почта"
                      />
                    </CardContent>
                  </Card>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Our projects
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('our_projects')"
                    aria-label="Toggle our projects"
                    @click="toggleSection('our_projects')"
                  >
                    {{ isCollapsed('our_projects') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('our_projects')"
              >
                <CardContent class="space-y-3">
                  <div class="mt-2">
                    <Input
                      v-model="currentLocaleData.our_projects.title"
                      :class="inputClass"
                      placeholder="Заголовок"
                    />
                  </div>

                  <div class="flex items-center justify-between">
                    <p class="text-sm font-medium text-foreground">
                      Фильтрация
                    </p>
                    <label class="flex items-center gap-2 text-sm text-muted-foreground">
                      <input
                        v-model="currentLocaleData.our_projects.enable"
                        type="checkbox"
                        class="h-4 w-4"
                      >
                      <span>Включить</span>
                    </label>
                  </div>

                  <div>
                    <p class="text-sm font-medium text-foreground">
                      Фильтры
                    </p>
                    <Input
                      v-model="currentLocaleData.our_projects.filters[0]"
                      :class="inputClass"
                      placeholder="Первое слово фильтра"
                    />
                    <p class="text-xs text-muted-foreground mt-1">
                      Варианты фильтров зависят от названий, что есть на <a
                        href="http://localhost:3000/cms/"
                        class="font-semibold hover"
                        target="_blank"
                      >
                        странице проектов
                      </a>
                    </p>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Market response
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('market_response')"
                    aria-label="Toggle market response"
                    @click="toggleSection('market_response')"
                  >
                    {{ isCollapsed('market_response') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('market_response')"
              >
                <CardContent class="space-y-2 mt-2">
                  <Input
                    v-model="currentLocaleData.market_response.title"
                    :class="inputClass"
                    placeholder="Заголовок"
                  />
                  <Textarea
                    v-model="currentLocaleData.market_response.description1"
                    class="min-h-[96px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                    placeholder="Описание 1"
                  />
                  <Textarea
                    v-model="currentLocaleData.market_response.description2"
                    class="min-h-[96px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                    placeholder="Описание 2"
                  />
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Our team
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('our_team')"
                    aria-label="Toggle our team"
                    @click="toggleSection('our_team')"
                  >
                    {{ isCollapsed('our_team') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('our_team')"
              >
                <CardContent class="space-y-4">
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-foreground">
                      Первая карточка
                    </p>
                    <Input
                      v-model="currentLocaleData.our_team.firstcard.title"
                      :class="inputClass"
                      placeholder="Заголовок"
                    />
                    <Textarea
                      v-model="currentLocaleData.our_team.firstcard.description"
                      class="min-h-[72px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                      placeholder="Описание"
                    />
                  </div>

                  <div>
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-foreground">
                        Команда
                      </p>
                      <p class="text-[11px] text-muted-foreground">
                        {{ currentLocaleData.our_team.members.length }} чел.
                      </p>
                    </div>
                    <div class="space-y-3">
                      <Card
                        v-for="(member, index) in currentLocaleData.our_team.members"
                        :key="`member-${index}`"
                        class="bg-card/80 row-wrap"
                      >
                        <CardHeader class="pb-2">
                          <CardTitle class="text-[12px] uppercase tracking-wide text-muted-foreground">
                            Участник {{ Number(index) + 1 }}
                          </CardTitle>
                        </CardHeader>
                        <CardContent class="space-y-2">
                          <div class="member-media">
                            <div class="member-preview">
                              <img
                                v-if="getMemberImage(member)"
                                :src="getMemberImage(member)"
                                alt="Фото участника"
                                class="member-thumb"
                                loading="lazy"
                              >
                              <div
                                v-else
                                class="member-placeholder"
                              >
                                рекомендуеться брать картинку размером 600 на 600 формата .jpg
                              </div>
                            </div>
                            <label
                              class="member-upload"
                              :class="{ 'is-disabled': uploadingMember === index }"
                            >
                              <input
                                type="file"
                                accept="image/*"
                                class="hidden"
                                :disabled="uploadingMember === index"
                                @change="(e) => uploadMemberImage(index, (e.target as HTMLInputElement).files)"
                              >
                              <span>{{ uploadingMember === index ? 'Загружается...' : hasPendingUpload(member) ? 'Сохранится при сохранении' : 'Загрузить новую' }}</span>
                            </label>
                          </div>
                          <div class="grid w-full grid-cols-1 space-y-2 box-border">
                            <Input
                              v-model="member.name"
                              :class="inputClass"
                              placeholder="Имя"
                            />
                            <Input
                              v-model="member.lastname"
                              :class="inputClass"
                              placeholder="Фамилия"
                            />
                            <Input
                              v-model="member.position"
                              :class="inputClass"
                              placeholder="Должность"
                            />
                          </div>
                        </CardContent>
                        <div class="action-stack">
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === 0"
                            @click="moveTeamMember(index, -1)"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === currentLocaleData.our_team.members.length - 1"
                            @click="moveTeamMember(index, 1)"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            @click="removeTeamMember(index)"
                          >
                            −
                          </Button>
                        </div>
                      </Card>
                    </div>
                    <Button
                      variant="secondary"
                      class="h-8 w-full mt-2 hover"
                      @click="addTeamMember"
                    >
                      + Участник
                    </Button>
                  </div>

                  <div class="space-y-2 pt-2">
                    <p class="text-sm font-medium text-foreground">
                      Последняя карточка
                    </p>
                    <Input
                      v-model="currentLocaleData.our_team.lastcard.title"
                      :class="inputClass"
                      placeholder="Заголовок"
                    />
                    <Textarea
                      v-model="currentLocaleData.our_team.lastcard.description"
                      class="min-h-[72px] w-full box-border resize-vertical px-3 py-2 text-sm leading-tight"
                      placeholder="Подзаголовок"
                    />
                    <Input
                      v-model="currentLocaleData.our_team.lastcard.email"
                      type="email"
                      :class="inputClass"
                      placeholder="Почта"
                    />
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Contacts
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('leave_request_contacts')"
                    aria-label="Toggle contacts"
                    @click="toggleSection('leave_request_contacts')"
                  >
                    {{ isCollapsed('leave_request_contacts') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('leave_request_contacts')"
              >
                <CardContent class="space-y-3">
                  <div class="space-y-2">
                    <Input
                      v-model="currentLocaleData.leave_request.contacts.title"
                      :class="inputClass"
                      placeholder="Заголовок"
                    />
                    <div class="flex items-center justify-between">
                      <p class="text-sm font-medium text-foreground">
                        Контакты
                      </p>
                      <p class="text-[11px] text-muted-foreground">
                        {{ currentLocaleData.leave_request.contacts.items.length }} шт.
                      </p>
                    </div>
                    <div class="space-y-2">
                      <div class="space-y-2">
                        <div
                          v-for="(contact, index) in currentLocaleData.leave_request.contacts.items"
                          :key="`contact-${index}`"
                          class="row-wrap"
                        >
                          <div
                            v-if="contact.type === 'link'"
                            class="space-y-2 w-full"
                          >
                            <div class="contact-icon-field">
                              <div class="contact-icon-preview">
                                <img
                                  v-if="getContactIconSrc(contact)"
                                  :src="getContactIconSrc(contact)"
                                  alt="Иконка контакта"
                                  class="contact-icon-thumb"
                                  loading="lazy"
                                >
                                <span
                                  v-else
                                  class="contact-icon-placeholder"
                                >
                                  svg
                                </span>
                              </div>
                              <label
                                class="contact-icon-upload"
                                :class="{ 'is-disabled': uploadingContactIcon === index }"
                              >
                                <input
                                  type="file"
                                  accept=".svg,image/svg+xml"
                                  class="hidden"
                                  :disabled="uploadingContactIcon === index"
                                  @change="(e) => uploadContactIcon(index, (e.target as HTMLInputElement).files, e.target as HTMLInputElement)"
                                >
                                <span>
                                  {{ uploadingContactIcon === index ? 'Загружается...' : hasPendingContactIcon(contact) ? 'Сохранится при сохранении' : 'Загрузить иконку' }}
                                </span>
                              </label>
                            </div>
                            <div class="grid grid-cols-2 gap-2 box-border w-full">
                              <Input
                                v-model="contact.text"
                                :class="inputClass"
                                placeholder="текст"
                              />
                              <Input
                                v-model="contact.href"
                                :class="inputClass"
                                placeholder="ссылки"
                              />
                            </div>
                          </div>
                          <Input
                            v-else-if="contact.type === 'phone'"
                            v-model="contact.value"
                            :class="inputClass"
                            placeholder="Телефон"
                          />
                          <Input
                            v-else
                            v-model="contact.value"
                            :class="inputClass"
                            placeholder="Почта"
                          />
                          <div class="action-stack">
                            <Button
                              variant="outline"
                              size="icon"
                              class="icon-fab"
                              :disabled="index === 0"
                              @click="moveContactItem(index, -1)"
                            >
                              ↑
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              class="icon-fab"
                              :disabled="index === currentLocaleData.leave_request.contacts.items.length - 1"
                              @click="moveContactItem(index, 1)"
                            >
                              ↓
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              class="icon-fab"
                              @click="removeContactItem(index)"
                            >
                              −
                            </Button>
                          </div>
                        </div>
                      </div>
                      <ButtonGroup class="w-full">
                        <Button
                          type="button"
                          variant="secondary"
                          class="h-8 flex-1 hover"
                          @click="addContactLink"
                        >
                          + Cсылку
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          class="h-8 flex-1 hover"
                          @click="addContactPhone"
                        >
                          + Телефон
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          class="h-8 flex-1 hover"
                          @click="addContactEmail"
                        >
                          + Почта
                        </Button>
                      </ButtonGroup>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Form
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('leave_request_form')"
                    aria-label="Toggle form"
                    @click="toggleSection('leave_request_form')"
                  >
                    {{ isCollapsed('leave_request_form') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('leave_request_form')"
              >
                <CardContent class="space-y-3">
                  <div class="space-y-2">
                    <p class="text-sm font-medium text-foreground">
                      Форма
                    </p>
                    <div class="space-y-2">
                      <div class="grid grid-cols-2 gap-2 box-border">
                        <Input
                          v-model="currentLocaleData.leave_request.form.title"
                          :class="inputClass"
                          placeholder="Заголовок 1"
                        />
                        <Input
                          v-model="currentLocaleData.leave_request.form.name"
                          :class="inputClass"
                          placeholder="Имя"
                        />
                        <Input
                          v-model="currentLocaleData.leave_request.form.phone"
                          :class="inputClass"
                          placeholder="Телефон"
                        />
                        <Input
                          v-model="currentLocaleData.leave_request.form.title2"
                          :class="inputClass"
                          placeholder="Заголовок 2"
                        />
                        <Input
                          v-model="currentLocaleData.leave_request.form.question"
                          :class="inputClass"
                          placeholder="Вопрос 1"
                        />
                        <Input
                          v-model="currentLocaleData.leave_request.form.question2"
                          :class="inputClass"
                          placeholder="Вопрос 2"
                        />
                        <Input
                          v-model="currentLocaleData.leave_request.form.button"
                          :class="[inputClass, 'col-span-2']"
                          placeholder="Текст кнопки"
                        />
                      </div>
                      <div class="space-y-2">
                        <Input
                          v-model="currentLocaleData.leave_request.form.agree.text"
                          :class="inputClass"
                          placeholder="Текст соглашения"
                        />
                        <div class="grid grid-cols-5 gap-2 box-border items-center">
                          <Input
                            v-model="currentLocaleData.leave_request.form.agree.link"
                            :class="[inputClass, 'col-span-3']"
                            placeholder="Текст ссылки"
                          />
                          <Button
                            type="button"
                            class="h-8 w-full col-span-2 hover"
                            :disabled="agreePdfUploading || isSaving"
                            @click="triggerAgreePdfUpload(tab.code)"
                          >
                            {{ agreePdfUploading ? 'Загрузка...' : 'Загрузить PDF' }}
                          </Button>
                          <div class="col-span-1" />
                        </div>
                        <input
                          :ref="(el) => setAgreePdfInputRef(tab.code, el as HTMLInputElement | null)"
                          type="file"
                          accept="application/pdf"
                          class="hidden"
                          @change="(e) => handleAgreePdfSelected(tab.code, (e.target as HTMLInputElement).files)"
                        >
                        <div
                          v-if="(!agreePdfUrl || (agreePdfIsSameOrigin && agreePdfExists === false)) && !pendingAgreePdfName"
                          class="member-preview pdf-preview"
                        >
                          <div class="member-placeholder mt-0">
                            Загрузите файл формата .pdf
                          </div>
                        </div>
                        <p
                          v-if="agreePdfUrl && agreePdfIsSameOrigin && agreePdfExists === true"
                          class="text-[11px] text-muted-foreground"
                        >
                          Текущий файл:
                          <button
                            type="button"
                            class="underline font-semibold hover:text-black transition-colors bg-transparent hover"
                            @click="openAgreePdf"
                          >
                            {{ agreePdfFileName }}
                          </button>
                        </p>
                        <p
                          v-if="agreePdfUrl && agreePdfIsSameOrigin && agreePdfExists === false"
                          class="text-[11px] text-destructive"
                        >
                          Файл {{ agreePdfFileName || 'PDF' }} не найден. Загрузите новый.
                        </p>
                        <p
                          v-if="agreePdfUrl && !agreePdfIsSameOrigin"
                          class="text-[11px] text-muted-foreground"
                        >
                          Ссылка на файл:
                          <button
                            type="button"
                            class="underline font-semibold hover:text-black transition-colors bg-transparent"
                            @click="openAgreePdf"
                          >
                            {{ agreePdfFileName || agreePdfUrl }}
                          </button>
                        </p>
                        <p
                          v-if="pendingAgreePdfName"
                          class="text-[11px] text-muted-foreground"
                        >
                          Новый файл (загрузится при сохранении):
                          <span class="font-semibold">{{ pendingAgreePdfName }}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            <Card>
              <CardHeader class="mb-1">
                <div class="flex items-center gap-2">
                  <CardTitle class="text-sm uppercase tracking-wide">
                    Footer
                  </CardTitle>
                  <button
                    type="button"
                    class="toggle-btn"
                    :aria-expanded="!isCollapsed('footer')"
                    aria-label="Toggle footer"
                    @click="toggleSection('footer')"
                  >
                    {{ isCollapsed('footer') ? '▼' : '▲' }}
                  </button>
                </div>
              </CardHeader>
              <div
                class="collapsible"
                :data-open="!isCollapsed('footer')"
              >
                <CardContent class="space-y-4">
                  <Input
                    v-model="currentLocaleData.footer.brand"
                    :class="inputClass"
                    placeholder="Имя компании"
                  />
                  <Input
                    v-model="currentLocaleData.footer.rights"
                    :class="inputClass"
                    placeholder="Годы и права"
                  />
                  <div>
                    <p class="text-sm font-medium text-foreground">
                      Политика конфиденциальности
                    </p>
                    <div class="space-y-2 box-border">
                      <Input
                        v-model="currentLocaleData.footer.privacy_policy.text"
                        :class="inputClass"
                        placeholder="Текст"
                      />
                      <div class="grid box-border items-center">
                        <Button
                          type="button"
                          class="h-8 w-full hover"
                          :disabled="privacyPdfUploading || isSaving"
                          @click="triggerPrivacyPdfUpload(tab.code)"
                        >
                          {{ privacyPdfUploading ? 'Загрузка...' : 'Загрузить PDF' }}
                        </Button>
                      </div>
                      <input
                        :ref="(el) => setPrivacyPdfInputRef(tab.code, el as HTMLInputElement | null)"
                        type="file"
                        accept="application/pdf"
                        class="hidden"
                        @change="(e) => handlePrivacyPdfSelected(tab.code, (e.target as HTMLInputElement).files)"
                      >
                      <div
                        v-if="(!privacyPdfUrl || (privacyPdfIsSameOrigin && privacyPdfExists === false)) && !pendingPrivacyPdfName"
                        class="member-preview pdf-preview"
                      >
                        <div class="member-placeholder mt-0">
                          Загрузите файл формата .pdf
                        </div>
                      </div>
                      <p
                        v-if="privacyPdfUrl && privacyPdfIsSameOrigin && privacyPdfExists === true"
                        class="text-[11px] text-muted-foreground"
                      >
                        Текущий файл:
                        <button
                          type="button"
                          class="underline font-semibold hover:text-black transition-colors bg-transparent hover"
                          @click="openPrivacyPdf"
                        >
                          {{ privacyPdfFileName }}
                        </button>
                      </p>
                      <p
                        v-if="privacyPdfUrl && privacyPdfIsSameOrigin && privacyPdfExists === false"
                        class="text-[11px] text-destructive"
                      >
                        Файл {{ privacyPdfFileName || 'PDF' }} не найден. Загрузите новый.
                      </p>
                      <p
                        v-if="privacyPdfUrl && !privacyPdfIsSameOrigin"
                        class="text-[11px] text-muted-foreground"
                      >
                        Ссылка на файл:
                        <button
                          type="button"
                          class="underline font-semibold hover:text-black transition-colors bg-transparent"
                          @click="openPrivacyPdf"
                        >
                          {{ privacyPdfFileName || privacyPdfUrl }}
                        </button>
                      </p>
                      <p
                        v-if="pendingPrivacyPdfName"
                        class="text-[11px] text-muted-foreground"
                      >
                        Новый файл (загрузится при сохранении):
                        <span class="font-semibold">{{ pendingPrivacyPdfName }}</span>
                      </p>
                    </div>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-foreground text-white">
                      - 
                    </p>
                    <Input
                      v-model="currentLocaleData.footer.email"
                      type="email"
                      :class="inputClass"
                      placeholder="Email"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-medium text-foreground">
                      Иконки
                    </p>
                    <div class="space-y-2">
                      <div
                        v-for="(icon, index) in currentLocaleData.footer.icons"
                        :key="`footer-icon-${index}`"
                        class="row-wrap"
                      >
                        <div class="space-y-2 w-full">
                          <div class="contact-icon-field">
                            <div class="contact-icon-preview">
                              <img
                                v-if="getFooterIconSrc(icon)"
                                :src="getFooterIconSrc(icon)"
                                alt="Иконка футера"
                                class="contact-icon-thumb"
                                loading="lazy"
                              >
                              <span
                                v-else
                                class="contact-icon-placeholder"
                              >
                                svg
                              </span>
                            </div>
                            <label
                              class="contact-icon-upload"
                              :class="{ 'is-disabled': uploadingFooterIcon === index }"
                            >
                              <input
                                type="file"
                                accept=".svg,image/svg+xml"
                                class="hidden"
                                :disabled="uploadingFooterIcon === index"
                                @change="(e) => uploadFooterIcon(index, (e.target as HTMLInputElement).files, e.target as HTMLInputElement)"
                              >
                              <span>
                                {{ uploadingFooterIcon === index ? 'Загружается...' : hasPendingFooterIcon(icon) ? 'Сохранится при сохранении' : 'Загрузить иконку' }}
                              </span>
                            </label>
                          </div>
                          <Input
                            v-model="icon.href"
                            :class="inputClass"
                            placeholder="Ссылка"
                          />
                        </div>
                        <div class="action-stack">
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === 0"
                            @click="moveFooterIcon(index, -1)"
                          >
                            ↑
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="index === currentLocaleData.footer.icons.length - 1"
                            @click="moveFooterIcon(index, 1)"
                          >
                            ↓
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            class="icon-fab"
                            :disabled="currentLocaleData.footer.icons.length <= 1"
                            @click="removeFooterIcon(index)"
                          >
                            −
                          </Button>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        class="h-8 w-full hover"
                        @click="addFooterIcon"
                      >
                        + Иконку
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>

    <div class="save-bar">
      <div class="flex flex-col items-start gap-1">
        <Alert
          v-if="saveMessage"
          class="border-[var(--strategix-accent)] bg-[var(--strategix-accent-light)] text-black box-border text-center p-3"
        >
          <AlertDescription class="text-xs font-semibold">
            {{ saveMessage }}
          </AlertDescription>
        </Alert>
        <Alert
          v-if="saveError"
          variant="destructive"
          class="bg-red-200 text-black box-border text-center p-3"
        >
          <AlertDescription class="text-xs font-semibold">
            {{ saveError }}
          </AlertDescription>
        </Alert>
      </div>
      <Button
        type="button"
        class="text-sm font-semibold"
        :disabled="isSaving || hasBlockingErrors"
        @click="saveIndex"
      >
        {{ isSaving ? 'Сохраняю...' : 'Сохранить' }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
:global(:root){
  --cms-panel-width: clamp(300px, 28vw, 450px);
  --cms-panel-gap: 1px;
  --cms-scale: 0.8;
}

.main{
  transform: scale(var(--cms-scale));
  transform-origin: left top;
}

.edit-json{
  width: var(--cms-panel-width);
  height: calc(var(--vh) * 100);
  max-height: calc(var(--vh) * 100);

  position: fixed;
  top: 0;
  right: 0;
  overflow: hidden;
  padding: 12px;

  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(241, 241, 241, 0.96) 0%, rgba(255, 255, 255, 0.94) 100%);
  box-shadow: -8px 0 24px rgba(32, 34, 38, 0.08);
}

.edit-card{
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 80px;

  position: relative;
}

.edit-card :deep(.grid){
  min-width: 0;
}

.edit-card :deep(.grid > *){
  min-width: 0;
}

.save-bar{
  position: fixed;
  right: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 50;
}

.row-wrap{
  position: relative;
  box-sizing: border-box;
}

.action-stack{
  position: absolute;
  top: -6px;
  right: -6px;
  transform: translate(5%, -15%);
  display: flex;
  gap: 4px;
}

.icon-fab{
  width: 20px;
  height: 20px;
  min-width: 20px;
  min-height: 20px;
  padding: 0;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  line-height: 1;
  font-size: 12px;
}

.toggle-btn{
  width: 18px;
  height: 18px;
  line-height: 1;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 6px;
  background: white;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.collapsible{
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transition: max-height 0.35s ease, opacity 0.25s ease;
}

.collapsible[data-open="true"]{
  max-height: 6000px;
  opacity: 1;
}

.section-box{
  padding: 10px;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 10px;
  background: rgba(0,0,0,0.02);
  box-sizing: border-box;
}

.member-media{
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.member-preview{
  flex: 3;
  min-height: 60px;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 10px;
  overflow: hidden;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.pdf-preview{
  width: 100%;
}

.member-thumb{
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-placeholder{
  padding: 10px;
  font-size: 12px;
  color: rgba(0,0,0,0.6);
  text-align: center;
  line-height: 1.3;
}

.member-upload{
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(0,0,0,0.25);
  border-radius: 10px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  padding: 8px;
  box-sizing: border-box;
}

.member-upload.is-disabled{
  opacity: 0.6;
  cursor: not-allowed;
}

.contact-icon-field{
  display: grid;
  grid-template-columns: 1fr 7fr;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  align-items: stretch;
}

.contact-icon-preview{
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(0,0,0,0.08);
  border-radius: 10px;
  background: var(--strategix-dark, #0f111a);
  padding: 6px;
  box-sizing: border-box;
  color: white;
}

.contact-icon-thumb{
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.contact-icon-placeholder{
  font-size: 12px;
  letter-spacing: 0.5px;
}

.contact-icon-upload{
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed rgba(0,0,0,0.25);
  border-radius: 10px;
  background: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 10px;
  box-sizing: border-box;
  min-height: 32px;
}

.contact-icon-upload.is-disabled{
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

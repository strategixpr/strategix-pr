export type DomainCode = 'ru' | 'com';

export type LocaleWithDomains = {
  code?: string;
  name?: string;
  iso?: string;
  language?: string;
  domains?: unknown;
};

export const SUPPORTED_SITE_DOMAINS: DomainCode[] = ['ru', 'com'];

const normalizeCode = (value: unknown) => String(value || '').trim().toLowerCase();

const isSupportedDomain = (value: string): value is DomainCode =>
  SUPPORTED_SITE_DOMAINS.includes(value as DomainCode);

export const normalizeSiteDomain = (value: unknown) => {
  const normalized = normalizeCode(value);
  return isSupportedDomain(normalized) ? normalized : '';
};

export const normalizeLocaleDomains = (value: unknown): DomainCode[] => {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set<DomainCode>();

  source.forEach((item) => {
    const normalized = normalizeSiteDomain(item);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
  });

  return Array.from(seen);
};

export const hasAnyDomainSelections = (locales: LocaleWithDomains[]) =>
  locales.some((locale) => normalizeLocaleDomains(locale.domains).length > 0);

const matchesFallback = (localeCode: string, domain: DomainCode) =>
  (domain === 'ru' && localeCode === 'ru') || (domain === 'com' && localeCode === 'en');

export const filterLocalesForSiteDomain = <T extends LocaleWithDomains>(locales: T[], siteDomain: unknown) => {
  const normalizedDomain = normalizeSiteDomain(siteDomain);
  if (!normalizedDomain) return locales;

  if (!hasAnyDomainSelections(locales)) {
    return locales.filter((locale) => matchesFallback(normalizeCode(locale.code), normalizedDomain));
  }

  return locales.filter((locale) => normalizeLocaleDomains(locale.domains).includes(normalizedDomain));
};

export const normalizeLocaleList = <T extends LocaleWithDomains>(locales: T[]) =>
  locales
    .map((locale) => {
      const code = String(locale?.code || '').trim();
      if (!code) return null;

      const iso = String(locale?.iso || code).trim();
      const language = String(locale?.language || iso || code).trim();
      const name = String(locale?.name || code).trim();

      return {
        ...locale,
        code,
        iso,
        language,
        name,
        domains: normalizeLocaleDomains(locale?.domains),
      };
    })
    .filter(Boolean) as Array<T & {
      code: string;
      iso: string;
      language: string;
      name: string;
      domains: DomainCode[];
    }>;

export const resolveDefaultLocaleForSiteDomain = (
  allLocales: LocaleWithDomains[],
  filteredLocales: LocaleWithDomains[],
  configuredDefault: unknown,
  siteDomain: unknown,
) => {
  const requestedDefault = normalizeCode(configuredDefault);
  const normalizedDomain = normalizeSiteDomain(siteDomain);
  const availableCodes = new Set(filteredLocales.map((locale) => normalizeCode(locale.code)).filter(Boolean));

  if (requestedDefault && availableCodes.has(requestedDefault)) return requestedDefault;

  if (normalizedDomain === 'ru' && availableCodes.has('ru')) return 'ru';
  if (normalizedDomain === 'com' && availableCodes.has('en')) return 'en';

  const firstFiltered = normalizeCode(filteredLocales[0]?.code);
  if (firstFiltered) return firstFiltered;

  const firstKnown = normalizeCode(allLocales[0]?.code);
  return firstKnown || 'ru';
};

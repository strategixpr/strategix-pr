import localesConfig from "../../../src/content/locales.json";
import {
  filterLocalesForSiteDomain,
  normalizeLocaleList,
  normalizeSiteDomain,
} from "../../../src/shared/lib/content/domainLocales";

const fallbackLocaleCodes = filterLocalesForSiteDomain(
  normalizeLocaleList(localesConfig.locales),
  normalizeSiteDomain(process.env.SITE_DOMAIN),
).map((locale) => locale.code);

export default defineSitemapEventHandler((event) => {
  const config = useRuntimeConfig(event);
  const localeCodes = (config.sitemapData?.localeCodes as string[] | undefined) ?? fallbackLocaleCodes;
  const projectSlugs = (config.sitemapData?.projectSlugs as string[] | undefined) ?? [];
  const urls = new Set<string>([
    "/",
    ...localeCodes.map((localeCode) => `/${localeCode}`),
  ]);

  for (const slug of projectSlugs) {
    urls.add(`/project/${slug}`);
    for (const localeCode of localeCodes) {
      urls.add(`/${localeCode}/project/${slug}`);
    }
  }

  return Array.from(urls).map((loc) => ({loc}));
});

import localesConfig from "../../../src/content/locales.json";

const fallbackLocaleCodes = localesConfig.locales.map((locale: {code: string}) => locale.code);

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

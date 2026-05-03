// https://nuxt.com/docs/api/configuration/nuxt-config

import {readdirSync} from "node:fs";
import {join} from "node:path";
import {
  filterLocalesForSiteDomain,
  normalizeLocaleList,
  normalizeSiteDomain,
  resolveDefaultLocaleForSiteDomain,
} from "./src/shared/lib/content/domainLocales";

// eslint-disable-next-line import/no-internal-modules
import localesConfig from './src/content/locales.json';

const modules = ["@nuxt/eslint", "@nuxt/image", "@nuxtjs/i18n", "@nuxtjs/sitemap"];
type LocaleConfig = {
  code?: string;
  iso?: string;
  name?: string;
  language?: string;
  domains?: string[];
};

const normalizedLocales = normalizeLocaleList(
  (Array.isArray(localesConfig.locales) ? localesConfig.locales : []) as LocaleConfig[],
);
const siteDomain = normalizeSiteDomain(process.env.SITE_DOMAIN);
const effectiveLocales = filterLocalesForSiteDomain(normalizedLocales, siteDomain);
const effectiveDefaultLocale = resolveDefaultLocaleForSiteDomain(
  normalizedLocales,
  effectiveLocales,
  localesConfig.default,
  siteDomain,
);
const localeCodes = effectiveLocales.map((locale) => locale.code);
const projectSlugs = readdirSync(join(process.cwd(), "src/content/pages/project"))
  .filter((fileName) => fileName.endsWith(".json"))
  .map((fileName) => fileName.replace(".json", ""))
  .sort();

export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  srcDir: "src",
  modules,
  runtimeConfig: {
    public: {
      siteDomain: siteDomain || "",
    },
    sitemapData: {
      localeCodes,
      projectSlugs,
    },
  },
  site: {
    url: process.env.NUXT_SITE_URL ?? "https://strategix-pr.ru",
  },
  app:{
    baseURL: process.env.NUXT_APP_BASE_URL ?? "/",
  },
  experimental: {
    payloadExtraction: false,
    defaults: {
      nuxtLink: {
        prefetch: false,
        prefetchOn: {
          visibility: false,
          interaction: false,
        },
      },
    },
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router'],
          }
        }
      }
    },
    css: {
      devSourcemap: false,
    }
  },
  nitro: {
    preset: "github_pages",
    prerender: {
      crawlLinks: true,
      routes: ["/sitemap.xml"],
    },
    compressPublicAssets: true,
    minify: true
  },
  image: {
    provider: "ipxStatic",
    quality: 80,
    format: ['webp'],
    screens: {
      xs: 480,   // --mobile-width
      sm: 768,   // --tablet-width
      md: 1024,  // --laptop-width
      lg: 1440,  // --big-laptop-width
      xl: 1920,  // --mini-pc-width
      xxl: 2620, // --pc-width
    },
  },
  eslint: {
    config: {
      standalone: false, // чтобы Nuxt не тянул свои JS/TS/Vue пресеты и не конфликтовал с FSD
    },
  },
  postcss: {
    plugins: {
      '@csstools/postcss-global-data': {
        files: ['./src/shared/ui/media.css'],
      },

      'postcss-custom-media': {},
      autoprefixer: {},
    },
  },
  i18n: {
    //Код языков опираются на https://w3schoolsrus.github.io/tags/ref_language_codes.html#gsc.tab=0
    locales: effectiveLocales.map((l) => ({
      code: l.code,
      iso: l.iso,
      language: l.language,
      name: l.name,
    })),
    defaultLocale: effectiveDefaultLocale,
    strategy: 'prefix_and_default',
  },
  sitemap: {
    sitemapsPathPrefix: '/', // Переносим все sitemap-файлы в корень, чтобы было ru.xml и en.xml
    autoI18n: false,
    excludeAppSources: true,
    sources: ["/api/__sitemap__/urls"],
  },
});

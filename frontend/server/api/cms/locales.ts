import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createError, getMethod, readBody } from 'h3';

type LocaleConfig = { code: string; name: string; iso?: string };

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const ensureIndexTranslations = async (localeCodes: string[]) => {
  const indexPath = join(process.cwd(), 'src/content/pages/index.json');

  const indexContent = await readFile(indexPath, 'utf-8').catch((error) => {
    throw createError({
      statusCode: 500,
      statusMessage: 'Не удалось прочитать index.json',
      data: error,
    });
  });

  const parsedIndex = JSON.parse(indexContent) as Record<string, any>;
  const translations = parsedIndex?.translations as Record<string, any> | undefined;

  if (!translations || typeof translations !== 'object') {
    throw createError({
      statusCode: 500,
      statusMessage: 'index.json не содержит translations',
    });
  }

  const template = translations.example;

  if (!template || typeof template !== 'object') {
    throw createError({
      statusCode: 500,
      statusMessage: 'Не найден example для шаблона переводов в index.json',
    });
  }

  const addedTranslations: string[] = [];
  const removedTranslations: string[] = [];
  const localeSet = new Set(
    localeCodes
      .map((code) => String(code || '').trim())
      .filter(Boolean),
  );

  localeSet.forEach((code) => {
    if (code === 'example') return;
    if (Object.prototype.hasOwnProperty.call(translations, code)) return;

    translations[code] = clone(template);
    addedTranslations.push(code);
  });

  Object.keys(translations).forEach((code) => {
    if (code === 'example') return;
    if (localeSet.has(code)) return;

    delete translations[code];
    removedTranslations.push(code);
  });

  if (!addedTranslations.length && !removedTranslations.length) {
    return { addedTranslations, removedTranslations, indexPath };
  }

  const updatedIndexContent = JSON.stringify(parsedIndex, null, 4);

  await writeFile(indexPath, updatedIndexContent, 'utf-8');

  return { addedTranslations, removedTranslations, indexPath };
};

export default defineEventHandler(async (event) => {
  const method = getMethod(event).toUpperCase();
  const targetPath = join(process.cwd(), 'src/content/locales.json');

  if (method === 'GET') {
    const content = await readFile(targetPath, 'utf-8');
    return JSON.parse(content);
  }

  if (!['PUT', 'PATCH'].includes(method)) {
    return { ok: true, message: 'Use GET to read, PUT/PATCH to overwrite locales.json' };
  }

  const body = await readBody(event);

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  const locales = Array.isArray((body as any).locales) ? (body as any).locales : [];

  const sanitized = locales
    .map((locale: any) => ({
      code: String(locale?.code || '').trim(),
      name: String(locale?.name || '').trim() || String(locale?.code || '').trim(),
      iso: typeof locale?.iso === 'string' ? locale.iso : '',
    }))
    .filter((locale: LocaleConfig) => locale.code);

  const unique: LocaleConfig[] = [];
  const seen = new Set<string>();

  sanitized.forEach((locale) => {
    if (seen.has(locale.code)) return;
    seen.add(locale.code);
    unique.push(locale);
  });

  if (!unique.length) {
    throw createError({ statusCode: 400, statusMessage: 'No locales provided' });
  }

  const requiredCodes = ['ru', 'en'];
  const missingRequired = requiredCodes.filter((code) => !seen.has(code));

  if (missingRequired.length) {
    throw createError({
      statusCode: 400,
      statusMessage: `Отсутствуют обязательные языки: ${missingRequired.join(', ')}`,
    });
  }

  const defaultLocale = typeof (body as any).default === 'string' && (body as any).default
    ? (body as any).default
    : unique[0].code;

  const content = JSON.stringify({ default: defaultLocale, locales: unique }, null, 4);

  const previousLocalesContent = await readFile(targetPath, 'utf-8').catch(() => '');

  await writeFile(targetPath, content, 'utf-8');

  let addedTranslations: string[] = [];
  let removedTranslations: string[] = [];

  try {
    const { addedTranslations: added, removedTranslations: removed } = await ensureIndexTranslations(
      unique.map((locale) => locale.code),
    );
    addedTranslations = added;
    removedTranslations = removed;
  } catch (error) {
    if (previousLocalesContent) {
      await writeFile(targetPath, previousLocalesContent, 'utf-8').catch(() => {});
    }
    throw error;
  }

  return {
    ok: true,
    count: unique.length,
    path: targetPath,
    addedTranslations,
    removedTranslations,
  };
});

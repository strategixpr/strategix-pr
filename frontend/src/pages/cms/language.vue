<script setup lang="ts">
import { computed, ref } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/ui/card';
import { Button } from '@/shared/ui/shadcn/ui/button';
import { Input } from '@/shared/ui/shadcn/ui/input';
import { ScrollArea } from '@/shared/ui/shadcn/ui/scroll-area';
import HeaderCMS from '@/widgets/header-cms';
import localesConfig from '@/content/locales.json';
import languageCodes from '@/content/language-codes.json';

type LocaleConfig = { code: string; name: string; iso?: string };
type LanguageCode = { code: string; name: string; iso?: string };
type LanguageOption = { code: string; english: string; russian: string; iso: string };

const reservedCodes = new Set(['ru', 'en']);
const defaultLocale = typeof localesConfig?.default === 'string' ? localesConfig.default : 'ru';
const initialLocales = (Array.isArray(localesConfig?.locales) ? localesConfig.locales : []) as LocaleConfig[];

const locales = ref<LocaleConfig[]>(initialLocales
  .map((locale) => ({
    code: String(locale?.code || '').trim(),
    name: String(locale?.name || '').trim(),
    iso: String(locale?.iso || locale?.code || '').trim(),
  }))
  .filter((locale) => locale.code));

const searchQuery = ref('');
const saveMessage = ref('');
const saveError = ref('');
const isSaving = ref(false);

const displayNameCache = new Map<string, string>();
const getDisplayName = (code: string, locale: string) => {
  const cacheKey = `${locale}:${code}`;
  if (displayNameCache.has(cacheKey)) return displayNameCache.get(cacheKey) || '';
  try {
    if (typeof Intl !== 'undefined' && (Intl as any).DisplayNames) {
      const formatter = new Intl.DisplayNames([locale], { type: 'language' });
      const value = formatter.of(code) || '';
      displayNameCache.set(cacheKey, value || '');
      return value || '';
    }
  } catch (error) {
    console.warn('DisplayNames not available', error);
  }
  return '';
};

const allLanguageOptions = computed<LanguageOption[]>(() => {
  const list = (languageCodes || []) as LanguageCode[];
  const seen = new Set<string>();

  return list
    .filter((item) => !!item.code && !seen.has(item.code) && seen.add(item.code))
    .map(({ code, name, iso }) => {
      const ruName = getDisplayName(code, 'ru');
      const enName = getDisplayName(code, 'en');
      return {
        code,
        iso: (iso || code).trim(),
        english: name || enName || code,
        russian: ruName || name || code,
      };
    });
});

const existingCodes = computed(() => new Set(locales.value.map((locale) => locale.code)));

const filteredLanguageOptions = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  return allLanguageOptions.value
    .filter((option) => !existingCodes.value.has(option.code))
    .filter((option) => {
      if (!query) return true;
      return (
        option.code.toLowerCase().includes(query) ||
        option.english.toLowerCase().includes(query) ||
        option.russian.toLowerCase().includes(query)
      );
    });
});

const canRemove = (code: string) => !reservedCodes.has(code);

const addLanguage = (option: LanguageOption) => {
  if (existingCodes.value.has(option.code)) return;
  locales.value = [
    ...locales.value,
    {
      code: option.code,
      name: option.russian || option.english || option.code,
      iso: option.iso || option.code,
    },
  ];
};

const removeLanguage = (code: string) => {
  if (!canRemove(code)) return;
  locales.value = locales.value.filter((locale) => locale.code !== code);
};

const saveLocales = async () => {
  if (isSaving.value) return;
  saveError.value = '';
  saveMessage.value = '';

  if (!locales.value.length) {
    saveError.value = 'Добавьте хотя бы один язык';
    return;
  }

  const payload = {
    default: defaultLocale,
    locales: locales.value.map((locale) => ({
      code: locale.code.trim(),
      name: locale.name?.trim() || locale.code,
      iso: (locale.iso || locale.code).trim(),
    })),
  };

  isSaving.value = true;
  try {
    const response = await fetch('/api/cms/locales', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(text || `Ошибка сохранения (${response.status})`);
    }

    let addedTranslations: string[] = [];
    let removedTranslations: string[] = [];

    try {
      const data = await response.json();
      addedTranslations = Array.isArray((data as any)?.addedTranslations)
        ? (data as any).addedTranslations.filter((code: unknown): code is string => typeof code === 'string' && !!code)
        : [];
      removedTranslations = Array.isArray((data as any)?.removedTranslations)
        ? (data as any).removedTranslations.filter((code: unknown): code is string => typeof code === 'string' && !!code)
        : [];
    } catch {
      addedTranslations = [];
      removedTranslations = [];
    }

    const translationUpdates = [
      addedTranslations.length ? `добавлены: ${addedTranslations.join(', ')}` : '',
      removedTranslations.length ? `удалены: ${removedTranslations.join(', ')}` : '',
    ].filter(Boolean);

    saveMessage.value = translationUpdates.length
      ? `Изменения сохранены. В index.json ${translationUpdates.join('; ')}`
      : 'Изменения сохранены';
  } catch (error: any) {
    saveError.value = error?.message || 'Не удалось сохранить изменения';
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen text-foreground index">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
      <HeaderCMS>Языки сайта</HeaderCMS>
      <main class="language-shell">
        <div class="language-grid">
          <Card class="language-card">
            <CardHeader class="card-header">
              <CardTitle>Текущие языки</CardTitle>
              <!-- <p class="muted-text">
                Редактируйте отображаемые названия. Удалять нельзя ru и en.
              </p> -->
            </CardHeader>
            <CardContent class="card-content">
              <div class="current-list">
                <div
                  v-for="locale in locales"
                  :key="locale.code"
                  class="locale-row"
                >
                  <div class="code-chip">
                    {{ locale.code }}
                  </div>
                  <Input
                    v-model="locale.name"
                    :placeholder="locale.code"
                    class="w-[100%] h-9 box-border"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    class="remove-button"
                    :disabled="!canRemove(locale.code)"
                    :aria-disabled="!canRemove(locale.code)"
                    @click="removeLanguage(locale.code)"
                  >
                    Удалить
                  </Button>
                </div>
              </div>
              <div class="actions-row">
                <div class="status-text">
                  <span
                    v-if="saveMessage"
                    class="success-text"
                  >
                    {{ saveMessage }}
                  </span>
                  <span
                    v-else-if="saveError"
                    class="error-text"
                  >
                    {{ saveError }}
                  </span>
                </div>
                <Button
                  class="save-button"
                  :disabled="isSaving"
                  @click="saveLocales"
                >
                  {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card class="language-card add-card">
            <CardHeader class="card-header">
              <CardTitle>Добавить язык</CardTitle>
              <!-- <p class="muted-text">
                Список из ISO 639-1 (W3Schools). Формат: Английское название (русское) - код.
              </p> -->
            </CardHeader>
            <CardContent class="card-content">
              <Input
                v-model="searchQuery"
                placeholder="Поиск по названию или коду"
                class="w-[100%] h-9 box-border search-input mb-4"
              />
              <ScrollArea class="options-list">
                <button
                  v-for="option in filteredLanguageOptions"
                  :key="option.code"
                  type="button"
                  class="option-row"
                  @click="addLanguage(option)"
                >
                  <span class="option-text">
                    {{ option.english }} ({{ option.russian }}) - {{ option.code }}
                  </span>
                  <span class="option-action">Добавить</span>
                </button>
                <div
                  v-if="filteredLanguageOptions.length === 0"
                  class="empty-text"
                >
                  Все доступные языки уже добавлены
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  .language-shell {
    width: 100%;
    min-height: 70vh;
    border: 2px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
    background-color: hsl(var(--card));
    border-radius: var(--card-radius);
    padding: 16px;
    box-sizing: border-box;
  }

  .language-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 16px;
  }

  .language-card {
    background: hsl(var(--card));
    height: 100%;
  }

  .card-header {
    padding: 12px 16px;
  }

  .card-content {
    padding: 0 16px 16px;
  }

  .muted-text {
    font-size: 14px;
    color: hsl(var(--muted-foreground));
    margin: 4px 0 0;
  }

  .current-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .locale-row {
    display: grid;
    grid-template-columns: 0.4fr 2fr 0.6fr;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid color-mix(in srgb, var(--strategix-light) 60%, white 40%);
    background: color-mix(in srgb, hsl(var(--background)) 30%, white 70%);
  }

  .code-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 10px;
    border-radius: 10px;
    background: hsl(var(--accent));
    color: hsl(var(--accent-foreground));
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .remove-button {
    width: 100%;
    color: hsl(var(--destructive));
  }

  .remove-button[disabled] {
    opacity: 0.5;
    cursor: not-allowed;
    color: hsl(var(--muted-foreground));
  }

  .actions-row {
    margin-top: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .status-text {
    min-height: 22px;
    font-size: 14px;
  }

  .success-text {
    color: #239f6a;
  }

  .error-text {
    color: hsl(var(--destructive));
  }

  .save-button {
    min-width: 140px;
  }

  .add-card {
    background: color-mix(in srgb, hsl(var(--card)) 90%, white 10%);
  }

  .options-list {
    height: 460px;
    border: 1px solid color-mix(in srgb, var(--strategix-light) 55%, white 45%);
    border-radius: 12px;
    padding: 6px;
    background: color-mix(in srgb, hsl(var(--background)) 20%, white 80%);
  }

  .option-row {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: background-color 120ms ease, transform 120ms ease;
  }

  .option-row:hover {
    background: color-mix(in srgb, var(--strategix-light) 20%, white 80%);
    transform: translateY(-1px);
  }

  .option-text {
    font-size: 14px;
    color: hsl(var(--foreground));
  }

  .option-action {
    font-size: 12px;
    color: hsl(var(--muted-foreground));
  }

  .empty-text {
    padding: 12px;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
  }

  @media (max-width: 1024px) {
    .language-grid {
      grid-template-columns: 1fr;
    }

    .options-list {
      height: 360px;
    }
  }

  @media (max-width: 640px) {
    .locale-row {
      grid-template-columns: 1fr;
    }

    .remove-button {
      width: 100%;
      justify-content: center;
    }

    .actions-row {
      flex-direction: column;
      align-items: flex-start;
    }

    .save-button {
      width: 100%;
    }
  }
</style>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { Card, CardContent, CardHeader } from '@/shared/ui/shadcn/ui/card';
import { Button } from '@/shared/ui/shadcn/ui/button';
import localesConfig from '@/content/locales.json';

type LocaleConfig = { code: string; name: string; iso?: string };

const router = useRouter();

const languages = (localesConfig?.locales || []) as LocaleConfig[];

const goToLanguageSettings = () => {
  router.push('/cms/language');
};
</script>

<template>
  <div class="cms-languages">
    <Card class="cms-languages-content">
      <CardHeader class="py-0">
        <h2 class="upperscase-text">
          ЯЗЫКИ
        </h2>
      </CardHeader>
      <CardContent>
        <div class="languages-row">
          <div class="languages-list">
            <span
              v-for="language in languages"
              :key="language.code"
              class="base-text language-chip"
            >
              {{ language.name }}
            </span>
          </div>
          <Button
            variant="secondary"
            class="settings-button base-text hover"
            @click="goToLanguageSettings"
          >
            Настройки
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
  .cms-languages {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
  }

  .cms-languages-content {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    background-color: hsl(var(--card));
    border-radius: var(--card-radius);
  }

  h2{
    text-align: left;
  }

  .languages-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }

  .languages-list {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }

  .language-chip {
    box-sizing: border-box;
    padding: 10px 14px;
    border-radius: 0.5rem; /*  var(--radius-md); */

    font-size: 14px;

    background: color-mix(in srgb, hsl(var(--background)) 35%, white 65%);
    color: #000000;
    border: 1px solid color-mix(in srgb, var(--strategix-light) 50%, white 50%);
  }

  .settings-button {
    white-space: nowrap;
    font-size: 14px;
  }
</style>

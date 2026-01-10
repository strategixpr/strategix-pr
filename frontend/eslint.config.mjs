// @ts-nocheck
import withNuxt from "./.nuxt/eslint.config.mjs";
import featureSlicedConfig from "@uvarovag/eslint-config-feature-sliced-flat";
import pluginVue from 'eslint-plugin-vue';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default withNuxt(
  //Глобальные игноры
  {
    ignores: ['.nuxt/**', '**/*.d.ts']
  },

  // Подключаем Vue 3 пресет (подключит плагин "vue" и его правила)
  ...pluginVue.configs['flat/recommended'],
  
  // добавляем FSD-конфиги
  ...featureSlicedConfig,
  // сюда же можно дописывать свои flat-конфиги, если понадобятся
  // { files: ['**/*.ts'], rules: { 'no-console': 'off' } },

  // разрешаем внутренние импорты в индексах виджетов
  {
    files: ['src/widgets/**/index.ts'],
    rules: {
      'import/no-internal-modules': 'off',
    },
  },

  // отключаем multi-word только для страниц
  {
    files: ['src/pages/**/*.vue', 'src/widgets/**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
    },
  },

  // Общая конфигурация для всех .ts файлов
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // ваши TS-правила
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,                // сам Vue-парсер
      parserOptions: {
        parser: tsParser,              // внутри <script setup lang="ts">
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: {
      vue,
    },
    // Можно взять готовые правила из eslint-plugin-vue
    rules: {
      ...vue.configs['flat/essential'].rules,
      // сюда добавляйте свои правила при необходимости
    },
  },
)

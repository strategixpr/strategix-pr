<script setup lang="ts">
  import { ref } from 'vue';
  import AuthorizationInCMS from '@/widgets/authorization-in-cms';
  import HeaderCMS from '@/widgets/header-cms';
  import ProjectsCMS from '@/widgets/projects-cms';
  import LanguagesCMS from '@/widgets/languages-cms';

  const hasToken = ref(false);

  const handleStatusChange = (value: boolean) => {
    hasToken.value = value;
  };
</script>

<template>
  <div class="min-h-screen text-foreground index">
    <div class="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-6">
      <HeaderCMS>Content Management System</HeaderCMS>

      <main class="cms-shell">
        <AuthorizationInCMS @status-changed="handleStatusChange" />

        <ProjectsCMS v-if="hasToken" />
        <LanguagesCMS v-if="hasToken" />

        <div
          v-if="!hasToken"
          class="cms-locker"
        >
          Когда всё согласуем здесь будет видео и текстовая инструкция по использованию CMS
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
  .index{
    background: linear-gradient(180deg, rgba(241, 241, 241, 0.96) 0%, rgba(255, 255, 255, 0.94) 100%);
    box-shadow: -8px 0 24px rgba(32, 34, 38, 0.08);
  }
  .cms-shell {
    width: 100%;
    height: min-content;
    margin: 0;

    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .cms-locker {
    grid-column: 1 / -1;
    padding: 16px;
    border-radius: 12px;
    border: 1px dashed #d1d5db;
    background-color: hsl(var(--card));
    border-radius: var(--card-radius);
    color: var(--strategix-dark);
  }
</style>

<script setup lang="ts">
  import { computed, onMounted, ref } from 'vue';
  import type { FetchError } from 'ofetch';
  import { Button } from '@/shared/ui/shadcn/ui/button';
  import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/shadcn/ui/card';
  import { Input } from '@/shared/ui/shadcn/ui/input';
  import { LogOut, Send, User } from '@/shared/ui/icons';

  type CmsUser = { name?: string; login?: string; avatarUrl?: string };

  const emits = defineEmits<{ (e: 'status-changed', value: boolean): void }>();

  const hasToken = ref(false);
  const user = ref<CmsUser | null>(null);
  const tokenInput = ref('');
  const loading = ref(false);
  const message = ref('');
  const errorMessage = ref('');
  const pushing = ref(false);

  const getStatusCode = (error: unknown) => (error as Partial<FetchError>)?.statusCode;
  const getErrorData = (error: unknown) => (error as any)?.data || (error as any)?.response?._data || {};

  const displayName = computed(() => user.value?.name || user.value?.login || 'Аккаунт');

  const notifyStatus = (value: boolean) => emits('status-changed', value);

  const fetchStatus = async () => {
    loading.value = true;
    errorMessage.value = '';

    try {
      const response = await $fetch<{ hasToken: boolean; user?: CmsUser }>('/api/cms/auth');
      hasToken.value = Boolean(response.hasToken);
      user.value = response.user || null;
      notifyStatus(hasToken.value);
    } catch (error: unknown) {
      const statusCode = getStatusCode(error);
      if (statusCode === 503) {
        errorMessage.value = 'GitHub недоступен. Проверьте подключение к интернету.';
      } else {
        errorMessage.value = 'Не удалось получить статус';
      }
      setTimeout(() => errorMessage.value = '', 5000);
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    fetchStatus();
  });

  const handleSaveToken = async () => {
    if (!tokenInput.value.trim()) {
      errorMessage.value = 'Введите токен';
      setTimeout(() => errorMessage.value = '', 5000);
      return;
    }
    loading.value = true;
    errorMessage.value = '';
    message.value = '';
    try {
      const response = await $fetch<{ hasToken: boolean; user?: CmsUser }>('/api/cms/auth', {
        method: 'POST',
        body: { token: tokenInput.value },
      });
      hasToken.value = Boolean(response.hasToken);
      user.value = response.user || null;
      tokenInput.value = '';
      message.value = 'Токен сохранён';
      setTimeout(() => message.value = '', 5000);
      notifyStatus(hasToken.value);
    } catch (error: any) {
      const statusCode = getStatusCode(error);
      if (statusCode === 403) {
        errorMessage.value = 'Нет прав на репозиторий. Добавьте аккаунт в Collaborators.';
      } else if (statusCode === 503) {
        errorMessage.value = 'GitHub недоступен. Проверьте подключение.';
      } else if (statusCode === 401) {
        errorMessage.value = 'Неверный GitHub token.';
      } else if (statusCode === 400) {
        errorMessage.value = 'Токен содержит недопустимые символы.';
      } else {
        errorMessage.value = 'Не удалось сохранить токен';
      }
      setTimeout(() => errorMessage.value = '', 5000);
    } finally {
      loading.value = false;
    }
  };

  const handleLogout = async () => {
    loading.value = true;
    errorMessage.value = '';
    message.value = '';
    try {
      await $fetch('/api/cms/auth', { method: 'DELETE' });
      hasToken.value = false;
      user.value = null;
      notifyStatus(false);
      message.value = 'Токен удалён';
      setTimeout(() => message.value = '', 5000);
    } catch (error: unknown) {
      errorMessage.value = error instanceof Error ? error.message : 'Не удалось удалить токен';
      setTimeout(() => errorMessage.value = '', 5000);
    } finally {
      loading.value = false;
    }
  };

  const handlePush = async () => {
    pushing.value = true;
    errorMessage.value = '';
    message.value = '';
    try {
      const response = await $fetch<{ ok?: boolean; invalidPaths?: string[] }>('/api/cms/push', { method: 'POST' });
      if (response?.invalidPaths?.length) {
        errorMessage.value = 'Найдены файлы вне разрешённых путей';
        setTimeout(() => errorMessage.value = '', 5000);
        return;
      }
      if (response?.ok === false) {
        errorMessage.value = 'Не удалось отправить изменения';
        setTimeout(() => errorMessage.value = '', 5000);
        return;
      }
      message.value = 'Изменения отправлены';
      setTimeout(() => message.value = '', 5000);
    } catch (error: any) {
      const statusCode = getStatusCode(error);
      const data = getErrorData(error);
      const apiMessage = (data as any)?.statusMessage || (data as any)?.message || '';
      message.value = '';
      if (error?.data?.invalidPaths?.length) {
        errorMessage.value = 'Найдены файлы вне разрешённых путей';
      } else if (statusCode === 400 && (data?.reason === 'no_allowed_changes')) {
        errorMessage.value = 'Изменений для отправки нет. Разрешено отправлять только файлы: json/pdf/png/jpg/webp';
      } else if (statusCode === 401) {
        errorMessage.value = 'Токен отсутствует или недействителен.';
      } else if (statusCode === 403) {
        errorMessage.value = 'Нет прав на push в этот репозиторий.';
      } else if (statusCode === 503) {
        errorMessage.value = 'GitHub недоступен. Проверьте подключение.';
      } else {
        errorMessage.value = apiMessage || 'Не удалось отправить изменения';
      }
      if (errorMessage.value) {
        setTimeout(() => errorMessage.value = '', 5000);
      }
    } finally {
      pushing.value = false;
    }
  };
</script>

<template>
  <div class="cms-auth">
    <Card class="cms-auth-card">
      <CardHeader v-if="!hasToken">
        <CardTitle
          class="upperscase-text cms-auth-title"
        >
          Авторизация
        </CardTitle>
      </CardHeader>
      <CardContent class="p-6">
        <div
          v-if="!hasToken"
          class="h-96 flex flex-col justify-center"
        >
          <p class="text-sm">
            Введите ваш GitHub token
          </p>
          <div class="flex flex-col gap-3 mb-16 md:flex-row md:items-center">
            <Input
              v-model="tokenInput"
              :disabled="loading"
              placeholder="ghp_xxx..."
              class="p-0 px-3 w-full"
            />
            <Button
              :disabled="loading"
              class="hover"
              @click="handleSaveToken"
            >
              <p v-if="!message && !errorMessage">
                Сохранить токен
              </p>
              <p
                v-else-if="message"
                class="text-sm text-[var(--strategix-accent)]"
              >
                {{ message }}
              </p>
              <p
                v-if="errorMessage"
                class="text-sm text-destructive"
              >
                {{ errorMessage }}
              </p>
            </Button>
          </div>
        </div>
        <div
          v-else
          class="flex flex-col gap-4"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="avatar">
                <img
                  v-if="user?.avatarUrl"
                  :src="user.avatarUrl"
                  alt="avatar"
                  class="avatar-image"
                >
                <div
                  v-else
                  class="avatar-placeholder"
                >
                  <User class="size-4" />
                </div>
              </div>
              <div class="flex flex-col">
                <span class="font-semibold leading-tight">
                  {{ displayName }}
                </span>
                <span class="text-sm text-muted-foreground leading-tight">
                  {{ user?.login || 'GitHub' }}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                :disabled="loading || pushing"
                class="hover"
                @click="handleLogout"
              >
                <LogOut class="size-4" />
              </Button>
            </div>
            <div class="flex items-center gap-2">
              <Button
                :disabled="pushing || loading"
                class="hover"
                @click="handlePush"
              >
                <!-- <Send class="size-4" /> -->
                <p v-if="!message && !errorMessage">
                  Отправить изменения
                </p>
                <p
                  v-else-if="message"
                  class="text-sm text-[var(--strategix-accent)]"
                >
                  {{ message }}
                </p>
                <p
                  v-if="errorMessage"
                  class="text-sm text-destructive"
                >
                  {{ errorMessage }}
                </p>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<style scoped>
  .cms-auth {
    width: 100%;
    height: 100%;
    max-width: 1024px;
    box-sizing: border-box;
  }

  .cms-auth-card {
    width: 100%;
    height: 100%;
    box-sizing: border-box;

    background-color: hsl(var(--card));
    border-radius: var(--card-radius);
  }

  .cms-auth-title{
    text-align: left;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 9999px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #f4f4f5;
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .avatar-placeholder {
    display: inline-flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    color: #6b7280;
  }

</style>

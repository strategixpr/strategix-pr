import { createError, getMethod, readBody } from 'h3';
import { clearToken, readStoredToken, saveToken } from '../../utils/cmsToken';
import { runGit } from '../../utils/git';

type GitHubUserResponse = {
  login?: string;
  name?: string;
  avatar_url?: string;
};

const fetchGitHubUser = async (token: string) => {
  let response: Response;

  try {
    response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'strategix-cms',
      },
    });
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'GitHub недоступен, проверьте соединение',
      data: { error: error instanceof Error ? error.message : 'fetch failed' },
    });
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid GitHub token',
      });
    }

    throw createError({
      statusCode: response.status,
      statusMessage: 'Не удалось получить профиль GitHub',
    });
  }

  const data = (await response.json()) as GitHubUserResponse;

  return {
    login: data.login || '',
    name: data.name || data.login || '',
    avatarUrl: data.avatar_url || '',
  };
};

const extractRepoSlug = async () => {
  const remote = await runGit(['config', '--get', 'remote.origin.url']);
  if (!remote) {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось определить remote.origin.url' });
  }

  const sshMatch = remote.match(/^git@github\.com:(.+?)(\.git)?$/);
  if (sshMatch?.[1]) return sshMatch[1];

  try {
    const url = new URL(remote);
    return url.pathname.replace(/^\/+/, '').replace(/\.git$/, '');
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось разобрать remote.origin.url' });
  }
};

const verifyContributor = async (token: string, login: string) => {
  const slug = await extractRepoSlug();
  const url = `https://api.github.com/repos/${slug}/collaborators/${encodeURIComponent(login)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'strategix-cms',
        Accept: 'application/vnd.github+json',
      },
    });
  } catch (error) {
    throw createError({
      statusCode: 503,
      statusMessage: 'GitHub недоступен, проверьте соединение',
      data: { error: error instanceof Error ? error.message : 'fetch failed' },
    });
  }

  if (response.status === 204) return true;

  if (response.status === 404 || response.status === 403) {
    throw createError({
      statusCode: 403,
      statusMessage: 'У аккаунта нет прав на репозиторий',
    });
  }

  throw createError({
    statusCode: response.status,
    statusMessage: 'Не удалось проверить права на репозиторий',
  });
};

const fetchGitHubUserAndValidate = async (token: string) => {
  if (/[^\x00-\x7F]/.test(token)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Токен содержит недопустимые символы. Используйте только латиницу и цифры.',
    });
  }
  const user = await fetchGitHubUser(token);
  if (!user.login) {
    throw createError({ statusCode: 401, statusMessage: 'Некорректный профиль GitHub' });
  }
  await verifyContributor(token, user.login);
  return user;
};

export default defineEventHandler(async (event) => {
  const method = getMethod(event).toUpperCase();

  if (method === 'GET') {
    const token = await readStoredToken();
    if (!token) {
      return { hasToken: false };
    }

    try {
      const user = await fetchGitHubUserAndValidate(token);
      return { hasToken: true, user };
    } catch (error) {
      throw error;
    }
  }

  if (method === 'POST') {
    const body = await readBody(event);
    const token = typeof body?.token === 'string' ? body.token.trim() : '';

    if (!token) {
      throw createError({ statusCode: 400, statusMessage: 'Token is required' });
    }

    const user = await fetchGitHubUserAndValidate(token);
    await saveToken(token);

    return { ok: true, hasToken: true, user };
  }

  if (method === 'DELETE') {
    await clearToken();
    return { ok: true, hasToken: false };
  }

  throw createError({
    statusCode: 405,
    statusMessage: 'Method not allowed',
  });
});

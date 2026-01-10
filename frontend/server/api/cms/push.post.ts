import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { createError } from 'h3';
import { readStoredToken } from '../../utils/cmsToken';
import {
  allowedContentRoots,
  extractChangedPaths,
  runGit,
  uniqueList,
} from '../../utils/git';

const allowedExtensions = ['.json', '.pdf', '.png', '.jpg', '.jpeg', '.webp'];

const hasAllowedExtension = (path: string) => {
  const lower = path.toLowerCase();
  return allowedExtensions.some((ext) => lower.endsWith(ext));
};

const normalizeRemoteUrl = (remote: string) => {
  if (remote.startsWith('git@github.com:')) {
    const path = remote.replace('git@github.com:', '');
    return `https://github.com/${path}`;
  }

  return remote;
};

const attachTokenToUrl = (remote: string, token: string) => {
  const httpsRemote = normalizeRemoteUrl(remote);

  try {
    const url = new URL(httpsRemote);
    url.username = token;
    url.password = '';
    return url.toString();
  } catch {
    return `https://${token}@${httpsRemote.replace(/^https?:\/\//, '')}`;
  }
};

const sanitizeUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return url.replace(/https?:\/\/[^@]+@/, 'https://');
  }
};

export default defineEventHandler(async () => {
  const token = (await readStoredToken()) || process.env.CMS_GITHUB_TOKEN || '';

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'GitHub token is missing' });
  }

  const statusOutput = await runGit(['status', '--porcelain']);
  const changedPaths = extractChangedPaths(statusOutput);

  if (changedPaths.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Нет изменений для отправки' });
  }

  const allowedChanges = changedPaths.filter(
    (path) => allowedContentRoots.some((prefix) => path.startsWith(prefix)) && hasAllowedExtension(path),
  );

  if (allowedChanges.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Изменений для отправки нет',
      data: {
        reason: 'no_allowed_changes',
        allowedExtensions,
      },
    });
  }

  const repoPrefix = await runGit(['rev-parse', '--show-prefix']);

  const normalizeTarget = (target: string) => {
    let normalized = target;
    const trimmedPrefix = repoPrefix?.trim();

    if (trimmedPrefix && normalized.startsWith(trimmedPrefix)) {
      normalized = normalized.slice(trimmedPrefix.length);
    }
    if (normalized.startsWith('./')) {
      normalized = normalized.slice(2);
    }

    return normalized;
  };

  const targetsToAdd = uniqueList(
    allowedChanges
      .map(normalizeTarget)
      .filter((t) => existsSync(join(process.cwd(), t))),
  );

  if (targetsToAdd.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Нет разрешённых изменений' });
  }

  await runGit(['add', ...targetsToAdd]);

  try {
    await runGit(['commit', '-m', `CMS: update content ${new Date().toISOString()}`]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('nothing to commit')) {
      throw createError({ statusCode: 400, statusMessage: 'Нет изменений для коммита' });
    }
    throw error;
  }

  const branch = await runGit(['rev-parse', '--abbrev-ref', 'HEAD']);
  const remote = await runGit(['config', '--get', 'remote.origin.url']);

  if (!remote) {
    throw createError({ statusCode: 500, statusMessage: 'Не удалось определить remote.origin.url' });
  }

  const pushUrlWithToken = attachTokenToUrl(remote, token);
  const sanitizedRemote = sanitizeUrl(pushUrlWithToken);

  try {
    await runGit(['push', pushUrlWithToken, branch]);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Permission to')) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Нет прав на push в репозиторий',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при push',
    });
  }

  return {
    ok: true,
    branch,
    remote: sanitizedRemote,
  };
});

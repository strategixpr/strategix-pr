import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { createError, defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.node.req.method?.toUpperCase() !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Use POST' });
  }

  const body = await readBody<{ src?: string }>(event);
  if (!body?.src || typeof body.src !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'src is required' });
  }

  const dirEntry = [
    ['images', '/images/'],
    ['icons', '/icons/'],
  ].find(([, prefix]) => body.src.startsWith(prefix));

  if (!dirEntry) {
    return { ok: true, skipped: true };
  }

  const [dirName] = dirEntry;
  const publicDir = join(process.cwd(), 'public', dirName);
  const filePath = join(publicDir, basename(body.src));

  await unlink(filePath).catch(() => {});

  return { ok: true };
});

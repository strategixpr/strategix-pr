import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { createError, defineEventHandler, readMultipartFormData } from 'h3';

export default defineEventHandler(async (event) => {
  if (event.node.req.method?.toUpperCase() !== 'POST') {
    throw createError({ statusCode: 405, statusMessage: 'Use POST for uploads' });
  }

  const form = await readMultipartFormData(event);
  const file = form?.find((item) => item.name === 'file' && item.filename && item.data);
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'File is required' });
  }

  const allowedDirs = new Set(['images', 'icons']);
  const targetDirField = form?.find((item) => item.name === 'targetDir');
  const requestedDir = targetDirField?.data?.toString('utf-8') || '';
  const dir = allowedDirs.has(requestedDir) ? requestedDir : 'images';

  const ext = extname(file.filename || '').toLowerCase() || '.jpg';
  const safeExt = ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext) ? ext : '.jpg';
  if (dir === 'icons' && safeExt !== '.svg') {
    throw createError({ statusCode: 400, statusMessage: 'Only SVG icons are allowed for this upload' });
  }
  const filename = `${Date.now()}-${randomUUID()}${safeExt}`;

  const publicDir = join(process.cwd(), 'public', dir);
  await mkdir(publicDir, { recursive: true });

  const filePath = join(publicDir, filename);
  await writeFile(filePath, file.data);

  const oldSrc = form.find((item) => item.name === 'oldSrc');
  const oldValue = oldSrc?.data?.toString('utf-8') || '';
  if (oldValue && (oldValue.startsWith('/images/') || oldValue.startsWith('/icons/'))) {
    const oldDir = oldValue.startsWith('/icons/') && allowedDirs.has('icons') ? 'icons' : 'images';
    const oldPath = join(process.cwd(), 'public', oldDir, basename(oldValue));
    await unlink(oldPath).catch(() => {});
  }

  return { ok: true, path: `/${dir}/${filename}` };
});

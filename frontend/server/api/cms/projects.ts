import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createError, getMethod, readBody } from 'h3';

export default defineEventHandler(async (event) => {
  const method = getMethod(event).toUpperCase();

  if (!['PUT', 'PATCH'].includes(method)) {
    return { ok: true, message: 'Use PUT/PATCH with JSON body to overwrite projects.json' };
  }

  const body = await readBody(event);

  if (!body || typeof body !== 'object') {
    throw createError({ statusCode: 400, statusMessage: 'Invalid payload' });
  }

  const targetPath = join(process.cwd(), 'src/content/pages/projects.json');
  const content = JSON.stringify(body, null, 4);

  await writeFile(targetPath, content, 'utf-8');

  return { ok: true, path: targetPath };
});

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

  const ext = extname(file.filename || '').toLowerCase() || '.pdf';
  const mime = (file.type || '').toLowerCase();
  const isPdf = ext === '.pdf' || mime === 'application/pdf';
  if (!isPdf) {
    throw createError({ statusCode: 400, statusMessage: 'Only PDF files are allowed' });
  }

  let filename = basename(file.filename || '').trim();
  if (!filename) {
    filename = `${Date.now()}-${randomUUID()}.pdf`;
  }
  if (!filename.toLowerCase().endsWith('.pdf')) {
    filename = `${filename}.pdf`;
  }

  const publicDir = join(process.cwd(), 'public', 'pdf');
  await mkdir(publicDir, { recursive: true });

  const oldSrc = form.find((item) => item.name === 'oldSrc');
  const oldValue = oldSrc?.data?.toString('utf-8') || '';

  if (oldValue.startsWith('/pdf/')) {
    const oldPath = join(publicDir, basename(oldValue));
    if (oldPath !== join(publicDir, filename)) {
      await unlink(oldPath).catch(() => {});
    }
  }

  const filePath = join(publicDir, filename);
  await writeFile(filePath, file.data);

  return { ok: true, path: `/pdf/${filename}` };
});

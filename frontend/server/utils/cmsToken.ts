import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const TOKEN_KEY = 'CMS_GITHUB_TOKEN';
const ENV_PATH = join(process.cwd(), '.env.local');

const readEnvFile = async () => {
  try {
    return await readFile(ENV_PATH, 'utf-8');
  } catch {
    return '';
  }
};

const persistEnvFile = async (content: string) => {
  await writeFile(ENV_PATH, content, 'utf-8');
};

export const readStoredToken = async () => {
  const content = await readEnvFile();
  const line = content
    .split(/\r?\n/)
    .find((entry) => entry.startsWith(`${TOKEN_KEY}=`));

  return line ? line.slice(TOKEN_KEY.length + 1) : '';
};

export const saveToken = async (token: string) => {
  const content = await readEnvFile();
  const lines = content ? content.split(/\r?\n/) : [];
  const filtered = lines.filter((line) => !line.startsWith(`${TOKEN_KEY}=`) && line.trim() !== '');

  filtered.push(`${TOKEN_KEY}=${token}`);

  const normalized = `${filtered.join('\n')}\n`;
  await persistEnvFile(normalized);
  process.env[TOKEN_KEY] = token;
};

export const clearToken = async () => {
  const content = await readEnvFile();
  if (!content) {
    process.env[TOKEN_KEY] = '';
    return;
  }

  const filtered = content
    .split(/\r?\n/)
    .filter((line) => !line.startsWith(`${TOKEN_KEY}=`) && line.trim() !== '');

  if (filtered.length === 0) {
    await persistEnvFile('');
  } else {
    await persistEnvFile(`${filtered.join('\n')}\n`);
  }
  process.env[TOKEN_KEY] = '';
};

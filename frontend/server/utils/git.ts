import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export const allowedContentRoots = [
  'public/',
  'src/content/',
  'frontend/public/',
  'frontend/src/content/',
];

export const runGit = async (args: string[]) => {
  const { stdout } = await execFileAsync('git', args, {
    cwd: process.cwd(),
    env: {
      ...process.env,
      GIT_TERMINAL_PROMPT: '0',
    },
  });

  return stdout.trim();
};

export const extractChangedPaths = (statusOutput: string) => statusOutput
  .split('\n')
  .map((line) => line.trim())
  .filter(Boolean)
  .flatMap((line) => {
    const withoutStatus = line.replace(/^[A-Z\?\!]{1,2}\s+/, '');
    return withoutStatus.split(' -> ');
  })
  .map((path) => path.trim())
  .filter(Boolean);

export const findInvalidPaths = (paths: string[]) => paths
  .filter((path) => path !== '.DS_Store')
  .filter((path) => !allowedContentRoots.some((prefix) => path.startsWith(prefix)));

export const uniqueList = (paths: string[]) => [...new Set(paths)];

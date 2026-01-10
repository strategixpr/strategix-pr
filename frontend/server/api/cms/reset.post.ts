import { runGit } from '../../utils/git';

export default defineEventHandler(async () => {
  await runGit(['reset', '--hard']);
  await runGit(['pull']);

  return { ok: true };
});

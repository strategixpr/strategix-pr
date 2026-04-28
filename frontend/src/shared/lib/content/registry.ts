type ProjectContent = any;

const modules = import.meta.glob('@/content/pages/project/*.json', {eager: true}) as Record<string, {default: ProjectContent}>;

export const projectBySlug: Record<string, ProjectContent> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => {
    const slug = path.split('/').pop()!.replace('.json', '');
    return [slug, mod.default];
  })
);

export function getProjectContent(slug: string) {
  return projectBySlug[slug] ?? null;
}
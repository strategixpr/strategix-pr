const normalizeBase = (base: string) => {
  if (!base || base === '/') return '';
  return base.endsWith('/') ? base.slice(0, -1) : base;
};

const isExternalMediaSrc = (src: string) => (
  /^(https?:)?\/\//i.test(src) || src.startsWith('data:') || src.startsWith('blob:')
);

const normalizePublicSrc = (src: string) => {
  if (src.startsWith('@/public')) return src.replace(/^@\/public/, '') || '/';
  if (src.startsWith('./')) return src.replace(/^\.\//, '/');
  return src;
};

export const resolveMediaSrc = (src: string | null | undefined, baseURL: string) => {
  const raw = src?.trim() ?? '';
  if (!raw) return '';

  if (isExternalMediaSrc(raw)) {
    return raw;
  }

  const base = normalizeBase(baseURL);
  if (!base) {
    return raw.startsWith('/') ? raw : `/${raw}`;
  }

  if (raw === base || raw.startsWith(`${base}/`)) {
    return raw;
  }

  return raw.startsWith('/') ? `${base}${raw}` : `${base}/${raw}`;
};

export const resolveNuxtImageSrc = (src: string | null | undefined, baseURL = '/') => {
  const raw = normalizePublicSrc(src?.trim() ?? '');
  if (!raw) return '';

  if (isExternalMediaSrc(raw)) {
    return raw;
  }

  const publicSrc = raw.startsWith('/') ? raw : `/${raw}`;
  const base = normalizeBase(baseURL);

  if (base && (publicSrc === base || publicSrc.startsWith(`${base}/`))) {
    return publicSrc.slice(base.length) || '/';
  }

  return publicSrc;
};

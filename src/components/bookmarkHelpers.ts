const BASE62_ALPHABET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SLUG_PATTERN = /^mona-[0-9a-zA-Z]{4,}$/;

export type Bookmark = {
  url: string;
  slug: string;
};

export function normalizeUrl(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error('URL is required.');
  }

  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const url = new URL(withProtocol);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }

  return url.pathname === '/' && !url.search && !url.hash
    ? `${url.protocol}//${url.host}`
    : url.href;
}

export function createSlug(randomValue = Math.random()): string {
  const normalizedRandom = Number.isFinite(randomValue)
    ? Math.min(Math.max(randomValue, 0), 0.999999999999)
    : Math.random();
  let value = Math.floor(normalizedRandom * 62 ** 4);
  let slug = '';

  do {
    slug = BASE62_ALPHABET[value % 62] + slug;
    value = Math.floor(value / 62);
  } while (slug.length < 4);

  return `mona-${slug}`;
}

export function createBookmark(inputUrl: string, slug = createSlug()): Bookmark {
  return {
    url: normalizeUrl(inputUrl),
    slug,
  };
}

export function parseStoredBookmarks(value: string | null): Bookmark[] {
  if (!value) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isBookmark);
  } catch {
    return [];
  }
}

export function formatBookmark({ url, slug }: Bookmark): string {
  return `${url} :: ${slug}`;
}

function isBookmark(value: unknown): value is Bookmark {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<Record<keyof Bookmark, unknown>>;

  return (
    typeof candidate.url === 'string' &&
    typeof candidate.slug === 'string' &&
    isValidUrl(candidate.url) &&
    SLUG_PATTERN.test(candidate.slug)
  );
}

function isValidUrl(value: string): boolean {
  try {
    return normalizeUrl(value) === value;
  } catch {
    return false;
  }
}

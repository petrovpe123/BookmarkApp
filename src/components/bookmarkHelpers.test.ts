import { describe, expect, it } from 'vitest';

import { createBookmark, formatBookmark, parseStoredBookmarks } from './bookmarkHelpers';

describe('bookmark helpers', () => {
  it('normalizes a URL with and without https to the same saved value', () => {
    expect(createBookmark('www.example.com', 'mona-7fk2').url).toBe(
      createBookmark('https://www.example.com', 'mona-7fk2').url,
    );
    expect(createBookmark('www.example.com', 'mona-7fk2').url).toBe('https://www.example.com');
  });

  it.each([
    ['empty', null],
    ['empty string', ''],
    ['corrupted', '{not-json'],
    ['legacy object', '{"bookmarks":[{"url":"https://www.example.com","slug":"mona-7fk2"}]}'],
    ['legacy string array', '["https://www.example.com"]'],
    ['non-array', '{"url":"https://www.example.com","slug":"mona-7fk2"}'],
  ])('recovers from %s stored values without throwing', (_label, storedValue) => {
    expect(() => parseStoredBookmarks(storedValue)).not.toThrow();
    expect(parseStoredBookmarks(storedValue)).toEqual([]);
  });

  it('drops malformed items and keeps valid stored bookmarks', () => {
    expect(
      parseStoredBookmarks(
        JSON.stringify([
          { url: 'https://www.example.com', slug: 'mona-7fk2' },
          { url: 'not a url', slug: 'mona-zzzz' },
          { url: 'https://www.github.com', slug: 'not-mona' },
          null,
        ]),
      ),
    ).toEqual([{ url: 'https://www.example.com', slug: 'mona-7fk2' }]);
  });

  it('formats a saved bookmark with the exact visible separator', () => {
    expect(formatBookmark({ url: 'https://www.example.com', slug: 'mona-7fk2' })).toBe(
      'https://www.example.com :: mona-7fk2',
    );
  });
});

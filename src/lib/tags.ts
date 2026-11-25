import type { CollectionEntry } from 'astro:content';

export type TagCount = {
  tag: string;
  count: number;
};

/** 記事数の多い順(同数ならタグ名順)に並べて返す */
export function getTagCounts(posts: CollectionEntry<'blog'>[]): TagCount[] {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    post.data.tags?.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  return Array.from(counts, ([tag, count]) => ({ tag, count })).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag, 'ja')
  );
}

export function tagHref(tag: string): string {
  return `/tag/${encodeURIComponent(tag)}/`;
}

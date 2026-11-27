import { getCollection, type CollectionEntry } from 'astro:content';

export function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  return getCollection('blog', ({ id, data }) => {
    if (data.draft) return false;
    // drafts/ は git 管理外で本番には存在しないが、ローカルの build でも dist に混ぜない
    return import.meta.env.DEV || !id.startsWith('drafts/');
  });
}

/**
 * 共通するタグが多い順、同数なら同じカテゴリを先にして返す。タグもカテゴリも共通しない記事は含めない
 * sortedPostsは新しい順に並べて渡す(同点の記事はその順のまま残る)
 */
export function getRelatedPosts(
  post: CollectionEntry<'blog'>,
  sortedPosts: CollectionEntry<'blog'>[],
  limit = 3
): CollectionEntry<'blog'>[] {
  const tags = new Set(post.data.tags ?? []);

  return sortedPosts
    .filter((candidate) => candidate.id !== post.id)
    .map((candidate) => ({
      candidate,
      sharedTags: (candidate.data.tags ?? []).filter((tag) => tags.has(tag)).length,
      sameCategory: candidate.data.category === post.data.category,
    }))
    .filter(({ sharedTags, sameCategory }) => sharedTags > 0 || sameCategory)
    .sort((a, b) => b.sharedTags - a.sharedTags || Number(b.sameCategory) - Number(a.sameCategory))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

import { getCollection, type CollectionEntry } from 'astro:content';

export function getPosts(): Promise<CollectionEntry<'blog'>[]> {
  return getCollection('blog', ({ id, data }) => {
    if (data.draft) return false;
    // drafts/ は git 管理外で本番には存在しないが、ローカルの build でも dist に混ぜない
    return import.meta.env.DEV || !id.startsWith('drafts/');
  });
}

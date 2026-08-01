import rss from '@astrojs/rss';
import { getCollection, render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('astro.config.mjsでsiteが設定されていません');
  }

  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const container = await AstroContainer.create();

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const content = await container.renderToString(Content);

      return {
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        link: `/blog/${post.id}/`,
        categories: [post.data.category, ...(post.data.tags ?? [])],
        content,
      };
    }),
  );

  return rss({
    title: 'necotan log.',
    description: '写真・カメラ、愛車、デスク、個人開発を記録する個人ブログ',
    site: context.site,
    items,
    customData: '<language>ja</language>',
  });
}

import rss from '@astrojs/rss';
import { render } from 'astro:content';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { APIContext } from 'astro';
import { getPosts } from '../lib/posts';

// RSSリーダーによっては本文の相対URLを補わず、画像やリンクが切れるため、サイト内のURLを絶対URLにする
function absolutizeUrls(html: string, site: URL): string {
  const toAbsolute = (url: string): string =>
    url.startsWith('/') && !url.startsWith('//') ? new URL(url, site).href : url;

  return html
    .replace(/\s(src|href)="([^"]*)"/g, (_, name: string, url: string) => ` ${name}="${toAbsolute(url)}"`)
    .replace(/\ssrcset="([^"]*)"/g, (_, srcset: string) => {
      const candidates = srcset.split(',').map((candidate) => {
        const [url, ...descriptors] = candidate.trim().split(/\s+/);
        return [toAbsolute(url), ...descriptors].join(' ');
      });
      return ` srcset="${candidates.join(', ')}"`;
    });
}

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error('astro.config.mjsでsiteが設定されていません');
  }
  const site = context.site;

  const posts = (await getPosts()).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const container = await AstroContainer.create();

  const items = await Promise.all(
    posts.map(async (post) => {
      const { Content } = await render(post);
      const content = absolutizeUrls(await container.renderToString(Content), site);

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
    description: 'necotan log.は、写真・カメラ、愛車など、日々の記録を残すために作成した個人ブログです。',
    site,
    items,
    customData: '<language>ja</language>',
  });
}

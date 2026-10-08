// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeImageGrid from './src/lib/rehypeImageGrid.ts';
import rehypeEmbed from './src/lib/rehypeEmbed.ts';

const SITE_URL = 'https://necotan-log.com';

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,

  devToolbar: {
    enabled: false,
  },

  image: {
    // Cloudflare R2経由の写真をastro:assetsで最適化するため許可する
    domains: ['images.necotan-log.com'],
  },

  markdown: {
    // ```embed```コードブロックはYouTube埋め込み、リンクカードに変換するため、Shikiのハイライト対象から除外する
    syntaxHighlight: {
      type: 'shiki',
      excludeLangs: ['math', 'embed'],
    },
    processor: unified({ rehypePlugins: [rehypeImageGrid, rehypeEmbed] }),
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // アイコンはdata URIにインライン化せず、必ずハッシュ付きファイルとして出力する
      assetsInlineLimit: (filePath) =>
        /(favicon|apple-touch-icon|icon-\d+x\d+)\./.test(filePath) ? false : undefined,
    },
  },

  // 検索ページは中身が空のため、検索エンジンに載せない
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/search/') })]
});
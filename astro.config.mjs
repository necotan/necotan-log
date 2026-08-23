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

  // devToolbarを非表示にする
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
    // 連続する画像だけの段落をdiv.image-gridにまとめてミニグリッド表示する
    // ```embed```コードブロックをYouTube埋め込み、リンクカードに変換する
    processor: unified({ rehypePlugins: [rehypeImageGrid, rehypeEmbed] }),
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx(), sitemap()]
});
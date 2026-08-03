// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified } from '@astrojs/markdown-remark';
import rehypeImageGrid from './src/lib/rehypeImageGrid.ts';

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
    // TODO: 独自ドメイン取得後、pub-xxxx.r2.devの暫定URLをimages.necotan-log.comに差し替える
    domains: ['images.necotan-log.com', 'pub-571d1bb6e7c84451a5b20621ad0d8417.r2.dev'],
  },

  markdown: {
    // 連続する画像だけの段落をdiv.image-gridにまとめてミニグリッド表示する
    processor: unified({ rehypePlugins: [rehypeImageGrid] }),
  },

  vite: {
    plugins: [tailwindcss()]
  },

  integrations: [mdx(), sitemap()]
});
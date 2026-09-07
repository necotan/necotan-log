import type { APIRoute } from 'astro';
import icon192Url from '../assets/icon-192x192.png?url';
import icon512Url from '../assets/icon-512x512.png?url';

// アイコンURLは内容ハッシュ付きで出力されるため、画像を差し替えるとURLが自動で変わる
export const GET: APIRoute = () => {
  const manifest = {
    name: 'necotan log.',
    short_name: 'necotan log.',
    description: 'necotan log.は、写真・カメラ、愛車、デスク環境、個人開発など、日々の記録を残すために作成した個人ブログです。',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#fafafa',
    icons: [
      { src: icon192Url, sizes: '192x192', type: 'image/png' },
      { src: icon512Url, sizes: '512x512', type: 'image/png' },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { 'Content-Type': 'application/manifest+json' },
  });
};

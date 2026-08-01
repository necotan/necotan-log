# necotan log.

写真・カメラ、愛車、デスク環境、個人開発などの日々の記録を残す個人ブログです。Astroで構築し、Cloudflare Pagesでホスティングしています。

## 技術スタック

- [Astro](https://astro.build/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@fontsource-variable/inter](https://fontsource.org/fonts/inter) / [@fontsource-variable/noto-sans-jp](https://fontsource.org/fonts/noto-sans-jp)
- [@lucide/astro](https://lucide.dev/)
- Cloudflare Pages / Cloudflare R2

## プロジェクト構成

```text
/
├── src/
│   ├── components/       # ArticleCard, Header, MobileMenu, TableOfContents など
│   ├── content/
│   │   └── blog/         # 記事本体(Markdown/MDX、年フォルダ単位で管理)
│   │       └── 2026/     # 例: 2026-08-01.md
│   ├── content.config.ts # 記事のフロントマタースキーマ(zod)
│   ├── layouts/          # BaseLayout, ArticleLayout
│   ├── lib/              # categories.ts, navigation.ts, readingTime.ts など
│   ├── pages/            # ルーティング(index, about, category/[category], tag/[tag], blog/[...slug] など)
│   └── styles/           # global.css(テーマ変数・記事本文タイポグラフィ)
├── astro.config.mjs
└── package.json
```

## 記事の書き方

`src/content/blog/年/日付.md`(例: `src/content/blog/2026/2026-08-01.md`)の形でMarkdownファイルを追加する。年フォルダを跨いでも `content.config.ts` のglobパターンが再帰的に読み込むため、設定変更は不要。

URLはファイルパス(年フォルダ以下)がそのままスラッグになるため、公開後にファイルを移動・リネームするとURLが変わり既存リンクが404になる点に注意。

フロントマターは以下の通り。

```yaml
---
title: "記事タイトル"
description: "一覧・OGPで使う概要文"
pubDate: 2026-08-01
category: essay # (photo、life、essay)
tags: ["タグ1", "タグ2"] # /tag/[tag]/ ページ生成に使用する
heroImage: "https://images.necotan-log.com/..." # 未設定ならプレースホルダー表示する
draft: false # trueにすると一覧・RSSから除外される
---
```

- カテゴリの定義・ラベルは [src/lib/categories.ts](src/lib/categories.ts)
- ナビゲーション項目は [src/lib/navigation.ts](src/lib/navigation.ts)

## コマンド

| コマンド                   | 内容                                              |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | 依存関係のインストール                              |
| `npm run dev`             | ローカル開発サーバーを `localhost:4321` で起動        |
| `npm run build`           | `./dist/` に本番用サイトをビルド                      |
| `npm run preview`         | ビルド済みサイトをローカルでプレビュー                  |
| `npm run astro check`     | 型・Astroファイルのチェック                           |

## 参考

- [Astro Docs](https://docs.astro.build)

<h1 align="center">necotan log.</h1>

<p align="center">
  <img src="public/necotan-log.png" width="120" alt="necotan log.">
</p>

<p align="center">
  A personal blog documenting everyday life — photography & cameras, my car, desk setup, and side projects.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss&logoColor=white">
  <img src="https://img.shields.io/badge/Cloudflare-Workers%20%2F%20R2-F38020?logo=cloudflare&logoColor=white">
  <br>
  <a href="https://necotan-log.com"><img src="https://img.shields.io/badge/Domain-necotan--log.com-000000?logo=data:image/svg%2bxml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxjaXJjbGUgY3g9IjEyIiBjeT0iMTIiIHI9IjEwIi8+PHBhdGggZD0iTTEyIDJhMTQuNSAxNC41IDAgMCAwIDAgMjAgMTQuNSAxNC41IDAgMCAwIDAtMjAiLz48cGF0aCBkPSJNMiAxMmgyMCIvPjwvc3ZnPg=="></a>
</p>

## 技術スタック

- [Astro](https://astro.build/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@fontsource-variable/inter](https://fontsource.org/fonts/inter) / [@fontsource-variable/noto-sans-jp](https://fontsource.org/fonts/noto-sans-jp)
- [@lucide/astro](https://lucide.dev/)
- [Pagefind](https://pagefind.app/)
- Cloudflare Workers / Cloudflare R2

## プロジェクト構成

```text
/
├── src/
│   ├── assets/           # ファビコン・PWAアイコン
│   ├── components/       # ArticleCard, Header, MobileMenu, SearchPanel, ImageViewer, TableOfContents など
│   ├── content/
│   │   └── blog/         # 記事本体
│   │       └── 2026/     # 例: 2026-08-01.md
│   ├── content.config.ts # 記事のフロントマタースキーマ(zod)
│   ├── layouts/          # BaseLayout, ArticleLayout
│   ├── lib/              # categories.ts, navigation.ts, rehypeEmbed.ts, rehypeImageGrid.ts, linkCard.ts など
│   ├── pages/            # ルーティング([...page](トップ・ページネーション), about, search, category/[category], tag/[tag], blog/[...slug], rss.xml, robots.txt, 404 など)
│   └── styles/           # global.css
├── public/
│   └── _headers          # セキュリティヘッダ
├── .cache/
│   └── link-cards.json   # リンクカードのOGPキャッシュ
├── astro.config.mjs
├── wrangler.jsonc        # Cloudflare Workersのデプロイ設定
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
heroImage: "https://images.necotan-log.com/..." # 一覧カード、OGP、検索結果のサムネイル(未設定の場合、カードはプレースホルダー、OGPは og-default.png になる)
showHeroImage: false # trueにすると記事ページの本文上部にもheroImageを表示する(デフォルトはfalse)
draft: false # trueにすると記事ページ自体を生成せず、一覧・RSSからも除外される
---
```

- カテゴリの定義・ラベルは [src/lib/categories.ts](src/lib/categories.ts)
- ナビゲーション項目は [src/lib/navigation.ts](src/lib/navigation.ts)

### 縦写真のペア表示(image-grid)

Markdown画像のtitle記法でマーカー `vertical` を指定すると、rehypeプラグイン [src/lib/rehypeImageGrid.ts](src/lib/rehypeImageGrid.ts) が該当段落を `<div class="image-grid">` に変換する。

```md
![1](https://images.necotan-log.com/... "vertical")
![2](https://images.necotan-log.com/... "vertical")
```

- 変換条件：子要素が `<img>`(と空白テキスト)のみの `<p>` で、`<img>` がちょうど2つ、かつ両方の `title` が `vertical` であること。条件を満たさない段落は `<p>` のまま出力する。
- レイアウト：`global.css` の `.article-body .image-grid` で2カラムのCSS Gridにする(639px以下は1カラム)。
- 画像のみの `<p>` では、ツールチップとして表示されないよう `title="vertical"` を出力前に削除する。

### 埋め込み・リンクカード

`embed` コードブロックにURLを1つ書くと、YouTubeは埋め込みプレーヤー、それ以外はOGPを取得したリンクカードに変換される。

````md
```embed
https://example.com/
```
````

リンクカードのOGPはビルド時に取得し、`.cache/link-cards.json` に保存する。本番ビルドは毎回クリーンな環境で走るため、このファイルもコミットしてローカルで取得した結果を使用する。

- リンクカードを含む記事を追加したら、`npm run dev` か `npm run build` を実行し `.cache/link-cards.json` を更新して、記事と一緒にコミットする。
- 保存済みのURLは再取得しない。リンク先のOGPを取り直したいときは、該当エントリを削除してから再度ビルドする。
- 取得に失敗したURLは保存されず、ビルドログに `[linkCard]` の警告が出る。本番でも再取得を試み、失敗すればホスト名だけのカードになる。

## コマンド

| コマンド                   | 内容                                              |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | 依存関係のインストール                              |
| `npm run dev`             | ローカル開発サーバーを `localhost:4321` で起動        |
| `npm run build`           | `./dist/` に本番用サイトをビルドし、Pagefindで検索インデックスを生成 |
| `npm run preview`         | ビルド済みサイトをローカルでプレビュー                  |
| `npm run astro check`     | 型・Astroファイルのチェック                           |

## 参考

- [Astro Docs](https://docs.astro.build)

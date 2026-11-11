<h1 align="center">necotan log.</h1>

<p align="center">
  English | <a href="README.ja.md">日本語</a>
</p>

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

## Tech Stack

- [Astro](https://astro.build/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [@fontsource-variable/inter](https://fontsource.org/fonts/inter) / [@fontsource-variable/noto-sans-jp](https://fontsource.org/fonts/noto-sans-jp)
- [@lucide/astro](https://lucide.dev/)
- [Pagefind](https://pagefind.app/)
- Cloudflare Workers / Cloudflare R2

## Project Structure

```text
/
├── src/
│   ├── assets/           # Favicons and PWA icons
│   ├── components/       # ArticleCard, Header, MobileMenu, SearchPanel, ImageViewer, TableOfContents, etc.
│   ├── content/
│   │   └── blog/         # Articles
│   │       └── 2026/     # e.g. 2026-08-01.md
│   ├── content.config.ts # Article frontmatter schema (zod)
│   ├── layouts/          # BaseLayout, ArticleLayout
│   ├── lib/              # categories.ts, navigation.ts, rehypeEmbed.ts, rehypeImageGrid.ts, linkCard.ts, etc.
│   ├── pages/            # Routes ([...page] (top and pagination), about, search, category/[category], tag/[tag], blog/[...slug], rss.xml, robots.txt, 404, etc.)
│   └── styles/           # global.css
├── public/
│   └── _headers          # Security headers
├── .cache/
│   └── link-cards.json   # OGP cache for link cards
├── .node-version         # Node.js version used for builds
├── astro.config.mjs
├── wrangler.jsonc        # Cloudflare Workers deploy settings
└── package.json
```

## Writing Articles

Add a Markdown file at `src/content/blog/<year>/<date>.md` (e.g. `src/content/blog/2026/2026-08-01.md`). The glob pattern in `content.config.ts` reads year folders recursively, so a new year needs no config change.

The file path under the year folder becomes the URL slug. Moving or renaming a file after publishing changes its URL, and existing links will return 404.

The frontmatter is as follows.

```yaml
---
title: "Article title"
description: "Summary used in article lists and OGP"
pubDate: 2026-08-01
category: essay # (photo, life, essay)
tags: ["tag1", "tag2"] # Used to generate /tag/[tag]/ pages
heroImage: "https://images.necotan-log.com/..." # Thumbnail for list cards, OGP, and search results (if unset, the card shows a placeholder and OGP uses og-default.png)
showHeroImage: false # If true, heroImage is also shown above the body on the article page (default: false)
draft: false # If true, the article page is not generated and the article is excluded from lists and RSS
---
```

- Category definitions and labels: [src/lib/categories.ts](src/lib/categories.ts)
- Navigation items: [src/lib/navigation.ts](src/lib/navigation.ts)

### Drafts

Put unfinished articles in `src/content/blog/drafts/`. This folder is git-ignored, so drafts are never committed. They appear in article lists and at `/blog/drafts/<file name>/` only under `npm run dev`, and are left out of the `npm run build` output.

To publish a draft, move the file to `src/content/blog/<year>/` and commit it.

- Drafts are not tracked by git, so they exist only on your local machine.
- The `drafts/` folder itself is not in git either, so create it yourself on another machine.
- Drafts are still validated against the frontmatter schema. If a required field is missing, `npm run build` and `npm run typecheck` fail.

### Checks on Articles

- `description` must be English (ASCII only). The schema in `content.config.ts` rejects anything else, and `npm run typecheck` and `npm run build` fail.
- Leave the `alt` of a photo empty (`![](url)`), or write a description when the article does not make sense without the photo. A camera file name such as `DSCF9935` is read aloud by screen readers as it is, so [src/lib/rehypeArticleCheck.ts](src/lib/rehypeArticleCheck.ts) fails the build.
- Start headings at `##` and do not skip levels (`##` -> `####`). The same plugin fails the build.

### Pairing Vertical Photos (image-grid)

Put the marker `vertical` in the title of Markdown images, and the rehype plugin [src/lib/rehypeImageGrid.ts](src/lib/rehypeImageGrid.ts) converts the paragraph into `<div class="image-grid">`.

```md
![](https://images.necotan-log.com/... "vertical")
![](https://images.necotan-log.com/... "vertical")
```

- Conditions: a `<p>` whose children are only `<img>` elements (and whitespace text), with exactly two `<img>` elements, both with `title` set to `vertical`. Paragraphs that don't match stay as `<p>`.
- Layout: `.article-body .image-grid` in `global.css` makes it a two-column CSS Grid (one column at 639px and below).
- In image-only `<p>` elements, `title="vertical"` is removed before output so it doesn't show as a tooltip.

### Embeds and Link Cards

Write a single URL in an `embed` code block. YouTube URLs become an embedded player; other URLs become a link card built from the page's OGP.

````md
```embed
https://example.com/
```
````

Link card OGP is fetched at build time and saved to `.cache/link-cards.json`. Production builds always run in a clean environment, so this file is committed and the results fetched locally are used.

When adding a link card, work in the order below. Fetching OGP means the Node.js on the machine running the build processes responses from external sites.

1. Check where the URL points, and limit it to trustworthy domains with a clearly identifiable operator.
2. Make sure your local Node.js is at or above the version in `.node-version`, then run `npm run dev` or `npm run build`.
3. Check that the build log has no `[linkCard]` warnings, then commit `.cache/link-cards.json` together with the article.

- Saved URLs are not fetched again. To refetch a page's OGP, delete its entry and build again.
- URLs that fail to fetch are not saved, and a `[linkCard]` warning appears in the build log. Production builds also try to fetch them; if that fails, the card shows only the host name.

The following three were considered and not adopted.

- No favicon. A row of icons in different colors per site doesn't fit the monotone design, and Google's favicon service would send the linked domain to Google on every page view.
- Cards are built as hast nodes in `rehypeEmbed.ts`, not as HTML strings. This leaves escaping of strings fetched from linked sites to the serializer instead of hand-written code.
- The `alt` of og:image is empty. The title is already shown in the card, so screen readers would otherwise read the same text twice.

## Node.js Version

- The Node.js version for builds is set in `.node-version`. Cloudflare Workers Builds reads this file to install Node.js.
- `engines` in `package.json` lists the allowed version range (at or above the security release of each line).
- When a Node.js security release comes out, update `.node-version`, `engines`, and your local Node.js.
- Cloudflare Workers Builds installs dependencies by running `npm clean-install` with the build environment's npm (10.9.2, shown in the build log), not the npm bundled with Node.js. A lockfile created with local npm (11.x) can be judged inconsistent by this npm and fail the build, so after updating dependencies, run `npx npm@10.9.2 ci --dry-run` before pushing to check (the `pre-commit` hook does this).

## Commands

| Command                   | Action                                            |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Install dependencies                              |
| `npm run dev`             | Start the local dev server at `localhost:4321`    |
| `npm run build`           | Build the production site to `./dist/` and generate the Pagefind search index |
| `npm run preview`         | Preview the built site locally                    |
| `npm run lint`            | Run ESLint (warnings fail too)                    |
| `npm run typecheck`       | Check types and Astro files (`astro check`)       |

## Git Hooks (for committing changes)

Enable the hooks in `.githooks/` once per clone.

```sh
git config core.hooksPath .githooks
```

- `pre-commit` runs `npm run lint` and `npm run typecheck`, rejects image files outside `src/assets/` and `public/`, and runs `npx npm@10.9.2 ci --dry-run` when `package-lock.json` is staged.
- `commit-msg` checks the format of the first line of the commit message.

## References

- [Astro Docs](https://docs.astro.build)

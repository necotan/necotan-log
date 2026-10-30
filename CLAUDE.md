# CLAUDE.md

## Language rules

- Respond to the user in Japanese.
- Commit messages: first line in English, all following lines in Japanese.
- Write code comments in Japanese.
- Use English for variable names, function names, file names, and translation keys.
- Articles: write `title` and the body in Japanese and `description` in English. Series titles stay in English (e.g. `Monthly log｜2026.09`).

## Project

**necotan log.**: a personal blog about photography and cameras, my car (Toyota 86, ZN6), desk setup, and side projects, served at `necotan-log.com`.
Article format, embeds, link cards, and the Node.js version policy are in `README.md`.

- Astro 7 (static output) with Content Collections and MDX, Tailwind CSS v4, `@lucide/astro`, Pagefind.
- Hosting: Cloudflare Workers static assets (`wrangler.jsonc`). Photos: Cloudflare R2 at `images.necotan-log.com`.

## Commands

- `npm run dev` / `npm run preview`
- `npm run build`: `astro build`, then the Pagefind index into `dist/`
- `npx astro check`: type check
- There is no lint script or test suite.

## After every change

- Run `npx astro check` and `npm run build`.
- For UI changes, check both PC and smartphone layouts, especially the header nav and `MobileMenu`.
- After changing dependencies, run `npx npm@10.9.2 ci --dry-run` before pushing. Cloudflare Workers Builds installs with npm 10.9.2 and can reject a lockfile written by npm 11.

## Layout

- `src/content.config.ts`: collection schema. Astro 6+ reads only this path, not `src/content/config.ts`.
- `src/content/blog/<year>/<date>.md`: articles. The path is the URL slug, so moving or renaming a published article breaks its URL.
- `src/components/`: keep `Header`, `MobileMenu`, `Footer`, `ArticleCard`, and `TableOfContents` as separate components. Every article card (top, category, tag, related posts) uses the shared `ArticleCard`.
- `src/layouts/`: `BaseLayout`, `ArticleLayout`. `src/lib/`: shared logic and rehype plugins. `src/styles/global.css`: color tokens and `@layer components`. `src/pages/`: file-based routing.
- `docs/design.md`: design decisions (tracked). The rest of `docs/` is local-only notes (git-ignored), some outdated; use them only as a reference when stuck.
- File names: components in PascalCase, everything else in camelCase.

## Architecture

- Islands Architecture: zero JS by default; hydrate only the parts that need it with `client:*`. Current interactivity uses `<script>` in `.astro` files, and no React integration is installed. Add React (function components with Hooks) or shadcn/ui only when a complex dynamic UI cannot be done otherwise.
- MUST NOT commit photos to the repository. Serve them from R2 and optimize them through `astro:assets`; the R2 domain is registered in `image.domains` in `astro.config.mjs`. `src/assets/` holds only favicons and PWA icons.
- NEVER hard-code Cloudflare API tokens or secrets. Use environment variables.

## Design

Read `docs/design.md` before changing UI, colors, navigation, or article layout. Ask before adding a logo, an accent color, or a comment section.

## Coding

- TypeScript. Do not use `any` or omit type definitions.
- CSS: Tailwind utilities. Put custom CSS only in `@layer components`. No inline `style`.
- Accessibility: give every image `alt`, do not skip heading levels (h1 → h2 → h3), keep `focus-visible` styles.
- Performance: aim for Lighthouse 90+ in Performance, Accessibility, Best Practices, and SEO.

## Comments

- Write only why: the reason for a choice, workarounds for browser or library quirks (iOS Safari, Astro, Tailwind, etc.), and constraints the code alone does not show.
- Do not write what the code, names, or markup already say (e.g. "ハンバーガーメニュー", "目次", "〜の処理"). If there is no why to explain, write no comment.
- No decorative characters such as `---`, `===`, `***`.

## Git workflow

- MUST NOT run `git commit`, `push`, `checkout -b`, PR creation, `merge`, or `pull`. The user runs them.
- At the start of work, propose a branch name (`feature/xxx` or `fix/xxx`). Suggest pushing directly to main only when the change is visual only (CSS, text, colors) with no logic impact, and small enough to review the diff by eye.
- After code changes, run `git status` and `git diff` (plus `git diff --staged` if anything is staged), then propose a commit message based on the actual diff.

## Commit messages

| Prefix | Use |
|---|---|
| fix | Bug fix |
| add | New file or feature |
| update | Feature change (not a bug) |
| change | Spec change |
| clean | Cleanup, refactoring |
| disable | Disable, comment out |
| remove | Remove a file or feature |
| upgrade | Version upgrade |
| revert | Revert a change |

- Line 1: `<prefix>: <summary in English>`.
- The body is optional. For a small change that line 1 fully describes, write line 1 only. Otherwise add a blank line and 1 to about 4 Japanese bullets; do not pad to reach 4.
- Bullets name the concrete files, components, classes, CSS properties, or storage targets changed and how.
- Only when the user explicitly asks for causes or background, write prose with the root cause and the fix approach.

```
update: document Cloudflare build npm version check in README
```

```
add: collapsible table of contents

- TableOfContents.astro のデスクトップ版に開閉ボタンを追加
- 開閉状態は html の .toc-collapsed クラスで持ち、@custom-variant で参照
- grid-template-rows/columns の fr 補間で折り畳みと本文幅の変化をアニメーション
- localStorage に保存し、BaseLayout の head インラインスクリプトで描画前に復元
```

# Design

Design decisions for necotan log. Read this before changing UI, colors, navigation, or article layout.

## Tone

- Minimal and monochrome. Grayscale only; categories are not color-coded. Ask before adding an accent color.
- No logo image. The site name is the text wordmark `necotan log.`.

## Color

- Use only the tokens below, never raw Tailwind colors (`neutral-*`) or hex values in components. Their values live in `src/styles/global.css` for both themes (Tailwind `neutral`; `gray` is avoided because it is bluish).

| Token | Use |
|---|---|
| `bg` | Page background |
| `bg-subtle` | Raised surfaces: header panel, article cards, search panel |
| `fg` | Body text and headings |
| `fg-muted` | Secondary text: dates, meta, captions, footer |
| `border` | Dividers and outlines |
| `badge-bg` / `badge-fg` | Category badge in `ArticleCard` |

- The only colored values are the window dots on the 404 terminal (`--terminal-dot-*`). Do not treat them as a precedent for accent colors.
- The theme switches by the `.dark` class on `<html>`, not by `prefers-color-scheme`. Style both themes through the tokens.

## Typography

- Inter for Latin text, falling back to Noto Sans JP for Japanese (`--font-sans`).

## Navigation

- PC: the header shows every item in `navGroups` (`src/lib/navigation.ts`).
- Mobile: an icon-only hamburger opens the full-screen `MobileMenu`. The button has no visible label; its accessible name comes from `aria-label`. Do not use a dropdown or horizontal-scroll tabs.

## Articles

- The TOC is generated from h2/h3. When an article has no headings, render no TOC block.
- No comment section. Share buttons replace it (currently X only).

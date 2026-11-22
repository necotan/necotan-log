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
| `surface` | Clickable cards separated by fill alone, without a border (older/newer post links). `bg-subtle` is white in light mode and nearly invisible on `bg`, so do not use it for these |
| `chip-bg` / `chip-bg-hover` | Fill of unselected pills (`.pill-default`) |
| `glass-border` | Outline of the translucent header panel (`.glass-panel`) |

- The only colored values are the window dots on the 404 terminal (`--terminal-dot-*`). Do not treat them as a precedent for accent colors.
- The theme switches by the `.dark` class on `<html>`, not by `prefers-color-scheme`. Style both themes through the tokens.
- The theme toggle fades the tokens themselves on `:root`, not each element, and stops element transitions while `.theme-transition` is set. Fading per element left icons lagging on iOS and nav links switching instantly. A new token that differs between themes must be registered with `@property` as `<color>` and added to the `:root.theme-transition` list in `global.css`; otherwise it switches instantly while everything else fades.
- Give every link its own color class (`text-fg-muted` or `text-fg`) instead of inheriting from the parent. Until the CSS loads, an inheriting link shows the browser's default blue or purple.

## Buttons and pills

- Clickable pills (category filter, article category and tags, share button, pagination) use `.pill` plus one of the variants in `global.css`. Outlined pills with muted text were hard to recognize as clickable, so pills are filled and have no border.
  - `.pill-default`: `chip-bg` fill with `fg` text.
  - `.pill-active`: inverted (`fg` fill, `bg` text). Use it only for the selected state, with `aria-current`. Actions such as Share on X use `.pill-default`; an inverted action button stood out too much in the monochrome layout.
- Non-clickable labels inside a larger link get no fill. The category in `ArticleCard` is plain `fg-muted` text, because a filled badge looked like a separate button.

## Typography

- Inter for Latin text, falling back to Noto Sans JP for Japanese (`--font-sans`).

## Navigation

- PC: the header shows every item in `navGroups` (`src/lib/navigation.ts`).
- Mobile: an icon-only hamburger opens the full-screen `MobileMenu`. The button has no visible label; its accessible name comes from `aria-label`. Do not use a dropdown or horizontal-scroll tabs.

## Articles

- The TOC is generated from h2/h3. When an article has no headings, render no TOC block.
- No comment section. Share buttons replace it (currently X only).

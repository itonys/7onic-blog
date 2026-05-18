---
title: 'Token Deep Dive #2: The /50 That Did Nothing'
description: >-
  I converted design tokens to CSS var() for cleaner SSOT. Every /50
  modifier stopped working. Tailwind v3 didn't warn me once.
  Here's the three-tier fix.
pubDate: '2026-05-18T07:36:36.000Z'
category: tokens
tags:
  - design-tokens
  - tailwind
  - css-variables
  - tailwind-v3
  - token-pipeline
series: token-deep-dive
seriesOrder: 2
draft: false
---

The other day, I noticed something funky with my accordion component's hover state.

It wasn't broken in an obvious, "error-thrown-in-console" kind of way. The background color changed when I hovered over it, sure, but the opacity was completely gone. I had explicitly coded `hover:bg-background-muted/50`, but instead of a nice, subtle 50% tint, I was getting a solid, opaque slap of color. Same went for my glassmorphism effects (`bg-white/10`) — just pure, blinding white.

At first, I went down the usual rabbit holes: Is it a specificity issue? Did I miss an import somewhere?

It took me longer than I'd like to admit to connect the dots to a change I'd pushed a few days prior: converting every single color in our [7onic](https://7onic.design) Tailwind v3 preset from hardcoded HEX values to CSS `var()` references.

At the time, I thought I was a genius. I thought I was building the ultimate clean architecture.

Spoiler alert: I wasn't.

## The "Single Source of Truth" That Betrayed Me

The dream was beautiful. I was setting up a token pipeline where `figma-tokens.json` was the Single Source of Truth. Run one build script, and it spits out eleven different distribution formats — CSS variables, Tailwind presets, TypeScript types, you name it.

The goal was simple: keep the Tailwind v3 preset perfectly synchronized with those Figma tokens without the nightmare of maintaining separate, duplicated HEX values in a JS file.

So I mapped every token reference to a CSS variable:

```js title="tokens/tailwind/v3-preset.js"
colors: {
  primary: {
    DEFAULT: 'var(--color-primary)',
  },
  background: {
    muted: 'var(--color-background-muted)',
  },
}
```

Look at that. Whenever a designer shifted a hex code in Figma, `npm run sync-tokens` would handle the rest downstream.

Except the moment this shipped, `bg-primary/50` died. So did `border-border/60`, `text-foreground/80`, `bg-gray-500/30`. Every single opacity modifier across the entire component library silently stopped working.

The truly embarrassing part? I had literally written the documentation for this pipeline a month earlier, explicitly stating that Tailwind v3 opacity modifiers require decomposable color values. I read it. I wrote it. And then I completely ignored it because I was blinded by how clean the `var()` refactoring looked. Classic.

## Why Tailwind v3 Chokes on CSS Variables

Here's the technical reality: Tailwind v3 handles opacity modifiers at build time.

When the JIT compiler scans your code and sees `bg-primary/50`, it looks up `primary` in your Tailwind config. It expects a raw value — like a HEX or RGB string — that it can physically decompose into individual R, G, B channels to output `rgba(R, G, B, 0.5)`. This is all build-time string manipulation.

When you pass it `var(--color-primary)`, the compiler hits a wall. It has no idea what RGB values that variable will resolve to, because that resolution happens at runtime in the browser. So instead of throwing an error, it just discards the `/50` alpha channel entirely and outputs the base color as a solid block.

Tailwind v4 doesn't suffer from this. It delegates the heavy lifting to the browser using the native `color-mix()` function:

```css
/* What bg-primary/50 compiles to in Tailwind v4 */
background-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
```

Since the browser handles the blending at runtime, v4 doesn't need to know the raw RGB channels at build time. But when I was building this, forcing everyone onto v4 wasn't an option — and the 7onic token package had to support both v3 and v4.

## The Three-Tier Compromise

Fixing the static, primitive colors like `gray-500` was easy. I swallowed my pride and reverted them back to raw HEX strings: `gray-500: '#78787C'`. These core palette shades never change based on the active theme anyway, so hardcoding them in the JS preset was fine, and it instantly brought opacity modifiers back to life.

Semantic colors were a different problem. `background-muted` needs to resolve to a light gray in light mode and a dark charcoal in dark mode. It has to be a CSS variable at runtime to handle theme toggling — but it also needs to be decomposable at build time for Tailwind v3.

Tailwind v3 has a built-in escape hatch for exactly this dilemma. Instead of `'var(--color-background-muted)'`, you write `'rgb(var(--color-background-muted-rgb) / <alpha-value>)'`. The `<alpha-value>` is a special placeholder Tailwind swaps out with the actual opacity percentage during compilation. The catch: you need a companion CSS variable that holds only the space-separated R G B numbers, not a full HEX code.

The three-tier breakdown:

| Type | Preset format | Reason |
|------|--------------|--------|
| Primitive colors (gray-500, primary-400…) | HEX directly | Static values, `/50` works out of the box |
| Semantic colors (primary, background…) | `rgb(var(--*-rgb) / <alpha-value>)` | Theme-aware at runtime + alpha at build time |
| Non-color tokens (spacing, radius…) | `var()` | Opacity doesn't apply here |

The preset ends up looking like this:

```js title="tokens/tailwind/v3-preset.js"
colors: {
  primary: {
    DEFAULT: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
  },
  background: {
    muted: 'rgb(var(--color-background-muted-rgb) / <alpha-value>)',
  },
}
```

And the theme CSS files expose those raw companion variables:

```css title="tokens/css/themes/light.css"
--color-background-muted: var(--color-gray-100);
--color-background-muted-rgb: 244 244 246;
```

```css title="tokens/css/themes/dark.css"
--color-background-muted: var(--color-gray-700);
--color-background-muted-rgb: 60 60 60;
```

When the theme changes, the browser swaps the underlying RGB numbers. Tailwind's pre-baked alpha placeholder handles the transparency. `hover:bg-background-muted/50` works correctly in both modes.

## Automating 135 Companion Variables Because I Value My Sanity

I had 82 primitive color tokens and 53 semantic colors per theme. Calculating and writing those `-rgb` channel variables by hand was not happening — it's tedious and drifts the moment a token value changes.

So I hooked it into `sync-tokens.ts`. A `hexToRgb` helper converts `#F4F4F6` → `"244 244 246"` (space-separated, which is what modern CSS color syntax expects):

```ts title="scripts/sync-tokens.ts"
function hexToRgb(hex: string): string | null {
  const match = hex.replace('#', '').match(/^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i)
  if (!match) return null
  return `${parseInt(match[1], 16)} ${parseInt(match[2], 16)} ${parseInt(match[3], 16)}`
}
```

Now every time the build pipeline runs, the script reads the original HEX values from `figma-tokens.json`, extracts the raw channels, and outputs both variables side by side. The source file stays clean. The `-rgb` values are derived, not stored — generated automatically, never manually maintained.

For semantic tokens, the script resolves the full reference chain (semantic → primitive → final HEX) for both light and dark modes, emitting the correct channel values per theme.

## The One Gotcha That Still Trips People Up

If you're using `@7onic-ui/tokens` in a Tailwind v3 project and opacity modifiers suddenly vanish, 9 times out of 10 it's a missing theme import.

Importing just `variables.css` isn't enough. Because semantic `-rgb` variables have different values per theme, they live inside `light.css` and `dark.css`. If those theme files aren't imported, the `-rgb` variables are undefined — and `bg-background-muted/50` either renders transparent or drops the background entirely, depending on the browser.

It's documented right there in the getting started guide. Some lessons are best learned by breaking it first.

---

*Next: v3 and v4 dual support from one token source — how the two presets stay in sync and why the v3 format necessarily does more work.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

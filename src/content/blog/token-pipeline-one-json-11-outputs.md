---
title: 'Design to Code #2: One JSON, Eleven Outputs'
description: >-
  How a single JSON file generates 11 distribution formats — and the three
  problems I ran into building the sync-tokens pipeline for 7onic.
pubDate: 2026-04-17
category: tokens
tags:
  - design-tokens
  - token-pipeline
  - tailwind
  - typescript
series: design-to-code
seriesOrder: 2
draft: false
---

The entire [7onic](https://7onic.design) design system runs on a single JSON file.

It's 1,847 lines long.

Colors live there as hex values like `#6B21A8`. Spacing is stored as plain numbers like `16`. Border radius uses the same format. Animations are defined as keyframe objects. If you've ever exported tokens from Figma Token Studio, it would look instantly familiar.

Because that's exactly what it is.

The file is called `figma-tokens.json`, and it's the only place in the codebase where design values are allowed to exist.

Everything else is generated from it.

One command reads that file and spits out 11 distribution files in about 200 milliseconds. Change a color. Run the script. Ship it.

That's the whole pipeline.

Getting there, however, was a lot messier.

## Why one file somehow became eleven

At first glance, eleven output files sounds excessive.

Why not just generate one universal token file and call it a day?

Because different environments want completely different things.

A Tailwind v3 project expects a preset. Tailwind v4 wants `@theme`. A developer writing vanilla CSS doesn't care about either of those — they just want CSS variables. Someone building outside React may only need TypeScript types. Another team may want raw JSON for internal tooling.

Same source. Different consumers.

So the pipeline produces:

- `css/variables.css` — primitive CSS variables
- `css/themes/light.css` — semantic light theme
- `css/themes/dark.css` — semantic dark theme
- `css/all.css` — bundled CSS
- `tailwind/v3-preset.js`
- `tailwind/v4-theme.css`
- `tailwind/v4.css`
- `js/index.js` — CommonJS
- `js/index.mjs` — ESM
- `types/index.d.ts` — TypeScript declarations
- `json/tokens.json` — processed token output

Most of these were straightforward.

A few of them absolutely were not.

## The day `bg-primary/50` broke everything

The first version of the pipeline was beautifully naive.

Read JSON. Loop tokens. Generate CSS variables. Generate Tailwind config. Done.

Then I tried:

```html
<div class="bg-primary/50">
```

And nothing happened.

Turns out Tailwind's opacity modifiers need access to the actual color channels so they can inject alpha values. That works fine with hex colors.

It does not work with this:

```css
var(--color-primary)
```

To Tailwind, a CSS variable is just a string. It can't crack it open, inspect the hex, and rebuild it with opacity.

So I had to generate a second version of every color token:

```css
--color-primary: #6B21A8;
--color-primary-rgb: 107, 33, 168;
```

Now Tailwind v3 can do this:

```css
rgb(var(--color-primary-rgb) / <alpha-value>)
```

Which means these finally work:

- `bg-primary/50`
- `border-border/40`
- `text-foreground/80`

So yes, every color now ships twice: once as hex, once as RGB channels.

Elegant? Debatable. Effective? Absolutely.

Tailwind v4 made this easier later thanks to native `color-mix()`, but v3 made me earn it first.

## Dark mode: where simple ideas go to die

Dark mode starts innocently.

Put light values on `:root`. Put dark values on `.dark`. Toggle a class on `<html>`.

Classic. Reliable. Works great in Tailwind v3.

Then Tailwind v4 arrived with a different philosophy: use system preferences.

```css
@media (prefers-color-scheme: dark)
```

Also reasonable.

Until a real user wants this:

> "My OS is dark, but I want your site in light mode."

That's where things get awkward.

If your entire dark mode strategy depends on `prefers-color-scheme`, overriding it cleanly becomes surprisingly annoying.

So the final system uses three strategies at once:

1. Follow OS preference by default
2. Respect explicit `data-theme="dark"`
3. Support legacy `.dark` class toggles

And there's one important escape hatch:

```html
<html data-theme="light">
```

That blocks OS dark mode and forces light mode.

Which sounds simple now.

It was not simple then.

## The Tailwind v4 trap no one warns you about

This one was painful because I discovered it after shipping.

I used:

```css
@theme inline
```

Seems harmless.

What it actually does is bake your token values directly into generated utilities.

So instead of:

```css
background-color: var(--color-primary);
```

You get:

```css
background-color: #6B21A8;
```

Looks identical in light mode.

Then you switch to dark mode... and nothing updates.

Because CSS variables can change. Hardcoded hex values cannot.

Dark mode didn't fail loudly.

It failed politely.

The fix was deleting one word:

```css
@theme
```

No `inline`.

That tiny difference now lives in script comments and architecture notes because future-me absolutely would have broken it again.

## TypeScript types, because eventually someone asks

The pipeline also generates declarations like:

```typescript
export declare const colorPrimary: string;
export declare const spacingMd: string;
```

Most of the time you won't need them.

But when you're wiring tokens into charts, runtime themes, config systems, or anything dynamic, typed access becomes very convenient.

And once generation is automated, adding it costs almost nothing.

## The only part that really matters

All of this is interesting engineering trivia.

But none of it is the real win.

The real win is this:

**Before**

- Design values lived in Figma
- Code values lived in the codebase
- Keeping them aligned required human discipline
- Human discipline eventually lost

**After**

- Values live in one file
- Everything else is derived
- Drift becomes structurally impossible

That's it.

The 11 outputs, RGB channels, dark mode logic, Tailwind quirks — those are implementation details.

The actual product is a system where design and code no longer argue about reality.

---

*Next: the CLI copies source files into your project instead of installing a package. That was a deliberate choice, and it has real trade-offs. Here's why copy-paste won.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

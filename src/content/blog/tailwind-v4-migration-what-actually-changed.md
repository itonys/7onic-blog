---
title: 'Tailwind Guides #1: What Actually Broke Migrating to v4'
description: >-
  Migrating from Tailwind CSS v3 to v4 while supporting both — the silent dark
  mode bug, reversed variant stacking, and the outline flash nobody warned
  about.
pubDate: 2026-04-17T12:00:00.000Z
category: tailwind
tags:
  - tailwind
  - tailwind-v4
  - migration
  - css
  - design-tokens
series: tailwind-guides
seriesOrder: 1
draft: false
devtoId: '3515176'
hashnodeId: 69e2132c15774c372747d5ca
---

I was halfway through shipping a component update when v4 dropped. My design system, [7onic](https://7onic.design), has to work with both Tailwind v3 and v4 — same components, same token source, two different output formats. So my reaction to the v4 announcement was less "exciting new features" and more "great, another output target to maintain."

I read the migration guide. It covered the syntax changes fine. What it didn't cover was that three of those changes would silently break things in ways that produced zero error messages and took hours to track down.

## The Config File Moved Into CSS

You've probably heard this one. `tailwind.config.js` becomes CSS. In v3, I had this big JavaScript preset mapping tokens to Tailwind's config:

```js title="v3-preset.js"
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary-rgb) / <alpha-value>)',
          hover: 'rgb(var(--color-primary-hover-rgb) / <alpha-value>)',
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        lg: 'var(--radius-lg)',
      },
    },
  },
}
```

In v4:

```css title="v4-theme.css"
@theme {
  --color-primary: #15A0AC;
  --color-primary-hover: #107A84;
  --radius-sm: 2px;
  --radius-lg: 8px;
}
```

The nice part is `bg-primary/50` just works now — v4 uses `color-mix()` internally, so you don't need the `rgb()` channel hack anymore. But what I actually appreciate more is the debugging. When a utility doesn't work in v3, I have to trace through JavaScript config merging logic. In v4, I open a CSS file and read it. Sounds small. It's not.

## @theme inline Killed My Dark Mode

OK so this is the one I'm still kind of mad about.

I used `@theme inline` because the docs said it avoids variable name collisions. Sounded reasonable. Everything worked in light mode. I toggled dark mode and the page just... stayed light.

I checked everything. `.dark` class on html — yes. CSS variables updating in DevTools — yes. Dark stylesheet loaded — yes. I even slapped a `background: red !important` rule inside my dark block just to prove the file was being read. It was. Variables were changing. But the actual page colors didn't move.

I wish I could say I figured it out quickly. I didn't. I spent an entire afternoon going in circles before I finally opened the compiled CSS and saw this:

```css
/* What I assumed Tailwind was generating */
.bg-primary { background-color: var(--color-primary); }

/* What @theme inline ACTUALLY generated */
.bg-primary { background-color: #15A0AC; }
```

`@theme inline` resolves everything at build time. It takes your CSS variables and replaces them with literal hex values in the output. So at runtime, your dark mode variables update correctly — but the utility classes aren't looking at variables anymore. They have hardcoded light-mode colors baked in.

The fix was just removing the word `inline`. Build size went up by 8.5KB (0.8KB gzipped). I cannot stress enough how little I care about that tradeoff.

What bugs me is the naming. "inline" sounds like a performance optimization or a scoping strategy. It doesn't sound like "we will throw away all your CSS variables and hardcode the resolved values." If the flag were called `@theme static` or `@theme resolved`, I would have caught this in five minutes instead of five hours. But it is what it is.

## Plugins Became @utility

Not much to say here honestly. v3 plugins become `@utility` blocks in CSS. I generate about 50 custom utilities (icon sizes, durations, z-index layers, focus rings) and the migration was completely mechanical. The v4 version is easier to read. Moving on.

## @source Failed Without Telling Me

The `content` array is now `@source` in CSS:

```css
@source "../src/**/*.{ts,tsx}";
```

I wrote the path relative to the project root because that's what `content` used. Tailwind generated an empty stylesheet. No error, no warning, nothing in the terminal. I spent twenty minutes convinced my PostCSS setup was broken before I realized: `@source` paths are relative to the CSS file, not the project root.

This is the kind of bug where you feel stupid once you figure it out, but also — a warning would be nice? "Hey, that glob matched zero files" would save a lot of people a lot of time.

## Variant Stacking Order Reversed

This one's painful if you support both versions.

v3 stacks variant selectors right-to-left. v4 stacks left-to-right. Same words, different order, different result:

```tsx
// v3 — innermost first
className="[&_div]:data-[state=checked]:bg-primary"

// v4 — outermost first
className="data-[state=checked]:[&_div]:bg-primary"
```

I found this in the Switch component. The toggle track styled correctly in v3, silently didn't apply in v4. No error — the generated CSS was valid, it just didn't match the DOM.

I don't have a great answer for this. My component code avoids complex variant stacking and the docs show v3/v4 examples side by side. It works, but it's not elegant.

## Dark Mode: Three Selectors for One Job

v3 dark mode was `darkMode: 'class'` and you're done. v4 defaults to `prefers-color-scheme`, which follows the OS. That's a better default until your user wants to force light mode while their OS is set to dark — because you can't override a media query from JavaScript.

I ended up with this:

```css title="dark.css"
/* Follow OS, unless user explicitly chose light */
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --color-background: var(--color-gray-900);
    --color-text: var(--color-gray-100);
  }
}

/* Manual override */
:root[data-theme="dark"],
:root.dark {
  --color-background: var(--color-gray-900);
  --color-text: var(--color-gray-100);
}
```

The `:not([data-theme="light"])` is what makes "force light" possible. The `.dark` class is v3 compat. Three selectors for the same variable declarations feels wrong, but each one handles a scenario the others can't, and I couldn't find a way to collapse them.

## The Outline Flash

Oh, this one. Tailwind v4 added `outline-color` to `transition-colors`. Inputs with focus rings now animate the outline appearing, which looks like a brief flash. I didn't notice for weeks — only caught it during unrelated side-by-side v3/v4 testing.

Fix: `outline-transparent` on the base state. One class. Applied it to Input, Textarea, and Select. The kind of thing nobody would file a bug about — you'd just feel like something was slightly off.

## Opacity Modifiers Got Good

In v3, `bg-primary/50` with CSS variables required decomposing every color into RGB channels. I generated 135 extra `--*-rgb` variables for this. Every new color token meant two more CSS variables. It worked, but it was a hack that I maintained grudgingly.

v4 uses `color-mix()`:

```css
background-color: color-mix(in srgb, var(--color-primary) 50%, transparent);
```

That's it. Any color format. No channel decomposition. I still generate the `-rgb` variables for v3 users, but the day I drop v3 support, an entire pipeline stage disappears.

Honestly this might be my favorite v4 change, even though it's the least dramatic. Removing a hack you've been carrying around for months feels disproportionately good.

---

If you're about to migrate: check dark mode first. Not "does it toggle" — check that every color you expect to change actually changes. That's where `@theme inline` hides, that's where the media query vs class assumption lives, and that's where I wasted the most time.

The rest is mostly find-and-replace. Dark mode is where your v3 instincts will lie to you.

---

*Next: I mentioned the `rgb()` channel hack for v3 opacity modifiers. That hack is part of a bigger story — how CSS variables and Tailwind actually interact, and why most guides get the setup wrong.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

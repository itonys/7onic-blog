---
title: "Design to Code #6: When @theme inline Killed My Dark Mode"
description: "7onic handles dark mode purely in CSS. One word from the Tailwind v4 migration guide silently broke it for every v4 user. The fix was removing that word."
pubDate: '2026-05-26T06:19:01.000Z'
category: design-system
tags:
  - tailwind
  - css
  - dark-mode
  - design-system
  - open-source
series: design-to-code
seriesOrder: 6
draft: false
---

I was in test-v4 that morning, clicking the theme toggle for the fifteenth time, and the card background just kept staying white.

The toggle itself worked. I could watch `data-theme="dark"` flip on `<html>` in DevTools. Text color changed. Border color changed. But the surface underneath stayed `#ffffff`, smug and immovable, as if it had personally decided that dark mode was a phase I was going through.

This was [7onic](https://7onic.design) — my own library — on a fresh install of the v4 build I'd just shipped. The Tailwind v3 test page two tabs over worked fine. Same components, same tokens, same toggle. So the bug lived somewhere in the slice of CSS that only Tailwind v4 users would ever touch, which was exactly the slice I'd rewritten the week before, following the official migration guide step by step like a good citizen.

## Three selectors, no JavaScript

Before I get to what I broke, it helps to know what dark mode in 7onic is actually made of, because the answer is: very little.

There's no `useTheme` hook in the library. No context provider, no `<ThemeProvider>` you have to drop into your root layout. The whole mechanism is three CSS selectors:

```css
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark tokens */ }
}

:root[data-theme="dark"] { /* dark tokens */ }

:root.dark { /* dark tokens */ }
```

The first says: if the OS is dark, go dark — unless the user explicitly set `data-theme="light"`. The second is for apps that want a manual toggle without touching `prefers-color-scheme`. The third is there because Tailwind v3 projects flip `.dark` on `<html>`, and I'm not in the business of fighting that habit.

Each block redefines a handful of CSS custom properties — `--color-background`, `--color-foreground`, `--color-border`, the usual suspects. The components don't know any of this exists. A `<Card>` just sets `background-color: var(--color-background)` and trusts whichever block is currently winning the cascade to fill in the right value. The whole thing rests on one slight assumption: the utilities reference variables, not hex literals.

Spoiler: in v4, mine didn't.

## What `@theme inline` actually compiles to

If you've followed Tailwind's v4 migration guide, you've probably seen this snippet:

```css
@theme inline {
  --color-background: var(--color-background);
  --color-primary: var(--color-primary);
  /* ... */
}
```

It looks innocent. It's documented. The Tailwind team recommends it for exactly the setup I have — design tokens defined elsewhere, Tailwind utilities that need to know about them. So I copy-pasted the pattern, ran the build, shipped the version, and went to bed feeling productive.

Here's what `@theme inline` does that the docs don't quite shout at you: it resolves the values at compile time and bakes them into the utility classes as literals.

So when my dev-mode tokens looked like this:

```css
:root { --color-background: #ffffff; }
.dark { --color-background: #0a0a0a; }
```

Tailwind read `@theme inline { --color-background: var(--color-background); }`, looked up what `--color-background` resolved to in the `:root` scope at build time, found `#ffffff`, and emitted:

```css
.bg-background { background-color: #ffffff; }
```

Not `var(--color-background)`. Just the hex. Forever.

The `.dark { --color-background: #0a0a0a }` block was still sitting there in the CSS file. The variable was still being overridden at runtime. It just had nothing left to override, because no utility in the entire stylesheet was reading the variable anymore. It was the most polite kind of broken — every piece of the system looked correct in isolation, and the system as a whole did nothing.

Drop the word `inline`:

```css
@theme {
  --color-background: var(--color-background);
}
```

…and Tailwind keeps the `var()` reference in the emitted utilities:

```css
.bg-background { background-color: var(--color-background); }
```

Same authoring API. Completely different runtime behavior. One word.

## Why I had `inline` in the first place

The honest answer: because the docs told me to, and because two weeks earlier I'd hit a different problem and `inline` was how I worked around it.

I'd just finished a token rename pass — `REMOVE-DEFAULT-SUFFIX` in the ADR, exactly as glamorous as it sounds. The old name for the brand color was `--color-primary-default`, and I'd decided the `-default` suffix was noise nobody had asked for. The new name was just `--color-primary`. Fine. Run the codemod, regenerate the token pipeline, move on.

Except now my Tailwind config was trying to write this:

```css
@theme {
  --color-primary: var(--color-primary);
}
```

Which is, if you read it slowly, a variable defining itself in terms of itself. Tailwind liked that about as much as I did. The build either threw or it didn't throw and the value just collapsed to nothing — I don't fully remember which, because at the time I just wanted it to stop and I grabbed the first thing the docs suggested:

```css
@theme inline {
  --color-primary: #15a0ac;
}
```

Hardcode the hex as a fallback. Tell `@theme` to resolve inline. Build went green. The brand color showed up. I committed.

What I did not notice, at that moment, was that I'd also signed every other token in the file up for the same treatment. Because `@theme inline` isn't a per-property switch — it's a whole-block mode. Once you put `inline` on the `@theme` block, every variable inside it gets resolved at compile time. Not just the one you were trying to rescue.

The brand color was now a hex literal in the utilities. So was the background. So was the foreground. Every border and ring and surface color in the system. All of them, frozen at whatever they resolved to in the light-mode `:root`. All of them, immune to `.dark`.

I'd built a dark mode that worked perfectly in CSS and was reached by exactly zero utility classes.

## Why shadcn doesn't have this problem

While I was staring at this, I went to look at shadcn/ui's setup, because I knew they used `@theme inline` and their dark mode obviously worked. If the snippet was poison, surely they'd have noticed.

The trick is in the naming. Their `@theme inline` block looks like this:

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
}
```

Two different namespaces. The Tailwind utility variable is `--color-background`. The user-facing token they reference is `--background`. When `@theme inline` tries to resolve `var(--background)` at compile time, it finds… `var(--background)`, because nothing else in the stylesheet defines that name at the `:root` level in a way Tailwind can statically resolve. So the `var()` survives into the output. The utility becomes `.bg-background { background-color: var(--background); }`. Dark mode overrides `--background`, the utility reads `--background`, everything works.

Mine looked like this:

```css
@theme inline {
  --color-background: var(--color-background);
}
```

Same name on both sides. Because the entire 7onic token pipeline — Figma Token Studio → JSON → generated CSS → published package — uses one canonical name per token. There is no `--background` and `--color-background`. There is just `--color-background`, generated from `figma-tokens.json`, used by the utilities, overridden by the theme blocks. Single source of truth.

shadcn can afford the asymmetry because their tokens live in a hand-written `globals.css` that the user edits. Renaming one side is a five-second find-and-replace. I can't rename one side, because both sides are the same generated artifact. The variable name is the token name. That's the deal I made, and I'm not unmaking it for a Tailwind directive.

So `@theme inline` was always going to collapse the indirection on me. I just hadn't noticed yet.

## Deleting one word

The fix took longer to think about than to type:

```css
/* before */
@theme inline {
  --color-background: var(--color-background);
}

/* after */
@theme {
  --color-background: var(--color-background);
}
```

Then I had to solve the original self-reference problem a different way, which mostly meant putting the actual hex values directly in `@theme` rather than using `var()` references there at all. The hex values go into `@layer theme { :root { ... } }`. The unlayered `variables.css` wins the cascade. Dark mode wins inside that. Everything stays addressable through CSS variables, the whole way down.

The cost showed up in the build output. CSS went from 62.73 KB to 71.20 KB — an extra 8.47 KB, about 13.5% bigger. Gzipped, 11.51 KB to 12.34 KB, so the wire cost is 0.83 KB. The bulk of the increase is the `@layer theme { :root { ... } }` block that now has to ship every token as a real variable definition, plus the `color-mix()` expressions Tailwind generates for opacity modifiers (`bg-primary/50` and friends), plus `@supports` fallbacks for browsers that don't yet speak `color-mix(in oklab, …)`.

I'll pay that 0.83 KB every day of the week to have dark mode actually work.

## What I keep thinking about

The thing that bothers me isn't that I wrote the wrong directive. It's that I wrote it straight from the official migration guide, the build passed, the dev server rendered, and I shipped it to npm. Every user on the v4 entry point of the package got a CSS file that ignored their dark mode overrides for as long as that version was current.

I had tests. I did not have a test that said: "the `.dark` selector should actually change pixel colors when applied to `<html>` in a real browser." I have one now. It would have caught this in five minutes.

Most of the bugs in this project end up like that. Not a missing concept — just a missing assertion of the obvious thing everyone assumed was true. `inline` is a single word. Dark mode worked. Then it didn't. Then it did again. The diff was four characters.

The longer postmortem is in the ADR if anyone wants it. The short version fits in a sentence: if your token names and your utility variable names are the same string, `@theme inline` will quietly turn your design system into a screenshot.

---

*Next: 22 of 7onic's 42 components shipped with two different import patterns simultaneously. Both worked. One was a mistake, and I didn't find out for three releases.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

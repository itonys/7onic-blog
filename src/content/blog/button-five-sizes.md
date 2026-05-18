---
title: 'Component Anatomy #1: Perfect on Paper, Wrong in Production'
description: >-
  I designed buttons at 5 sizes. Deleted one before shipping, discovered a gap,
  added a different size back. Ended up with 5 again — just not the same 5.
pubDate: '2026-05-18T08:37:08.000Z'
category: components
tags:
  - components
  - design-system
  - design-tokens
  - tailwind
series: component-anatomy
seriesOrder: 1
draft: false
---

I have an Architecture Decision Record (ADR) file sitting in my repo dated February 19, 2026. It contains three beautifully written paragraphs arguing why our xs button should be 28px instead of 24px. At the bottom of that file is a neat little table mapping out our definitive button size scale. Five rows: xs, sm, default, lg, and xl.

The xl row was set to a beefy 56px.

I deleted that entire row on March 11, 2026.

## What xl Was Supposed to Do

As a list, the scale made perfect mathematical sense:

- xs (28px): For tight secondary actions, toolbars, and dense data tables.
- sm (32px): For compact user interfaces.
- default (40px): The golden baseline.
- lg (48px): For prominent primary actions that needed breathing room.
- xl (56px): For... prominent hero actions? Massive landing page CTAs?

To be completely honest, I wasn't entirely sure what xl was actually for when I defined it. But man, it filled out the scale in a satisfying way. There was a comforting logic to it: each step up was roughly 8 to 12 pixels larger than the last, capping out at 56px — a number that felt solidly "large but not absurd." On paper, it was flawless.

The illusion shattered the moment I put an actual 56px button into an actual UI layout.

It looked immediately wrong. Not subtly wrong, but off-the-charts wrong. The kind of wrong where you instinctively double-check your code to see if you accidentally applied the wrong utility class, because surely this monstrosity wasn't what you intended. I tried shoving it into card footers, form submissions, modal confirmation rows, and sidebar navigations. It was a disaster everywhere. Our default (40px) already felt substantial enough in those contexts; at 56px, the button started aggressively picking fights with the section headers.

Sure, there are interfaces where a button that massive makes sense — onboarding welcome screens, app store download buttons, or aggressive marketing landing pages where the entire design exists to funnel you into a single click. But those edge cases aren't what a core design system is built for. A design system size needs to work repeatedly, across different components, in different contexts. xl never did. It was a theoretical size that looked pretty in a token file and made zero sense in a real product.

So, I took a knife to it.

## The Gap I Didn't See Coming

What I didn't anticipate was that cutting xl would immediately expose a glaring flaw in the rest of the scale.

With xl gone, I was left with four remaining sizes: xs (28px), sm (32px), default (40px), and lg (48px). I stared at that list for a long time, and something felt deeply unsettling. The jump from sm (32px) to default (40px) suddenly felt like a massive chasm. Eight pixels sounds tiny on paper, until you place those two buttons side by side in a real layout. sm is tight and compact. default is chunky and substantial. There was an entire register of UI missing in between.

Think about toolbars where default feels way too heavy but sm looks like an accidental misclick. Or secondary actions in a form that need to feel slightly more important than a naked text link, but still play second fiddle to the main CTA.

I added md at 36px the exact same day I axed xl.

Now, 36 isn't a particularly magical number. It's just 4px above sm and 4px below default, which at least scratched my itch for symmetry. My actual validation process was less numerical and more vibes-based: I tried 34px and 38px first. 34px basically blurred into sm on a standard screen. 38px just felt visually illegal because it wasn't a clean multiple of 4 (I know, it's completely irrational — [7onic](https://7onic.design)'s spacing scale already breaks the 4px rule in plenty of places — but my brain just couldn't shake it). 36px was the only one that slipped into the layout and looked like it belonged there without causing a scene.

And just like that, the new scale was born: xs (28px) / sm (32px) / md (36px) / default (40px) / lg (48px).

Same five sizes. But a completely different five sizes.

## Why 28 and Not 24

The logic behind our xs size is the one piece of this entire puzzle that remained completely untouched between February and March.

WCAG 2.5.8 sets the minimum touch target size at 24px. That's the AA criterion — the absolute floor below which your UI is officially considered inaccessible. I'd seen plenty of other design systems set their smallest buttons to 24px just to check that compliance box.

But I drew the line and set our xs to 28px.

The reasoning, as documented in our ADR, is straightforward: WCAG's 24px is a minimum, not a target goal. The Apple HIG recommends 44pt. Material Design pushes for 48dp. Every mature, battle-tested design system sits comfortably well above the WCAG floor — not out of corporate generosity, but because 24px is genuinely too small for a human finger to interact with comfortably. On a cramped mobile screen, inside a packed toolbar, with an average thumb having a clumsy day, those 4 extra pixels matter in a way that's hard to articulate but instantly felt.

There was also a dirty little practical reason: `h-7` is exactly 28px in Tailwind. `h-6` is 24px. While the accessibility argument absolutely came first, I won't pretend the clean alignment with Tailwind's token scale didn't put a massive smile on my face.

## Back to Square One (But Better)

The ultimate irony of this whole saga is that we shipped with five sizes anyway. I deleted one in March, added one back in March, and ended up exactly where I started numerically.

It's been a few months of putting this scale through its paces in production now. Hilariously, md (36px) has turned out to be the size I reach for the most when building secondary actions — way more than sm (32px), which I initially thought would dominate that territory. Meanwhile, lg (48px) makes appearances far less often than I anticipated. And I have yet to open a component file in a real product and think, "You know what this needs? A 56px xl button."

Is this scale absolutely perfect? Honestly, I don't know. But the goal was never perfection; it was utility. We wanted a size for every context without hoarding sizes that serve no context. Right now, all five of these sizes actively earn their keep — which is a hell of a lot more than xl could ever say.

---

*Next: 22 of the 42 components in [7onic](https://7onic.design) shipped with two different import patterns at the same time — a namespace style and a named style. Both worked. One was a mistake. Here's how I figured out which.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

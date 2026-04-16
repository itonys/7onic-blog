---
title: 'Design to Code #1: Why I Built 7onic'
description: >-
  I spent 10 years watching pixels drift between Figma and production. Here's
  why I stopped filing tickets and started building a design system from
  scratch.
pubDate: 2026-04-16T00:00:00.000Z
category: design-system
tags:
  - design-system
  - design-tokens
  - figma
  - react
series: design-to-code
seriesOrder: 1
draft: false
hashnodeId: 69e0be11934f05e2a915df82
devtoId: '3509912'
---

I remember the exact moment I gave up on handoffs.

A developer had implemented a card component I designed. The spacing was off by 2 pixels. The border radius was `8px` instead of `6px`. The shadow was close but not quite right — they'd grabbed a Tailwind default instead of the value in the Figma file. Individually, none of these were worth a ticket. Together, the whole thing just looked... slightly wrong.

I left a Figma comment. It got fixed in the next sprint. Then the same thing happened on the next component. And the next one. For ten years.

I'm a designer. I've also been writing frontend code for most of those ten years, which means I've been on both sides of this handoff. I know why the developer used `rounded-md` — it's right there in Tailwind, it's close enough, and who has time to check whether 6px rounds to `rounded-md` or `rounded` or something else entirely. (It doesn't map cleanly to either, by the way.)

At some point the Figma comments stopped feeling productive and I just started writing the components myself.

## It's not a people problem

I want to be clear: the developers I worked with weren't sloppy. Most of them were better engineers than me. The issue was that design values lived in Figma and code values lived in... wherever the last developer put them.

Someone builds a button. They eyeball the Figma file, pick `bg-gray-900` because it looks right, move on. Next month, someone else builds a card header. They look at the button, assume that's the canonical dark color, copy it. Except the Figma file actually specified `#1a1a1a`, which is close to `gray-900` but not the same. Now you've got two slightly different "dark" colors in production and nobody remembers which one is correct.

Multiply that by every color, every spacing value, every radius, every shadow. Across dozens of components, over months. The drift is slow and constant.

The actual problem is obvious in hindsight: **there was no shared source of truth.** The designer had one (Figma). The codebase had another (whatever was already in the code). Keeping them in sync was manual, which means it was nobody's job, which means it didn't happen.

## I tried all the "normal" solutions first

Before building anything, I did what you'd expect.

Exported tokens from Figma manually, dropped them into the Tailwind config. Worked great for about three weeks until the Figma file got updated and nobody remembered to sync the code. Back to drift.

Tried Style Dictionary. It's genuinely powerful, but configuring it to output exactly the formats I needed — CSS variables, Tailwind v3 preset, Tailwind v4 theme, JS exports, TypeScript types — took longer than building the actual components. I spent a full weekend writing transforms and formatters and still didn't have something I trusted.

Token Studio for Figma? Good plugin. But the exported JSON needed so much massaging before it was useful in a real Tailwind project that I was basically writing a custom pipeline anyway — just with an extra abstraction layer I didn't control.

Every approach had the same gap. It handled the "get tokens out of Figma" part reasonably well, then left you alone for the "actually wire these into your codebase" part. That last-mile wiring is exactly where things break.

So yeah, I built my own thing.

## One file, one command, zero drift

The rule I started with was almost naively strict: **if a value isn't in the design token file, it can't exist in code.** No `bg-gray-500`. No `p-[17px]`. No `text-[13px]`. If you need a color, there's a token for it. If there isn't, you add one to the token file first.

I realize that sounds annoying. It is, a little, at first. But it turns out that constraint is the whole point. It forces every visual decision through a single chokepoint: `figma-tokens.json`.

One `sync-tokens` command reads that file and generates everything:

- CSS custom properties
- Tailwind v3 preset with RGB channels (so `bg-primary/50` works)
- Tailwind v4 `@theme` with native color-mix
- TypeScript types
- JSON for anything else

Eleven files total. All from one source. I can change a color in the token file, run the command, and know it's updated everywhere. No searching the codebase for hardcoded hex values. No "did we update the Tailwind config too?"

On top of that token layer, I built a component library. 42 components, all using Radix UI under the hood for accessibility, styled with CVA variants. There's a CLI too:

```bash
npx 7onic add button input select
```

This copies the actual source files into your project. Not a compiled package you import — the real `.tsx` files, in your `components/` folder, fully yours to read and modify. I went back and forth on this decision a lot. I'll write a separate post about why I landed on copy-paste over npm import, because it's a real trade-off.

## Why Radix specifically

Quick detour on this because people ask.

Accessibility is the part I didn't want to get wrong and also the part I knew I would get wrong if I built it from scratch. Focus traps in dialogs, keyboard navigation in dropdowns, screen reader announcements for toasts — this stuff is brutally hard to get right across browsers and assistive technologies.

Radix handles all of that and ships completely unstyled. No CSS to override, no opinions about how things look. You bring the design tokens, Radix brings the semantics.

Could I have built primitives from scratch? Sure. Would the focus management in my dialog component be as robust as what the Radix team has iterated on for years? No. I know where my time is better spent.

## The solo thing

I should mention that I built all of this alone. No team. No design review. No code review. Just me, my Figma files, and a growing collection of markdown documents where I argued with myself about naming conventions.

(Is the base button size called `default` or `md`? Does the button need 5 sizes or is 3 enough? These are the questions that keep you up at night when there's nobody else to make the call. I went with 5 sizes and `default` as the base, if you're curious. There's a whole doc about why.)

Building solo has one unexpected benefit: it makes the "no hardcoding" rule actually stick. On a team, someone always has a deadline and a good reason to skip the token file. "I'll clean it up later." Solo, I'm the person who has to clean it up later, and I know I won't, so I just do it right the first time. The constraint isn't aspirational — it's survival.

The downside is that a design system can grow forever. There's always one more component to add, one more variant to support, one more edge case to handle. I had to get comfortable shipping something incomplete. 7onic right now has 42 components, supports both Tailwind v3 and v4, has a CLI, and docs in three languages. It's also missing things. That's fine. Ship, iterate, repeat.

## What comes next

This is the first post in a series called "Design to Code." The plan is to write about the decisions behind 7onic — not the marketing version, but the actual reasoning, including the parts where I got it wrong and had to redo things.

Some posts I'm planning:

- How the token pipeline works end to end — the `sync-tokens` script, why I generate RGB channel variables, how Tailwind v3 and v4 support both work from the same token file
- The copy-paste vs npm-import debate — why I chose to have the CLI copy source files and what that costs
- Using AI to build a design system — what `llms.txt` actually does, how I use Claude to write components, and where it falls apart
- Lessons from 42 components — patterns that scaled, patterns that didn't, things I'd do differently if I started over

If any of that sounds interesting, stick around.

---

*Next up: how one JSON file becomes CSS variables, Tailwind presets, and TypeScript types — and why my first three attempts at building this pipeline failed.*

---
title: 'Design to Code #9: The Cost of a Dot'
description: >-
  On April 4th I shipped 22 compound components. On April 22nd I deleted all of
  them. The breaking change cost nothing because no one was using it yet.
pubDate: '2026-06-03T06:24:01.000Z'
category: design-system
tags:
  - design-system
  - react
  - open-source
  - typescript
  - breaking-change
series: design-to-code
seriesOrder: 9
draft: false
---

There is a screenshot somewhere in my notes from April 4th—the day v0.1.0 went up—showing a Card example with `<Card.Header>`, `<Card.Title>`, and `<Card.Content>` nested neatly inside `<Card>`. I had been staring at that JSX for a long time before I clicked publish, and what I remember thinking was: *this looks like a real design system.* Radix uses this shape. shadcn uses this shape. Of course it would be the shape. I was not designing the API so much as I was matching a silhouette I had already accepted.

Eighteen days later, I deleted all of it.

Not "deprecated"—deleted. Twenty-five namespaces gone from the public surface, twenty-four component files rewritten in a single afternoon, and every single `<Card.Header />` on the documentation site rewritten as `<CardHeader />`. v0.3.0 went out as a breaking change on April 22nd, and the only thing that made it survivable was the one resource I knew I would never have again: zero production users.

## The Day Compound Looked Obviously Right

When I scaffolded the first 38 components in late March, the namespace pattern was already baked into my mental template. I did not weigh it against anything. A Card had a Header, a Title, a Content, and a Footer. A Modal had a Trigger, Content, Title, and Description. AlertDialog, Accordion, Tabs, Popover, Tooltip, Drawer—all of them had three to six sub-parts that begged to live under a single, shared name.

So I did what every tutorial I'd ever read suggested, which was to bundle them via `Object.assign`:

```ts
const Card = React.forwardRef<...>(...)
const CardHeader = React.forwardRef<...>(...)
const CardTitle = React.forwardRef<...>(...)
// ...

Object.assign(Card, { Header: CardHeader, Title: CardTitle, /* ... */ })

export { Card, CardHeader, CardTitle /* still named too, just in case */ }
```

That last line—*still named too, just in case*—turned out to be the only thing that saved me. I do not remember why I kept both. The honest answer is probably that I just wasn't sure, and "export everything twice" felt like cheap insurance.

By the time v0.1.0 went out, twenty-two of the thirty-eight components had compound JSX. Twenty-five namespaces total. The docs site used `<Card.Header />` everywhere. So did the test playground. So did the README example I had pinned to the top of the GitHub repo. It looked, to my eye, finished.

## What "Obviously Right" Actually Meant

I want to be careful here, because the lesson is not *"compound components are bad."* They aren't. Radix gets enormous mileage out of them, and the ergonomics inside a Client Component are genuinely nicer to read. The lesson is something narrower and more embarrassing, which is that I had copied the *shape* of an API without copying the *constraints* it was built under.

Radix is a behavior library. Its primitives are almost all client-only by design—they hook into refs, portals, focus traps, and event listeners. There is no scenario where a Radix consumer is going to try to render `<Dialog.Trigger />` from a React Server Component, because the whole point of the library is the runtime behavior. The compound API fits the runtime story.

[7onic](https://7onic.design) is not a behavior library. It is a *design* system. A `<Card>` is a div with padding and a border. A `<CardHeader>` is a div with bottom margin. There is no behavior. There is no reason these components should not work inside an RSC tree—except that I had wrapped them in `Object.assign`, which the React Client Manifest cannot serialize across the server/client boundary. I had taken components that had every reason to be universal and quietly made them client-only, in exchange for a dot.

I did not know this on April 4th. I learned it on April 22nd, from an issue that I did not actually get filed against me, because (again) I had no users—I learned it from my own test-v4 playground crashing the moment I tried to drop a Card into the App Router shell to check something unrelated.

## The Decision

This is the part I think about the most.

The bug was real but the blast radius was theoretically tiny. Anyone using `<Card>` directly as a named import—which was still exported, remember, *just in case*—would not have hit it. Only the compound JSX path was broken. The docs site used the compound path, but I owned the docs site, so I could just rewrite it. A reasonable, calm person would have written a migration guide, kept both APIs alive through 0.x, and pushed the actual removal to some hypothetical 1.0 where breaking changes "count."

I did not do that.

What I did was open the v0.3.0 branch the same afternoon I shipped the v0.2.9 RSC patch—yes, two versions on the same day, look at the changelog if you don't believe me—and rip out every namespace. The ADR I wrote that night listed four reasons: RSC safety, tree-shaking that actually maps 1:1 to dead-code elimination, fewer places to forget to sync a new sub-component, and AI tools no longer hallucinating `<Card.Header />` into RSC contexts where it would crash. Those are all true. They are not, however, why I did it that day instead of in six months.

The reason I did it that day is that v0.1.0 had been live for eighteen days, and during those eighteen days exactly zero people had `npm install`'d the package in a project I did not personally control. The breaking change had a cost of zero. Not "small." Zero. And I knew—with a clarity that I will probably never have again about this codebase—that this number was only going up from here. Whatever I shipped on April 22nd was the API I was going to be apologizing for in two years.

The only good time to ship a breaking change is when you have zero users. I used mine on day 18.

## What Changed, Mechanically

The diff itself was almost boring. `<Card.Header />` became `<CardHeader />` across the codebase. The `Object.assign` blocks were deleted. The named exports—the ones I had kept *just in case*—became the entire public surface. Twenty-four files touched. Sixty pages in the docs site updated. Three hundred and fifty-one import lines audited by hand to make sure I had not left a single `Card.Something` lying around, and to verify that nothing was over-imported or under-imported (the final number: zero of each).

For users who genuinely loved the dot notation, the ADR shipped twenty-five "Compound Recipes"—tiny wrappers anyone could drop into their own project to recover `<Card.Header />` locally, with the one caveat that the wrapper file needs `'use client'` at the top. That caveat is the whole story compressed into a single directive. The library does not ship the dot; if you want the dot, you opt into client-only-ness yourself, with full knowledge of what you're doing.

## What It Taught Me

I am still not sure what the generalizable lesson is, and I am going to resist the temptation to invent one. What I noticed, in the days after, was that I had built the first version of 7onic the way I had been *taught* to build a design system, which is not the same thing as building it the way *this* design system needed to be built. The compound pattern was not chosen; it was inherited. The reversal was the first decision I made about the public API that was actually mine.

The other thing I noticed is smaller, and probably more useful. The named exports I had kept "just in case"—the ones I could not have justified at the time if pressed—were the entire migration path. There was no migration to write, because the new API had been shipping in parallel since day one. I had hedged without knowing I was hedging, and the hedge paid for the breaking change.

Forty-two components now. Zero namespaces. Six dependencies in the consumer's `node_modules`. Eighteen days between the first version and the version I would still defend today.

I have not made a breaking change since.

---

*Next: what eighteen days looks like from the inside — every commit, every wrong turn, every "I'll fix it tomorrow" I actually fixed at 2am.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

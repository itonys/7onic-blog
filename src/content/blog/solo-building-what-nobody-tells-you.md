---
title: 'Solo Builder #1: What Nobody Tells You'
description: >-
  Building a design system alone sounds like a shortcut. No meetings, no
  politics, full ownership. Here's what that actually looks like after a year.
pubDate: 2026-04-19T00:00:00.000Z
category: design-system
tags:
  - solo-builder
  - design-system
  - open-source
  - indie-dev
series: solo-builder
seriesOrder: 1
draft: false
---

Before I started building [7onic](https://7onic.design), I googled one very specific phrase:

*solo design system*

I expected at least a few useful battle stories.

Instead, I found conference talks from teams of twenty, blog posts about "scaling component libraries," and articles that casually assumed I had designers, engineers, PMs, reviewers, and someone named Alex who owned tokens.

I had none of those people.

It was just me.

So I learned what building a design system alone actually looks like the hard way.

A year in, here's what I wish I'd known.

## You will make every decision, every day

On a team, decisions get distributed.

Someone owns tokens.
Someone owns components.
Someone owns docs.
Someone owns accessibility.
Someone joins the meeting late and disagrees with everything.

That structure can be slow, but it spreads the mental load.

When you're solo, every open question lands on your desk.

Should the border radius be 6px or 8px?
Which purple becomes the brand primary?
Do we support RTL now or later?
What happens when someone passes both `variant` and `className`?
Should defaults be strict or forgiving?

None of these questions are difficult on their own.

But answer fifty of them in a day — while writing code, docs, release notes, CLI tooling, and fixing one mysterious TypeScript issue — and it becomes draining in a way I didn't expect.

For the first month, I kept a decision log.

Then I stopped.

Because logging every decision introduced a new decision:

*Is this decision worth logging?*

What finally helped was a simpler rule:

**Decide once. Document briefly. Move on.**

Not every choice deserves a framework.
Most choices deserve ten seconds and a code comment.

## Nobody will catch your mistakes

This hit me around the third component.

I had built a `Button` with five size variants:

`xs`, `sm`, `md`, `default`, `lg`

Beautiful API. Typed props. Looked clean.

Two weeks later I realized `md` and `default` were visually identical.

Both were 36px.

I had duplicated a token value by accident.

Which meant I had:

- written the bug
- reviewed the bug
- approved the bug
- shipped the bug

All personally.

There's no pull request where a teammate says:

> Wait... why do two sizes look exactly the same?

That moment taught me something important:

When you build solo, your QA process is just future-you.

And future-you is inconsistent.

I've shipped duplicate variants.
Exported components with the wrong display name.
Published a version where dark mode didn't work because I tested in light mode and called it done.

I still don't have a perfect solution.

What helps a little:

- visual regression checklists
- writing changelog notes before release
- opening docs as if I were a new user
- forcing one final pass when I'm already tired and want to skip it

None of this is glamorous.

But neither is debugging yourself.

## Scope creep has no natural predator

On a product team, eventually someone says:

> That's out of scope.

A PM says it.
A tech lead says it.
A deadline says it.

Solo builders often have none of those voices.

Which means every idea feels valid and immediately actionable.

I originally planned to build a CLI that installs components.

Somehow that turned into:

- typo suggestions using Dice coefficient similarity
- package manager auto-detection from lockfiles
- Tailwind v4 auto-injection
- JSON schema support for IDE autocomplete

Each feature was reasonable.

Each feature improved the product.

Together, they delayed launch by two months.

That's the trap:

When you're solo, scope creep rarely feels like scope creep.

It feels like craftsmanship.

And sometimes it is.

But sometimes the right feature is shipping.

Now before I add anything, I write one sentence:

*What problem does this solve for someone installing 7onic today?*

If I have to stretch to answer it, the feature waits.

## Momentum gets weird in open source

Shipping internally gives immediate feedback.

Someone uses it tomorrow.
Someone complains by lunch.
Someone asks for a new prop by Friday.

The loop is fast.

Shipping to open source can feel very different.

You release something you spent three weeks building.

The next morning looks exactly the same as yesterday.

No dashboard spike.
No coworker message.
No usage report.

Maybe a few GitHub stars trickle in — and I'm genuinely grateful for every one — but early open source has a kind of silence to it.

You need a different feedback loop.

For me, writing helped.

Not for traffic. There wasn't much.

But because explaining a decision to an imaginary reader forces clarity.

Whenever I couldn't explain why I built something a certain way, that was usually a sign the decision wasn't solid yet.

This blog became part of the product process.

## The hidden half of the work

People see components.

They don't see the rest.

Building components might be half the job.

The other half is:

- figuring out why TypeScript generated nonsense types
- debugging CI that works locally but fails remotely
- rewriting docs for the third time because the API changed again
- setting up smoke tests
- maintaining release notes
- answering occasional issues
- cleaning scripts no one will ever praise

None of it is dramatic.

All of it consumes time.

And when you're solo, all of that time belongs to you.

Some weeks the components barely move because infrastructure needed attention first.

That used to frustrate me.

Now I see it more clearly:

The product is one system.
The tooling is another.
Both need maintenance.

## The upside people explain badly

Everything above is true.

But it's incomplete.

There's a benefit to working alone that's harder to describe:

**Coherence.**

Not freedom.
Not control.
Not "being your own boss."

Coherence.

The whole system fits in your head.

If I want to change dark mode, I know exactly where to go.
If I add a token, I know the full path from `figma-tokens.json` to runtime output.
If something feels inconsistent, I usually know why.

No handoff.
No ownership map.
No "let me check with the person who manages that."
No waiting.

Just change it.

Teams optimize for coordination.

Solo builders can optimize for consistency.

Those are different advantages.

And for a design system — where consistency is the product — that matters more than people admit.

## I didn't expect to like it this much

Working alone is tiring in all the ways I described.

It can be repetitive, lonely, slow, and mentally noisy.

But it's also deeply satisfying in ways I didn't predict.

There's something special about seeing a system become cleaner because you touched every layer of it.

I still wouldn't romanticize solo building.

But I also wouldn't dismiss it.

Sometimes one person with enough stubbornness can build something surprisingly coherent.

---

*Next: I don't do code reviews in the traditional sense. Here's what I do instead — and what I've learned to catch by forcing myself through it.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

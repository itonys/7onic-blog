---
title: 'AI + Design #2: My AI Review Team Gave It 93. I Gave It 70.'
description: >-
  Four AI reviewers, seven rounds, and a brand page they agreed beat its
  reference. Then I actually looked at it. What went wrong with the scoring.
pubDate: 2026-11-04T07:21:02.000Z
category: ai
tags:
  - ai
  - design-review
  - agents
  - design
series: ai-design
seriesOrder: 2
draft: false
---

The final report said 9.3.

That was the art direction score, out of 10, from the seventh and final round of review on the [7onic.io](https://7onic.io) brand page. The site I'd been learning from — a page I admired for its structure and motion — had been scored 8.5 by the same reviewers, on the same scale. Every reviewer had cleared the bar we'd agreed on: everything above 9. Seven rounds. Done.

I opened the page and gave it a 70.

Not 70 out of 10, obviously. 70 out of 100, where the reference site was the 100. And this wasn't me being harsh to make a point. It was just my honest first reaction.

## How the review team worked

On 2026-11-02 I handed the first draft of the brand page to an AI agent with an unusual brief: build it, make the design calls yourself, and keep going until a review team says it's good.

So it built a review team. Four reviewers, each with a different lens:

- art direction (hierarchy, whitespace, restraint)
- structure and layout
- motion
- Japanese, Korean, dark mode and mobile

Each one scored our page and the reference on the same scale and listed what to fix. Same reviewer every round, so it could check whether its own earlier notes had been addressed. Honestly, it's a decent process. I'd use it again, with one change I'll get to.

The scores went like this:

| Round | Art | Structure | Motion | i18n · dark · mobile |
|---|---|---|---|---|
| 1 | 6.5 | 7 | 4 | 5 |
| 4 | 8.5 | 9 | 8.5 | 8 |
| 7 | 9.3 | 9.4 | 9.4 | 9.5 |

Some of that improvement was real. Motion sat at 4 in round one because the agent had *guessed* the animations from screenshots. A reviewer went and pulled the actual values out of the reference site's scripts (scroll distances, easing, per-letter delays), the motion got rebuilt from those, and the score jumped to 8. That one I believe.

The rest, less so.

## What I saw that they didn't

When I looked at the page myself, the list came fast. The Korean copy read like a translation, maybe 90% of it. Dark mode was a flat gray slab. The animations looked squashed. The fonts weren't pretty. The header had duplicate buttons. And the whole thing had that specific *made by AI* feeling, which is hard to define and very easy to recognise.

There was a worse one: it was supposed to be a brand page, and it mostly advertised the design system.

None of the four reviewers had flagged any of that as a real problem. A few of the things that read as "AI" to me (rainbow primaries, monospace uppercase labels, little diagonal hatching) they'd treated as style.

## Why the numbers drifted

Looking back at the transcripts, I think three things stacked.

The reviewers were the same model family as the builder. Same taste, same blind spots. If the builder thinks rainbow gradients look sophisticated, the reviewer probably does too.

The rubric was about *reproducing* the reference: structure, layout, motion. Nobody was scoring the first impression, whether the copy sounded like a human wrote it, or whether the fonts were any good. You can't lose points on an axis that doesn't exist.

And the loop itself pushed scores up. Each round, a reviewer's main job was to check whether its previous notes were fixed. They were, mostly. So the score went up. The reference point moved with the work, a little every round, and seven small steps add up.

## Round two, with an anchor

For the second pass, the review brief changed in one important way. The reviewers were told my number. Reference site = 100, the first draft = 70, now score this. And be stricter.

| Round | Art (my scale) |
|---|---|
| 1 | 74 |
| 2 | 78 |
| 3 | 81 |
| 4 | 84 |
| 5 | 85 |

It climbed slowly this time, which felt more honest than the earlier sprint to 9-point-something.

Round three turned up something embarrassing. The Korean serif we'd been debating for two rounds ("too thin", then "can't tell it from the sans") had never actually loaded. A fallback face generated for the Latin font was catching the Korean characters first, so the Korean serif never got a turn. The reviewers had been critiquing a font that wasn't on the screen. The only way to catch it was to stop looking at screenshots and ask the browser what it had loaded (`document.fonts`, status `unloaded`).

The other lesson from round two was about *how* the score moved. Removing things — the decoration, the borders around every panel, most of the serif — got the page from 70 to roughly 75. After that, cutting stopped helping. What moved it further was adding things a template wouldn't have: hand-drawn scenes, brush strokes, hand-painted surfaces.

## The checklist found what seven rounds missed

One more thing, because it surprised me.

After the first draft was "done", another agent sent over a checklist for reproducing a reference site's skeleton. It arrived too late to guide the build, so we used it as an audit instead. It found horizontal overflow below 1280px, a band clipped at 1920px, and an oversized title at 768px. Seven review rounds hadn't seen any of it, because the reviewers only ever looked at 390px and 1440px.

So a score loop and a checklist don't replace each other. The loop catches taste. The checklist catches the things nobody thought to look at.

## What I'd tell myself before round one

Put a human number in the brief on day one. Even a rough one. "The current draft is a 70, the reference is a 100" did more to calm the inflation than any amount of "please be critical".

And when the AI says it's done, it's done by the AI's standards. That's useful. It isn't the same thing.

(What's live at 7onic.io now is the round-two version plus a few launch fixes. I'd still give the reference site a 100.)

---

*Next: 7onic was a design system for nine months before I figured out it was a studio.*

---

**About 7onic** — 7onic is a small studio that builds the tools its own work was missing. This blog follows one of them: an open-source React design system where design and code never drift. Free, MIT licensed. Studio at [7onic.io](https://7onic.io). Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

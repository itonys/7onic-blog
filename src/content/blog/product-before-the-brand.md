---
title: 'Solo Builder #2: I Built the Product Before the Brand'
description: >-
  7onic was a design system for nine months before I figured out it was a
  studio. Why I shipped the product first and the brand page last.
pubDate:
category: design-system
tags:
  - solo-builder
  - branding
  - indie-dev
  - design-system
series: solo-builder
seriesOrder: 2
draft: true
---

The first commit message in the 7onic repo says "Tonic Design System." It's dated 2026-01-23.

There's no 7 in it. A couple of weeks later there's a commit that renames the project to 7onic, buried in the middle of a list of other things I was doing that day (rem conversion, auto-generated pixel comments, a docs cleanup). That's roughly how much ceremony the brand got for the next nine months.

On 2026-11-03, the brand finally got a home: [7onic.io](https://7onic.io). And the first thing it says isn't "design system." It says 7onic is a small studio.

## The normal order, and why I skipped it

A lot of indie-product advice goes brand first, or at least alongside. Name, landing page, waitlist, *then* the thing. You're supposed to know what you are before you build.

I didn't skip that out of some contrarian principle. I just had a problem that annoyed me more than the absence of a brand did. Design and code had been drifting apart for years in the work I did, and I wanted it fixed for my own sake. A landing page wasn't going to fix it. A design system might.

So the first nine months went into the thing itself. Tokens, then components, then a CLI, then docs in three languages, then an MCP server so AI tools could use it properly. Somewhere in there I started a blog, mostly to explain what I was building.

At no point did I sit down and decide what 7onic, the name, was *for*. It was the design system's name. That was enough.

## The name had a plan in it anyway

Here's the funny part. When I made the logo, I'd already been thinking about it as more than one product.

The name is 7 + tonic. In music, the tonic is the first note of a scale, the one every melody comes back to. Seven notes make a scale. So the idea, even back then, was seven slots, each one a tool, each with its own number and color, all coming home to the same note. (The 7onic.io page says it better than I'm saying it here, in a section literally titled "What's in the name.")

And I'd grabbed the domain early. 7onic.io sat there doing nothing while 7onic.design did all the work.

So the brand wasn't missing. It was folded up inside the logo, waiting for there to be more than one thing to put under it.

## What made it unfold

Two things.

The design system got to a point where I could call it done. Not finished — I'll keep updating it — but done in the sense that it does what I built it to do, and I use it every day.

And while writing this blog, I hit a new wall. Posting the same article to site after site, by hand, is miserable, and I already have a feeling the next tool is going to grow out of that annoyance.

That was the moment the order flipped. A design system doesn't need a studio. A *second* tool does, and it needed somewhere to live that wasn't the design system's docs site. So the brand page had to exist before the next product, not after.

## What changed when the brand showed up

Mostly, my own sentences.

7onic.io describes itself as a studio that builds the tools its own work was missing, uses them every day, and only then hands them to people stuck in the same place. Once that was live, half the copy I'd written about 7onic over the year was slightly wrong. This blog's own footer still said 7onic was "an open-source React design system." I changed it this week. Now it says 7onic is a small studio, and this blog follows one of its tools.

The design system didn't change at all. Its *position* did. It went from being the whole story to being slot number one, with six empty slots next to it on the page. Which is a strangely motivating thing to look at every time I open the site.

(The launch itself, for the record, was undramatic. From creating the Vercel project to Google Search Console accepting the sitemap took about 35 minutes. The design review before that was a different story, and [a different post](/ai-review-team-gave-it-93/).)

## Would I do it in this order again?

Probably, yes.

If I'd built the brand first, I think I'd have built a brand for a design system company. That would've been a reasonable brand, and the wrong one. I didn't know it was a studio until there was a second problem worth solving. The product had to exist before I could see what it was a first example *of*.

The cost is real, though. For nine months, the story people heard about 7onic was narrower than the one I had in my head. Some of them will only ever know it as a design system. I'm not sure that's fixable, and I'm not sure it needs to be.

One slot filled. We'll learn what goes in the next one by doing the work. That line's on the site, and it's the most honest roadmap I've got.

---

*Next: what the first year of building alone actually looked like on the calendar.*

---

**About 7onic** — 7onic is a small studio that builds the tools its own work was missing. This blog follows one of them: an open-source React design system where design and code never drift. Free, MIT licensed. Studio at [7onic.io](https://7onic.io). Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

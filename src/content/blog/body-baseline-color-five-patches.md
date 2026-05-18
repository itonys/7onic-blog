---
title: "Build & Release #2: Five Patches for One Line of CSS"
description: "I shipped `html body { color }` with four different values across five releases. Each one fixed a different way of being wrong — until I found the generator."
pubDate: '2026-05-18T14:31:48.000Z'
category: devops
tags:
  - devops
  - css
  - design-tokens
  - open-source
series: build-and-release
seriesOrder: 2
draft: false
---

I was running through a quick test on April 27 when I noticed something almost funny. Light background. White-ish text. Just barely legible enough that you could tell text was supposed to be there, like a watermark someone forgot to remove.

The site was the 7onic documentation, rendered in light mode. My OS, however, was set to dark mode. The culprit? A single line in the body rule targeting `--color-foreground`.

I had shipped that exact line four days earlier in v0.3.1. I had already patched it once. By that morning, I was about to patch it a second time. (The third patch—the one that actually solved the mystery—wouldn't happen until v0.3.5, and certainly not because I planned it.)

All in all, it took five releases and four different values for `html body { color }` to fix a text color. I patched the output file three separate times without ever touching the generator script—which meant every time I ran `npm run sync-tokens`, my pipeline would have silently regenerated the exact bug I was trying to kill.

## The Original Sin

The chaos started with v0.3.1 on April 23. I introduced `tokens/css/reset.css` as a brand-new distribution file, bringing our total file count from 11 to 12. Tucked neatly inside this reset was a body baseline color set to `var(--color-foreground)`. In that same release, I added `--foreground: var(--color-foreground)` to `variables.css` as a compatibility alias for Next.js.

It blew up the exact same day.

Next.js has a `@theme inline` directive that emits `--color-foreground: var(--foreground)` on its end. Look closely at that loop: `--foreground` was pointing to `--color-foreground`, which was pointing right back to `--foreground`. The browser did exactly what browsers do when caught in a circular reference trap—it gave up and resolved the whole thing to `unset`.

Hours later, v0.3.2 went out as emergency triage. I pointed `--foreground` at `var(--color-text)` instead, deleted `reset.css` as a standalone file, and embedded the body baseline straight into `variables.css`. We were back down to 11 distribution files. I called this Approach Z because I had already burned through too many letters of the alphabet trying to make this work.

But the body color? It stayed as `var(--color-foreground)`.

## Three Days Later: Enter IACVT

April 27. White text on a white background.

The underlying mechanism took a while to see clearly, mostly because `--color-foreground` *was* defined in the codebase—it just wasn't defined in `variables.css`. It lived exclusively in `tokens/tailwind/v4-theme.css`, a file you only ever import if you are actively using Tailwind v4. If a user imported `variables.css` standalone, used Tailwind v3, or pulled the raw CSS into a non-Tailwind project, that variable simply didn't exist to them.

CSS has a terrifyingly specific name for what happens next: IACVT (Invalid At Computed Value Time).

The browser parses the CSS declaration perfectly fine. But at runtime, it tries to resolve `var(--color-foreground)`, realizes it's looking at a ghost, and throws the entire `color` declaration away. Not the whole CSS rule—just that one property.

The cascade then fell back to a global rule I had: `html:root { color-scheme: light dark }`. This tells the browser, "Hey, I support both themes, pick whatever makes sense." Since my OS preference was set to dark mode, the browser obligingly picked a light text color for a dark background. Except, the actual background of the docs site was locked into light mode. Light text. Light background. Total invisibility.

The fix went out as v0.3.4. I swapped the variable from `var(--color-foreground)` to `var(--foreground)`. Because `--foreground` is defined inside `variables.css` itself (within the `html:root` compatibility alias block), it is guaranteed to be available wherever `variables.css` is imported. I verified it locally, pushed, tagged, and called it a day.

Or so I thought.

I had patched the compiled output file. I had not looked at the generator.

The generator was a script named `scripts/sync-tokens.ts`, which automatically spits out `tokens/css/variables.css`. Back in v0.3.3, when I was messing around with a monospace font baseline, I had touched that generator code and hardcoded it to emit `color: var(--color-foreground)`. I had manually hotfixed the output file, but I forgot to fix the robot that writes the file. Nobody noticed. There was no one else to notice.

## The Generator Never Lies

The next day, while working on something completely unrelated, I casually ran `npm run sync-tokens`.

I checked the git diff. The script had proudly stripped away my manual hotfix and put `var(--color-foreground)` right back into production.

That was the moment.

Version 0.3.5 shipped on April 28. This time, I fixed the actual generator code to emit `var(--color-text)`, and updated the output file to match. The first execution of the fixed script reported `1 updated, 12 unchanged`. Running it a second time yielded `0 updated, 13 unchanged`. Idempotent. Finally.

`--color-text` comes straight from our core theme files: `themes/light.css` (resolving to gray-900) and `themes/dark.css` (resolving to gray-100). No aliases. No indirection. It is defined in every single supported import permutation because it maps directly back to our Figma Single Source of Truth—the exact source this entire pipeline was built to serve.

## Decoupling the Three Variables

Looking at the three variables lined up side-by-side makes the architectural hierarchy glaringly obvious:

`--color-foreground` is a Tailwind v4 alias. It lives strictly in `v4-theme.css` so Tailwind utility classes can map correctly. Outside of Tailwind v4, it does not exist.

`--foreground` is a Next.js compatibility alias. It lives in the `html:root` block of `variables.css` so Next.js's `@theme inline` compiler has something to bind to.

`--color-text` is the Figma token. It lives in the core theme files — named after the `*-text` token convention in `figma-tokens.json`, the same source the entire pipeline was built around.

The baseline rule inside `html body` is the most universal selector in the entire project. By extension, it requires the most universal variable available. That was `--color-text` the whole time. It had been sitting quietly in the theme files before any of this madness even started.

I had instinctively reached for the Tailwind alias because Tailwind was the immediate sandbox environment I was developing in, completely forgetting that the resulting raw CSS file would be consumed by developers who weren't using Tailwind at all.

The build generator was the only honest witness to what code I was actually shipping to production. I just wasn't bothered to ask it.

---

*Next: 22 of the 42 components in [7onic](https://7onic.design) shipped with two different import patterns at the same time. Both worked. One was a mistake.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

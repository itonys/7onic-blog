---
title: 'Design to Code #10: If a Tool Has to Be Chosen, It Won''t Be'
description: >-
  I shipped a design system five ways and nobody picked any of them. Two lessons
  from that failure shaped how 7onic was built.
pubDate: 2026-11-04T06:37:06.000Z
category: design-system
tags:
  - design-system
  - adoption
  - mcp
  - ai
series: design-to-code
seriesOrder: 10
draft: false
---

The fifth version handled its own setup. My pitch to the team was basically one sentence: just add the MCP server, I'll take care of the rest. Tokens, components, the rules for using them, all wired up for you.

It mostly didn't get added.

That was the moment I stopped asking how to make the design system easier to use, and started asking a much less comfortable question: why would anyone choose it at all?

## Five doors

This was on a team I worked with, not on 7onic. The details don't matter much, and honestly the pattern is more useful than the specifics.

It started as a design file: components, variants, the whole thing. I published it and figured people would come find it. When they didn't, I decided the file was the problem (too far from where anyone actually works) and built a guide site that explained what to use when.

Nobody read the site either.

So I shipped it as an npm package. Honestly, this was the version I believed in most. It wasn't advice anymore. It was code, sitting in the same world the engineers already lived in, one install and one import away from a button.

By then a lot of the UI was being written by AI anyway, which gave me a new idea: if people weren't going to read the rules, maybe the model would. I wrote an `llms.txt`. After that came the MCP server with automatic setup, the one from the first paragraph.

Every version removed a reason not to use it. None of them got used.

## The part where I was slow

I should be honest about how long it took me to see this, because it's a little embarrassing.

Every time a version failed, I found a packaging reason. The file was too far from the code. Fine, so the next one lived on a website, which turned out to be too far from the editor. The package needed setup. (The AI doc, in hindsight, needed someone to point the AI at it, which is the same problem wearing a new hat.) And each explanation was *true*, which is what made it so easy to keep going. I'd fix the packaging, ship the next door, and wait.

Five doors in, I finally noticed that I had become very good at building doors, and that nobody's route went through any of them. People were moving along the paths they already had: open the editor, ask the AI, ship the feature. A design system that waits next to that path, however well made, is a detour. And people don't take detours for an option.

The sentence I ended up with is short:

**If a tool has to be chosen, it won't be chosen.**

A rule that sits politely to the side isn't really a rule. It's a suggestion with unusually good documentation.

## Then I looked at 7onic

7onic came after all of that, and I'd like to say it's the version that finally broke the pattern. It's not that simple. Look at what it is: [design tokens](/blog/token-pipeline-one-json-11-outputs) in a Figma-compatible JSON file, a docs site, npm packages, an `llms.txt`, an MCP server. The same five doors, built again.

What changed is what I did with the two lessons that cost me the most.

## Lesson one: setup is where people quit

The npm package taught me this one. People didn't refuse the design system. They refused the setup, all the wiring that had to happen before the first button showed up. So in 7onic I tried to make the wiring disappear rather than document it better.

The whole AI side is one command:

```bash
claude plugin marketplace add itonys/7onic && claude plugin install 7onic-design@7onic
```

And if you start from the CLI, `npx 7onic init` can drop the 7onic skills and the design agent straight into the project's `.claude/` folder (that shipped in CLI 0.1.16 on 2026-10-09). There's a `--claude` flag that does it without asking.

It still asks by default, though, and the default answer is no. Even `--yes`, which accepts every other prompt in `init`, skips this one. I didn't want a design system quietly writing files into someone's `.claude/` folder just because they were in a hurry.

## Lesson two: nobody reads the rules, so put them where the work happens

This is the one I care about more.

The guide site waited for a person to open it. The `llms.txt` waited for someone to point the AI at it. Both were rules sitting *next to* the work. In 7onic the rules are handed to the AI the moment the MCP server connects, before it writes a single line, and one of them is not phrased as a suggestion:

```text
ALWAYS validate_code on the generated TSX before returning it;
fix every error and re-validate.
```

`validate_code` parses the generated TSX and checks it against 14 rules, 9 of which are errors (hardcoded colors, arbitrary values, native elements where a component exists, that kind of thing). Nobody has to remember to run it. The AI runs it on its own output, sees the error, and fixes it before a person ever looks at the screen.

That's the real difference from the five doors. Every one of them depended on somebody deciding to go and look. This one runs whether anyone remembers it or not.

(It's not perfect. The AI can still decide a rule doesn't apply, and a validator only catches what it was written to catch. A screen can pass every rule and still be a mediocre screen. That's a different problem and probably a different post.)

## Is that enough?

I don't know yet.

Both lessons work *after* 7onic is in a project. Once it's there, the rules travel with the AI instead of waiting in a docs tab, and the setup is short enough that it isn't the excuse anymore. Getting it into the project in the first place is still somebody's choice, and I can't build my way out of that part.

Maybe that's the honest boundary of an open-source design system. I can make the path through 7onic shorter than the path around it, and I can make it hard to drift off once you're on it. Whether it becomes the *only* path isn't up to the library. That part belongs to whoever adopts it.

What I've stopped doing is building a sixth door and calling it a fix.

---

*Next: what "solo" actually looked like on the calendar — the honest timeline of shipping 7onic alone.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

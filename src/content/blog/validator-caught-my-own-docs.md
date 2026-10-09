---
title: 'AI + Design #1: The Validator Caught My Own Docs Lying'
description: >-
  I built an MCP server so AI would stop ignoring my design-system rules. The
  first real violations it found were in my documentation, not the AI's code.
pubDate: '2026-10-09T06:18:54.000Z'
category: ai
tags:
  - mcp
  - ai
  - design-system
  - claude
series: ai-design
seriesOrder: 1
draft: false
devtoId: '4821442'
---

The first full run of my new drift checker printed 122 errors against my own design system.

About 119 of them were my parser's fault — it didn't know that "Select.Trigger" in the docs and `SelectTrigger` in the code are the same thing, that kind of noise. I fixed the parser and ran it again. Three errors survived. All three were real, all three were in `llms.txt`, and all three meant that every AI tool reading my carefully maintained documentation had been learning things that were false.

My Badge docs listed a `radius` value of `xl` that has never existed in the component, and omitted `base`, which does. The Chart example's import line was missing `Chart` itself — copy it and you'd get an undefined-symbol error on the first render. And `DropdownMenu.RadioGroup` simply wasn't documented, despite shipping months ago.

I built this tool to catch AI breaking my rules. Its first catch was my documentation lying to the AI.

## Why a static file wasn't enough

Back in [Design to Code #5](/blog/using-ai-to-build-a-design-system) I wrote about `llms.txt` — the six variants I maintain so AI tools know the component APIs and the token rules. I ended that post with an observation that's been bugging me since: in long sessions, rules that were clearly active at the start just quietly stop being applied. Not defiantly. They fade.

That's the structural problem with documentation as an interface: it's a polite request. The model reads it, agrees with it, and then four tasks later writes `bg-blue-500` anyway because the context that said not to has scrolled out of attention. You can't fix that with better prose. The document has no way to say *no*.

So between September 30th and October 7th I built the enforcement half: an MCP server. MCP — Model Context Protocol — lets an AI call tools instead of just reading text. The difference sounds subtle and isn't. A doc describes the token system; a tool *is* the token system, queried live, with the current values.

## What the server actually does

Nine tools, but three carry most of the weight.

`suggest_tokens` is the anti-hardcoding tool. The AI is about to write `#FF5733`? It's supposed to ask first, and the tool answers with the nearest real tokens by OKLab color distance — in this case `red-500` at a ΔE of 0.053, close but not exact. And when there's no exact match, the tool doesn't say "pick the closest." It returns a prompt instructing the AI to ask the *user* whether to bypass the token system. That decision was never the model's to make.

`validate_code` is the one I actually wanted. Feed it generated TSX and it parses the AST, extracts every className — including the ones hiding inside `cn()` calls and template literals — and checks fourteen rules: raw palette colors, arbitrary values, `dark:` prefixes (semantic tokens theme-switch on their own), `leading-*` overrides (typography tokens pair font-size with line-height), inline styles, native `<button>` where a component exists, and so on. Violations come back with line numbers and fix suggestions in English, Japanese, or Korean.

The third isn't a tool so much as a pipeline. Everything the server knows about components is generated from `llms-full.txt` — and then cross-checked against three other sources of truth: the actual source exports, the CVA variant definitions, and the CLI registry. Four records of the same system; if any pair drifts, the build fails. That's the checker that caught the Badge `xl` lie. The fixes shipped in v0.3.7's changelog as ordinary bug fixes, which they were — bugs in documentation are still bugs, they just corrupt AI output instead of crashing.

(One dumb detail that cost me a debugging detour: resource URIs. I named mine `7onic://rules/core` and the SDK rejected every request with "Invalid URL." URL schemes can't start with a digit. It's `design://7onic/` now.)

## The count that was right twice

Mid-build, the pipeline insisted my design system has 41 components. Every public page, the README, the llms.txt header — they all say 42.

I spent a genuinely uncomfortable stretch preparing to "correct" 42 across a dozen files before deciding to recount everything by hand first. Both numbers are right. The public count treats the four chart types as four components, the way a user browsing the docs experiences them, and doesn't count two internal utilities. The machine count sees one unified Chart source plus those utilities. Two different censuses of the same system, both internally consistent. I wrote the definition down so I never almost-"fix" it again.

I mention this because it's the week's real lesson in miniature: the hard part of machine-checking a design system isn't writing the checker. It's discovering how many of your own facts were never precisely defined.

## The validator was wrong too

Fairness requires reporting the other direction. My first version of the no-visual-override rule flagged `<DropdownMenuItem className="text-error">Delete</DropdownMenuItem>` as a violation. That pattern is in my own documentation — passing a semantic text color to a menu item is how you mark a destructive action. The rule was stricter than the system it was enforcing.

The fix for that class of problem became a gate: the validator must produce **zero errors and zero warnings across all 42 verified examples in llms.txt** before any release. The docs discipline the validator; the validator disciplines the docs. Neither one is the boss.

Then an end-to-end harness drives the whole thing over real stdio — five fake build scenarios, each with a clean version and a sabotaged version carrying planted violations. Current score: 15 of 15 planted violations detected, zero false alarms on the clean runs. I rerun it before every release and I still don't fully trust it, which I've decided is the correct amount of trust.

## Shipping it without an install step

Distribution had one constraint I cared about a lot: a user should get all of this without installing anything. The server bundles to a committed `dist/` — the five dependencies are baked in. On Claude Code it's a plugin, one command, and the whole thing lands at 3.3 MB.

One design decision there came from a scar. If a Claude Code plugin's root directory contains a `package.json`, the installer helpfully runs `npm ci` and pulls the entire dependency tree into every consumer's cache — I watched an earlier prototype of this architecture balloon to several hundred megabytes that way. The plugin root here deliberately has no `package.json`. Symlinks into the real build, nothing to install, nothing to resolve.

## Where this actually lands

The server has been live for two days, so take this as a first impression rather than a verdict.

What I can already say: the docs and the enforcement are converging instead of drifting, because they're now generated and checked against each other — the docs can't quietly rot without a build going red somewhere. `llms.txt` didn't become obsolete; it became the source the tools compile from. The polite request is still there. It just has a bouncer now.

What I don't know yet is how it behaves in other people's hands, with other agents, on codebases that aren't mine. The multilingual queries (`그림자` finds the shadow tokens, `チャット入力` finds ChatInput) were built on the theory that people think about design in their own language even when they code in English. Reasonable theory. Zero field data.

---

*If you want to poke at it: `claude plugin marketplace add itonys/7onic && claude plugin install 7onic-design@7onic`, or the long way around at [7onic.design/components/mcp](https://7onic.design/components/mcp).*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

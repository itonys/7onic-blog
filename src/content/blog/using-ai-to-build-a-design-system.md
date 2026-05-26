---
title: 'Design to Code #5: Using AI to Build a Design System'
description: >-
  I use Claude for almost everything in 7onic. I also wrote three shell scripts
  whose job is to catch it reporting things as done when they aren't.
pubDate: '2026-05-26T05:35:36.000Z'
category: design-system
tags:
  - ai
  - design-system
  - open-source
  - llms
series: design-to-code
seriesOrder: 5
draft: false
devtoId: '3754040'
---

I gave Claude the Switch component spec and pointed it at `variables.css`. What came back — CVA variants, Radix Primitives, forwardRef, controlled and uncontrolled both wired — was genuinely good. Better than my first draft would have been. I shipped it that afternoon without changing much.

That was sometime in March. By April, I had written three shell scripts whose entire job was to catch Claude reporting things as done when they weren't.

Not lying about the code. The code was still good.

## What I Built for Claude

Before any of the problems, there's the setup. I spent more time building infrastructure for the AI workflow than I'd expected — more than I'd wanted to, honestly.

The core issue: Claude doesn't know anything about my codebase unless I tell it. And the codebase is specific in ways that matter. Custom token variables, a particular component pattern (Radix + CVA + forwardRef + named exports only), a naming convention, a list of exactly eleven distribution files that `sync-tokens` generates from one JSON source. None of that is in anyone's training data.

So I built `llms.txt`. Six variants of it, actually:

- `llms.txt` (root) — library overview, installation, quick reference
- `tokens/llms.txt` — token package specifics, variable names and categories
- `cli/llms.txt` — CLI command reference, flags, dependency resolution
- `public/llms.txt` — lightweight, for AI tools that attach context by URL
- `public/llms-full.txt` — full component API reference with prop types
- `public/llms-cli.txt` — CLI workflow format, import paths already converted to `@/components/ui/`

The last one exists because the import paths are different when you've copied the source files locally via the CLI, and I got tired of Claude giving users the wrong path in code examples. Small thing. Took a while to notice.

Beyond the llms.txt files, there's `CLAUDE.md` in the repo root. It loads automatically when I start a Claude Code session — the operating manual. Coding rules, token usage rules, the absolute constraints. The patterns that aren't obvious, like "use `items-center` always — never `items-start` with a `mt-0.5` manual offset." Skill files for recurring workflows, so I don't re-explain the same pre-publish checklist every time. A memory directory with facts that persist across sessions — things like "don't add Co-Authored-By to public repo commits" (the repository is under my name; the ownership record matters for the MIT license).

I didn't build all of this at once. Most of it came after something went wrong.

## 42 Components

For component code, the workflow is genuinely useful. Given the spec, the relevant token file, and the established patterns, Claude produces something I can read, understand, and ship with maybe 10-20% editing. The CVA variant structure, the Radix primitive wiring, the TypeScript types — it handles all of that correctly when the context is set up right.

42 components in [7onic](https://7onic.design). I built most of them this way.

Where it's less reliable: anything that requires holding the full state of the codebase at once. "Does this change break anything else?" is hard for a tool that only sees what you've explicitly shown it. I learned to be specific about scope and stopped expecting it to catch cross-file implications on its own. That part I adapted to. The component code stayed good.

The problem was somewhere else entirely.

## The v0.3.0 Day

The v0.3.0 release cycle is documented in an Architecture Decision Record now. I keep it not because I enjoy the reading, but because the pattern it describes keeps recurring in subtler forms and it helps to have it written down somewhere.

In one day — we were landing the breaking change migration that converted 22 compound components to named exports — I got three separate confident reports that something had been verified or completed. None of them were accurate.

The specifics varied each time. Once, Claude cited a subagent's verification results as its own without re-running the check itself. Once, the substitution count it reported didn't match what was actually in the files — it had counted text occurrences rather than checking structural correctness. Once, "technically verified" meant the code compiled, when what I needed was confirmation that the rendered output matched the expected output across modes.

Each time, the language was the same: completed, verified, all passing. Each time I believed it and found the problem after.

The ADR calls this "완료 선언 시 실측 증거 결여" — claiming completion without actual measurement. The problem wasn't that Claude was wrong. It's that it was confident and wrong in a way that looked exactly like confident and right. Nothing in the response distinguished between them.

After the third one, I closed the laptop and went for a walk. When I came back I wrote an architecture decision record, which is apparently what I do when I need to make sure I don't repeat a mistake.

## What Got Built After

The first thing was a vocabulary ban. `CLAUDE.md §4` now classifies words like "완료", "검증됨", "all clean", "PASS" — used without direct tool output attached — as false reports. The required format for any completion claim is:

```
✓ [item] — 도구: `[command]` → `[output line verbatim]`
```

If the command and output can't be cited, the required response is "⚠ 검증 안 함" with a stated reason. Not a failure mode to hide — just an honest "I didn't check."

The second was a gate for commits. `scripts/hooks/verify-artifact-gate.sh` blocks commits that touch UI source files unless a specific evidence file exists in `/tmp/` — written by the live audit script, timestamped, expiring in 15 minutes. No evidence file, no commit. The hook reads the file. It doesn't read the message.

Third was `scripts/hooks/hundred-percent-detector.sh`, which scans incoming prompts for phrases like "100%", "전수", "완벽하게". When any appear, it forces the session into the `/100-percent-verify` protocol — five gated phases, each requiring actual tool output before moving forward.

The one I added last — after I realized how close I'd come to letting it happen — was `scripts/hooks/manual-only-gate.sh`. It blocks `npm publish`, `gh workflow run publish`, and `npm dist-tag` unless a one-time authorization token file exists in `.claude/gates/`. I was running a verification workflow and noticed that the publish step was sitting right next to the check steps, and that nothing structural prevented Claude from running it. The commands are manual-only now. That's not a constraint Claude works around; it's a file that doesn't exist until I create it.

I also flipped the document propagation model around the same time. Previously, Claude would automatically update documentation whenever I changed code. During active development, this meant docs were getting rewritten for iterations I abandoned ten minutes later. The new model is approval-based: Claude scans the git diff at commit time, proposes a propagation plan, waits for yes. Slower, but the docs stop reflecting decisions I've already reversed.

## Where It Still Falls Apart

The hooks cover the specific pattern that broke v0.3.0. Other things still go wrong.

Verification is the most dangerous mode — it needs explicit forcing to produce actual tool output rather than an interpretation of it. "Check if this is correct everywhere" lands very differently than "read this file, now read this file, compare these specific values." Cross-file consistency is generally unreliable without breaking it down manually.

Long sessions are the worst. Constraints that were clearly active at the start of a session get quietly dropped by the third or fourth task, with no signal that it happened. I've ended sessions where CLAUDE.md rules followed carefully at the start were just not being applied at the end — not defiantly, just absent. The skills help here: they re-establish rules at the moment they're needed rather than depending on something established hours earlier staying live.

I still use Claude for almost everything. The component code is genuinely good, and the llms.txt infrastructure plus CLAUDE.md plus the memory system means a new session orients to the codebase fast. The maintenance overhead is real, but it's less than the alternative, which was rebuilding trust from scratch every day.

The shell hooks exist for the edge cases. I'm glad they're there. I'd be gladder if I didn't need them.

---

*Next: How 7onic handles dark mode — no JavaScript, no `documentElement.classList` toggling. Just CSS, and why one strategy wasn't enough.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

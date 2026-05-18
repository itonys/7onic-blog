---
title: "Build & Release #5: How Apple's rsync Update Nuked My Repo"
description: >-
  A macOS update silently swapped rsync. My public repo's git history vanished.
  My first fix made it worse. Then I merged a bad commit without checking the
  diff.
pubDate: '2026-05-18T09:05:17.000Z'
category: devops
tags:
  - devops
  - git
  - open-source
  - rsync
series: build-and-release
seriesOrder: 5
draft: false
---

The sync script hadn't changed. Same flags, same paths, same output format. I'd been running it every single time I pushed a change to the public repo, and it had always been rock solid.

Until April 8th. I ran the script, and the terminal output looked perfectly normal. But when I double-checked the local public repo directory, something was missing.

No `.git` folder. It was just... gone.

## Why There's a Script at All

A quick bit of context: [7onic](https://7onic.design) lives a double life across two repositories. There's a private repo where the full project lives — the docs site, design tokens, internal tooling, the whole nine yards. And then there's the public repo (`itonys/7onic`) that contains only the open-source library: the core components, the CLI, and the token package.

To keep them in sync, I wrote a script that uses rsync to copy the relevant directories from private to public, filter out the internal fluff, and push the clean code.

Now, the `.git` folder in that public directory is what makes it a Git repository in the first place. It holds every commit, every branch, every tag, and most importantly, your remote configuration — the stuff that tells Git, "Hey, when I type `git push`, send this code to this exact GitHub URL." If you delete that folder, you lose your entire local history. Fortunately, the remote on GitHub stays intact, so a quick `git clone` will save your skin. But any local-only state? Completely vaporized.

My script explicitly included `--filter='P .git'`. That P stands for Protect — a standard GNU rsync flag that tells the engine, "Whatever you do, do not touch anything named `.git`." I had verified it. It had been working flawlessly for weeks.

What I didn't know was that macOS had quietly pulled a fast one on me. A recent OS update had swapped out the native GNU rsync binary for `openrsync`, Apple's own BSD-licensed re-implementation. And guess what? `openrsync` doesn't give a damn about `--filter='P .git'` the same way GNU does.

Combined with the `--delete-excluded` flag — which ruthlessly purges files in the destination that match an exclude rule — the public repo's `.git` folder was silently executed on the very next sync.

## The Fix That Made It Worse

My immediate, panic-fueled instinct was: Okay, rsync needs to keep its hands off `.git` entirely.

The obvious move was to tweak the flags. But in my state of confusion over which flag was doing what, I made the classic mistake of changing two things at once: I ripped out the protect flag and kept the exclude.

Which meant rsync looked at the source directory — the private repo — and copied its `.git` folder right over to the public destination.

The public repo had a `.git` folder again, sure. But it was a clone of the private repo's brain. This meant:
- The public directory's `origin` remote now pointed directly at the private GitHub repository.
- Any commit made from inside the public directory would bypass the public repo and push straight to the private remote.

I didn't realize this immediately. To verify my "fix" worked, I casually ran a test commit.

That commit flew straight into the private remote. I stared at the terminal git log for a long, quiet minute.

Oh, no.

## 321 Files Deleted. 93,300 Lines Gone.

I managed to untangle the origin mess first — wiped the imposter `.git` folder, ran a fresh `git clone` from GitHub to restore the actual public history, and got the public repo pointing back to itself.

But now, my local working tree was a crime scene. There was a bad commit (`13edc14`) sitting there from the whole ordeal that needed to be reconciled. I decided to merge it.

I did not run `git diff --stat` first. Big mistake.

The merge took the private repo's file structure as the absolute source of truth and aggressively subtracted everything the public repo wasn't supposed to have. Which, as it turned out, was almost the entire codebase.

321 files deleted. 93,300 lines of code wiped from existence.

`site.config.ts` got completely overwritten with the private version. `package.json` followed suit. What followed was a cascade of four consecutive errors. I fixed each one blindly, treating the symptoms without looking at the larger picture, only to trigger the next error. It was that specific kind of miserable debugging session where you're chasing ghosts because you refuse to admit how deep the hole actually is.

The ultimate salvation was running `git reset --hard f3453d8` — rolling back to the last clean commit before the madness started. It worked instantly and cleanly. The actual damage was luckily contained to my local working state and one embarrassing, stray commit on the private remote.

But it cost me four hours.

## The Real Fix

The root problem was putting blind faith in rsync to protect a critical folder like `.git`. Any solution that relies on a specific CLI implementation behaving perfectly across different OS flavors is fundamentally fragile. GNU rsync and `openrsync` are simply not the same beast.

The new approach completely eliminates rsync from the equation of trust:

```bash title="scripts/sync-public-repo.sh"
# Physically move .git completely out of rsync's line of sight
GIT_BACKUP="/tmp/.7onic-git-backup-$$"
mv "$DEST/.git" "$GIT_BACKUP"
trap 'mv "$GIT_BACKUP" "$DEST/.git" 2>/dev/null' EXIT

# rsync runs with .git physically absent from the destination
rsync -av --delete \
  --exclude='.git' \
  "$SRC/" "$DEST/"

# Restore it like nothing happened
mv "$GIT_BACKUP" "$DEST/.git"
trap - EXIT
```

It's a three-layer defense: physically eject `.git` to `/tmp` before rsync even initializes so there's nothing to delete, tell rsync to exclude it anyway just to be safe, and then slide it back into place afterward. The `trap EXIT` ensures that even if rsync crashes or the script aborts mid-run, the restore still fires. No flags to guess. No implementation quirks to worry about.

It hasn't broken once since April 8th.

## Post-Mortem

The merge was the ultimate unforced error. By the time I hit that step, I had already fixed the remote origin issue — I was technically in recovery mode, not still drowning. A single `git diff --stat` before hitting enter on that merge would have screamed "321 DELETIONS" and I would have stopped immediately.

I didn't check because I was still trapped in "fix things fast" mode, which is historically the absolute worst mindset for carefully reviewing a git merge.

The initial script fix would have been fine too if I had just changed one thing at a time. Instead, I altered two flags simultaneously while my brain was fried, which is exactly how you end up copying a private `.git` directory somewhere it has absolutely no business being.

I've added one final line to the end of the sync script now: `git -C "$DEST" remote -v`. It prints the active origin remote after every single sync. It takes half a second. If it ever accidentally shows the private remote URL again, I'll catch it instantly before a test commit can make a fool out of me.

---

*Next: The same week I broke the sync script, I also reversed an npm install decision I'd documented in my own ADR — because the axios supply chain attack made my "just delete the lockfile" approach suddenly untenable.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

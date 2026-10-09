---
title: 'Build & Release #2: I Deleted Every npm Token I Own'
description: >-
  My npm publish failed four times in one day, each with a different error. The
  fix wasn't a new token — it was deleting every token I own.
pubDate: '2026-10-09T03:14:49.000Z'
category: devops
tags:
  - npm
  - supply-chain
  - github-actions
  - ci-cd
series: build-and-release
seriesOrder: 2
draft: false
devtoId: '4820820'
---

On October 7th I tried to publish `@7onic-ui/tokens@0.3.7` and npm told me my own package didn't exist.

```
npm error 404 Not Found - PUT https://registry.npmjs.org/@7onic-ui%2ftokens
npm error 404  '@7onic-ui/tokens@0.3.7' is not in this registry.
```

A 404. On a PUT. For a package I'd published more than a dozen times before, from the same workflow. The release itself was as ready as a release gets — smoke tests green across three environments, seventeen publish checks passed, changelogs finalized. The only thing left was the button. I pressed it four times that day, and npm rejected me four times, each time with a different error.

By the end of the next day I had fixed publishing. Not by creating a better token — by deleting every npm token I own and removing the `NPM_TOKEN` secret from GitHub entirely. The repository secret count is now zero, and publishing works better than it ever did.

Let me walk through the four failures, because each one taught me something I didn't want to learn.

## Failure one: the 404 that was actually a 401

Here's the first thing nobody tells you: **npm reports authentication failures on publish as 404s.** Not 401, not 403 — a flat "this package is not in this registry," which reads like you typo'd your own package name. The reasoning is sound (don't leak package existence to unauthorized callers), but when it's *your* package and *your* CI, you waste a good twenty minutes staring at a URL that is obviously correct.

The actual cause was sitting in the GitHub secrets panel the whole time: `NPM_TOKEN`, last updated April 9th. Granular npm tokens expire. Mine had died quietly at some point in the five months since, and because I hadn't shipped anything since April, nothing had noticed. The token didn't fail loudly on its expiry date — it just waited for me.

## Failures two and three: entirely my fault

This is the embarrassing part, so I'll get it all out at once.

I generated a fresh token and registered it with `gh secret set NPM_TOKEN` — typed inline into an agent session rather than a real terminal. Inline means non-interactive, non-interactive means no paste prompt, no paste prompt means the command happily saved an *empty string* as my publishing credential. The next run failed with `ENEEDAUTH`, and the workflow's env block didn't even list the token anymore. I had secured my package against everyone, including myself.

Attempt three was better, which is to say worse. I piped the clipboard into the secret this time — except the clipboard contained the token *name and value glued together*, because the npm UI had let me select both in one sweep. So now GitHub faithfully stored something like `7onic-gha-publish-2026-10npm_...` as the secret. The workflow passed it along. npm, quite reasonably, had no idea what it was. Another 404.

The detail that finally cracked it: the token's detail page said **"Last used: never."** The workflow logs showed the env variable being set, the publish being attempted — and npm had never seen the token once. That's not an authorization problem. That's the wrong bytes in the envelope.

(The fix for this class of problem, for the record: `pbpaste | head -c 4` before registering anything. If it doesn't print `npm_`, stop.)

## Failure four: npm says the quiet part out loud

With the value finally correct, attempt four produced a brand new error — a 403, with an actual explanation:

> Two-factor authentication or granular access token with bypass 2fa enabled is required to publish packages.

My new token was missing a checkbox the old one had: "bypass two-factor authentication." Fine, I thought, I'll just recreate it with the box checked. And that's when npm started talking to me directly. The token creation screen now warns that bypass-2FA tokens with direct publish access **will stop working in January 2027**. Ticking the box triggers a second warning: "There are security risks with this option. For automation or CI/CD uses, please use Trusted Publishing instead."

So the complete picture, one day in: my token path had failed four times for four unrelated reasons, and the platform was telling me — twice, in red — that the entire mechanism had about three months to live.

I'd been treating Trusted Publishing as a someday-migration. It stopped being someday.

## The switch took less time than failure number three

Honestly, this was the anticlimax of the whole affair.

Trusted Publishing (OIDC, if you want the protocol name) replaces the shared-secret model with a question npm asks GitHub directly: *did this publish really come from this repo's workflow?* GitHub signs an identity assertion per run; npm verifies it. There is no token to expire, no secret to paste, nothing to leak. On the npm side, you register the publisher once per package — four fields: owner, repo, workflow filename, environment. I did it three times, once for each package.

On the workflow side, the diff is mostly deletion. Remove the `NODE_AUTH_TOKEN` env from every publish step — this matters, because a present token takes precedence over OIDC and silently cancels the whole upgrade. Then one real trap: Trusted Publishing needs **npm 11.5.1 or newer**, and the Node 20 runners bundle npm 10. My first instinct was `npm install -g npm@latest`. I checked before committing, and I'm glad I did — `npm@latest` is 12.2.0 now, and its engines field demands Node 22+. It would have failed to even install on my runners. Pinned to the 11 line instead:

```yaml
- name: Upgrade npm for trusted publishing
  run: npm install -g npm@11 && npm --version
```

That's the entire migration. Three registrations, three env deletions, one pinned upgrade step.

## The run that finally went green

October 8th. All three jobs passed — tokens in 18 seconds, CLI in 16, react in just under four minutes. Each publish came with something the token era never gave me: a provenance statement, signed with the workflow's identity and recorded in Sigstore's public transparency log. Anyone can verify that `@7onic-ui/react@0.3.7` was built by that exact GitHub Actions run from that exact commit. My README has claimed "supply chain verified" for months; it's measurably truer now.

One small heart attack remained: `npm view @7onic-ui/react version` kept returning 0.3.6 after the green run. The publish log had said `+ @7onic-ui/react@0.3.7`, and also, in smaller print, "Your package is being processed and may take a few minutes to become available." OIDC publishes go through a processing pipeline that took about thirty minutes for the biggest package. I know this because I polled it the entire time like it was exam results.

## Then I deleted everything

Here's the part that still feels slightly wrong, in a good way. With OIDC live, every npm token I had was dead weight — worse than dead weight, since one of them had briefly passed through a chat session in plaintext during the clipboard fiasco. So: revoked all of them. Deleted the `NPM_TOKEN` GitHub secret (the API confirms the repo now has zero secrets). Flipped each package's publishing access to "require two-factor authentication and disallow bypass 2fa tokens," which blocks token publishes outright while leaving OIDC untouched.

The publishing chain for three npm packages now contains no credential of any kind. Nothing to rotate, nothing to expire in six quiet months, nothing to paste wrong. The thing that fixed my pipeline was removing the ability to authenticate to it.

## Where this leaves things

If you publish from CI with a token, the January 2027 shutoff applies to you too — I just got shoved through the door three months early by an expired credential and my own clipboard. The migration is genuinely about an hour if your packages already publish from GitHub Actions, and most of that hour is reading.

I won't pretend it's all settled for me, though. A login-less pipeline felt weird for a full day — some reflex kept looking for the secret that proves it's really us. It isn't there anymore. GitHub's word is the proof now, which mostly means I've traded "trust myself to manage tokens" for "trust the OIDC chain." Given how I managed tokens this week, that trade is not close.

---

*Next up: back in [Design to Code #5](/blog/using-ai-to-build-a-design-system) I wrote about llms.txt — a static file AI tools read and hopefully obey. Since then I've built the enforcement half: an MCP server that lets the AI query tokens and components directly, and a `validate_code` tool that rejects what the docs couldn't prevent. That story next.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

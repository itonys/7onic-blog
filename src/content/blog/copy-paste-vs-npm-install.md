---
title: "Design to Code #3: Copy-Paste vs npm Install"
description: >-
  Five days after publishing @7onic-ui/react@0.1.0, I started building a CLI
  that copies files instead. The npm package still ships. Here's the trade-off.
pubDate: 2026-04-24T11:31:46.000Z
category: design-system
tags:
  - design-system
  - cli
  - open-source
  - react
series: design-to-code
seriesOrder: 3
draft: false
---

The first thing I did after publishing `@7onic-ui/react@0.1.0` was install it in a test project.

It worked. Imports resolved, buttons rendered, and Tailwind classes applied perfectly. I sat there for a moment feeling good about this. Then I wanted to double-check the focus ring behavior, so I went to inspect the source.

What I found was `node_modules/@7onic-ui/react/dist/index.mjs`—a bundled, transformed mess with variable names half-mangled by the build step. I could see the output, but I couldn't truly read it. For most packages, that's the whole point. But for a design system, it felt wrong. The entire premise of this project was transparency, yet my code was hidden behind a build artifact.

## What I shipped vs. what I should have shipped

The npm package made sense at the time. If you want a Button, you `npm install @7onic-ui/react`, `import { Button }`, and you're done. It's the standard approach, it genuinely works, and it's still live for those who prefer it.

But the problem wasn't a bug; it was the abstraction model.

A utility library like lodash benefits from being a black box. You don't care how `_.debounce` is implemented as long as it debounces. You import it, use it, and update it. Component libraries are different. When a button doesn't look quite right in your layout, you need to see the source. When you need a prop that doesn't exist, you need to modify it. When your TypeScript config is stricter than mine, a compiled `.js` file won't help you debug why your build is failing.

A design system is something you should own. The traditional package model says "I maintain this, you consume it." That's the wrong relationship.

## Five days later

`@7onic-ui/react@0.1.0` went live on April 4th. By April 9th, I was already building a CLI.

The idea was simple: instead of importing from a compiled package, you run `npx 7onic add button` and the actual `.tsx` source code is copied directly into your project. It lands in `src/components/ui/button.tsx`—readable, and entirely yours. No `node_modules` involved. The exact file living in the [7onic](https://7onic.design) repo is what ends up in your codebase.

I wasn't inventing this—shadcn/ui had been doing it for a while. But I hadn't fully appreciated why until I spent a few days trying to be a consumer of my own npm package.

The registry approach works like this: the CLI bundles all 40 component source files (~456KB) and when you run `add`, it writes them directly to your disk. No transformation, no obfuscation. You can open it, change it, or even break it.

```bash
npx 7onic add button input select
```

It also handles dependencies automatically. `add input` realizes it needs a field wrapper and pulls that in too. `add button-group` knows to fetch `button` if it's missing. Building the topological sort for this was a rabbit hole in itself. (Writing tests for dependency resolution is as boring as it sounds.)

## What this actually enables

The obvious benefit is customization. You can modify `button.tsx` directly—add a custom variant or tweak a default class—without forking a repo or waiting for a PR to merge.

But there was a less obvious win regarding TypeScript.

Vite's default template sets `noUnusedLocals: true` in `tsconfig.app.json`. In my initial `card.tsx`, I had a `sizePaddingMap` object intended for future use but not yet wired up. In my own dev environment, `eslint-disable` handled it fine. But in a user's Vite project, `tsc` would simply fail the build.

In a compiled npm package, that's a "wait for a fix" situation — I'd need to publish, users would need to update. With source files, the user can see the issue and fix it instantly. And once I pushed the official fix—deleting the unused object—the registry updated so the next `npx 7onic add` gets the clean version. The friction of a version dependency became just a file in your project.

There's also an AI angle I hadn't anticipated. When source code is buried in `node_modules`, tools like Claude or Copilot can't easily see it without explicit context. When it lives in `src/components/ui/`, it's part of your codebase. "Modify the Button component" becomes a direct, actionable instruction instead of something that requires explaining what's in the package first.

## The trade-off

Nothing is free.

When I update `button.tsx` with a bug fix or a new variant, users who copied the file don't get it automatically. They have to run `npx 7onic add button --overwrite`, which many won't do. The code copied in April is the code they'll likely be running in October.

With an npm package, `npm update @7onic-ui/react` handles that.

It's a trade-off between convenience and ownership. If you want to stay in sync with upstream, use the package. If you want to own your UI and treat it as a snapshot in time, the CLI is the way to go.

I don't think one is always right. But the copy-paste model better matches how developers actually treat design systems. Nobody updates their component library every week. The files get copied, maybe tweaked, and then just sit there doing their job. At least with the source approach, what's sitting in your folder is human-readable.

## The package still exists

I still publish `@7onic-ui/react` with every release. My GitHub Actions workflow publishes the npm package and regenerates the CLI registry simultaneously.

There are teams with strict policies about what lives in `src/`, or monorepos that prefer package boundaries. For them, `import { Button } from '@7onic-ui/react'` is still the right call.

I just don't think it's the default anymore.

The CLI launched five days after the first npm release. That wasn't a planned timeline — it was a reaction. I wrote the install instructions for the package, tried to follow them myself, and spent the rest of the week building an alternative. Sometimes the fastest way to realize what's wrong with what you've built is to use it as if you didn't build it.

---

*Next: 42 components in, there are patterns I'd never go back on — and at least three I'd design completely differently.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

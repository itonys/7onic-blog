---
title: 'Design to Code #8: The Cosmetics of Modularity'
description: >-
  How a generateCode() function in our docs told users to import from a subpath
  that was never in the package — and why we still ship one entry point.
pubDate: '2026-05-26T07:31:34.000Z'
category: design-system
tags:
  - design-system
  - package-exports
  - dx
  - react
  - open-source
series: design-to-code
seriesOrder: 8
draft: false
devtoId: '3754999'
---

It was sometime in early April. Version 0.1.0 had been sitting on npm for maybe twenty-four hours. I was clicking through the documentation site I'd just deployed, riding that brief, fragile wave of pride you get right before you discover a critical bug.

The Card component page featured a standard "Copy" button on the code block. Out of pure habit, I clicked it, flipped over to a scratch test project, and ran `npm install @7onic-ui/react`. The installation finished cleanly. Then, the development server lit up bright red.

```
Module not found: Can't resolve '@7onic-ui/react/card'
```

The code block on my own documentation site was instructing developers to import from a path that literally did not exist in the package they had just installed. It wasn't a typo. It wasn't a missing dependency. It was a path that had never existed and was never going to exist, simply because I had never written a `package.json` exports map to support it.

Anyone who copied that snippet on day one ran straight into a module-resolution error on line one.

## Where the Lie Came From

The Card documentation page relied on a helper function called `generateCode()` to render the Playground's live preview snippets. Somewhere deep in that utility, I had written a line that looked roughly like this:

```tsx
const importPath = `@7onic-ui/react/${componentName.toLowerCase()}`
```

It feels entirely right when you write it. It's very shadcn-style. It looks clean, professional, and mimics the architecture of a massive, modular enterprise package. The string interpolated perfectly, the syntax highlighter mapped it beautifully, and the page rendered with zero console warnings.

The only problem was that it had absolutely zero relationship to what was actually sitting inside the compiled `dist/` directory.

In reality, I had built the package with a single root entry point — one lone `index.ts` file that re-exported every component. The `package.json` had `"main"` and `"module"` and `"types"` all pointing strictly to that one file, and that was it. There was no `"exports"` map, no subpaths, nothing. The npm package and the documentation site were completely misaligned, and the docs site was writing checks that the package couldn't cash.

## What I Did Instead of Managing 42 Subpaths

My initial, knee-jerk instinct was to fix the documentation site by making the underlying package match its claims. I figured I'd just build the subpath infrastructure: write out the exports map — `"./card": "./dist/card.js"`, `"./button": "./dist/button.js"` — and repeat that for all forty-two components. I'd configure tsup to emit every single one of them as an isolated entry point, and then commit to maintaining that list for the rest of my life.

I actually started doing this, but I stopped about four components into the refactor. The sheer volume of `package.json` plumbing required per component was non-trivial. Every single new component added down the line would mean another entry to write, another build target to track, and another vector for human error if I forgot to map it.

So, I decided to look at how mature UI libraries actually solve this.

shadcn/ui wasn't a valid architectural comparison because it doesn't ship via an npm registry; you're copying raw source files directly into your project. But when I looked at libraries like Mantine, Chakra UI, and Radix Themes, they all import directly from a single root: `import { Button } from '@mantine/core'`. Not `@mantine/core/button`. The packages I had been quietly romanticizing in my head weren't even doing what my documentation claimed I was doing.

Furthermore, the bundle-size argument didn't hold water. Running tsup with `splitting: true` ensures that tree-shaking handles dead code elimination gracefully at the named-export level. If a consumer imports `{ Button }` and nothing else, the rest of the library doesn't get shipped to the client anyway.

The subpath import was entirely cosmetic. It was a vibe. It was the aesthetic of a modular architecture, not actual modularity.

I formalized this decision in an Architecture Decision Record — `NO-SUBPATH-EXPORTS.md` — mostly to stop future-me from having this exact same argument with himself. I established very clear re-evaluation criteria in the document: I would only revisit subpath exports if the library grew past 50 components, if a single root import began ballooning the bundle size past 100KB, or if actual production users explicitly demanded it. Right now, none of those conditions are true. We have 42 components, tree-shaking works flawlessly, and nobody has complained.

Once the ADR was settled, I fixed `generateCode()` to emit `@7onic-ui/react` and absolutely nothing else. I cleared the build cache, reloaded the documentation page, clicked Copy, and pasted it. It worked seamlessly. It was the first time my documentation had actually agreed with my compiled package.

## The One Exception (Which Arrived Three Days Later)

Of course there is an exception. There is always an exception.

On 2026-04-08 I shipped v0.2.0 and the Chart component rolled out with its own dedicated subpath: `@7onic-ui/react/chart`. The ADR covering this deviation is titled `CHART-SUBPATH-EXPORT.md`, and it's a direct response to a real dependency bottleneck.

The Chart component relies heavily on recharts. recharts is a massive package, and most developers pulling in a core design system like [7onic](https://7onic.design) don't need visualization tools right out of the gate. To accommodate this, I marked recharts as an optional peer dependency, adding it to `peerDependenciesMeta` with `optional: true`.

Here is the JavaScript module quirk I didn't anticipate: if an optional library like recharts lives anywhere within the main entry point's import graph, importing literally anything from that main entry — a Button, an Input, a Badge — will instantly crash the application if recharts isn't installed in the consumer's project.

Module resolution hits the application before tree-shaking even gets a vote. The bundler parses the dependency chain, spots `import { LineChart } from 'recharts'`, immediately goes hunting for it in `node_modules`, fails to locate it, and brings the entire application crashing down.

The only real fix was to completely isolate the Chart component into its own independent entry point. This required two distinct tsup build configurations: `index` (ensuring no recharts code touched the primary graph) and `chart` (treating recharts as an explicit external dependency). I mapped two separate entries in the `package.json` exports map, and thus, a single subpath earned its place by solving a tangible structural failure.

The rule here isn't "never use subpaths." The rule is "no subpaths for vibes." If a subpath exists to isolate a heavy, optional dependency that would otherwise break the primary entry point, it earns its keep. If it exists simply to make the import line look more modular than it actually is, it gets cut.

## What the DX Improvement Actually Looked Like

When developers ask for subpath imports, what they are usually chasing is a sense of visual intentionality. They like seeing `import { CardHeader } from '@7onic-ui/react/card'` because it provides immediate, spatial context that CardHeader is tightly coupled to the Card component ecosystem.

v0.3.0 solved that psychological need without the overhead of subpaths. Every subcomponent is now exposed as a flat, named export right at the root entry point:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@7onic-ui/react'
```

You get a single, clean import line with all subcomponents explicitly declared. The contextual grouping shifts from the file path to the editor's autocomplete panel and the names themselves — `Card`, `CardHeader`, `CardTitle`. As you read the code from left to right, the structural relationship is entirely obvious.

An added benefit is that you only ever need exactly one import statement per component family, no matter how many nested subcomponents your layout requires. I actually find myself copying and pasting far fewer import lines now than I did when I was pretending the library utilized subpath directories.

## What's Still Bothering Me

The reality I keep coming back to is that `generateCode()` spent a non-trivial amount of time serving a complete fiction to early adopters, and I have no real way of knowing how many people copied it before I pushed the fix. Granted, v0.1.0 didn't hit massive installation numbers, but those early users existed.

The resulting terminal error message is completely unambiguous, so anyone who tried it would have figured out the fix immediately. But they also would have known, on day one, that the maintainer didn't bother to test his own basic copy-paste documentation flow before executing a production release.

To prevent this from happening again, I wrote a verification script that executes an `npm pack` into a temporary directory and programmatically attempts to import components from the exact paths exposed by the documentation site. It exists purely because I no longer trust myself to remember to check manually. I shipped that script in the exact same release as the chart subpath — v0.2.0 — which feels poetically correct. Both implementations emerged from the exact same architectural realization: the npm package and the documentation site are two completely separate artifacts, and nothing forces them to agree unless you sit down and write the code that forces them to agree.

I should probably write an automated end-to-end test that scrapes every single `generateCode()` output across the entire live docs site, packs the library, and runs an isolated import test on each snippet. I haven't written it yet. It's on the list.

---

*Next: 42 components, one developer, no design review. What the patterns looked like after a year of building and what I'd do differently if I started over.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

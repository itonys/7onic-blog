---
title: 'Design to Code #7: How CVA Scaffolding Turned Into Dead Code'
description: >-
  Every 7onic component starts with CVA. A pre-publish lint sweep deleted it
  from five of them — including one where the cva call itself had no variants at
  all.
pubDate: '2026-05-26T06:50:16.000Z'
category: design-system
tags:
  - design-system
  - tailwind
  - typescript
  - react
  - open-source
series: design-to-code
seriesOrder: 7
draft: false
devtoId: '3754731'
---

The lint config had been sitting in the repo for a week, untouched, when I finally ran it across `src/components/ui/` on the afternoon of April 4th. I was expecting maybe a stray `console.log`, a forgotten TODO — the kind of trivialities you hunt down right before any first publish. What I got back instead was a list of five files where `VariantProps` was imported but never used: breadcrumb, divider, drawer, pagination, and toast. Fine. Dead imports. Delete them and move on.

But then I opened `breadcrumb.tsx` and noticed something worse: the `cva` call itself was also completely unused. Not just the type import — the entire `const breadcrumbVariants = cva(...)` block was sitting there, fully defined, exported in spirit, and referenced by absolutely nothing. The component rendered its classes via `cn()` directly. The CVA scaffolding was pure decoration.

I had written that file. Yet I had no memory of writing the CVA part of it, because I had not written it deliberately. I had simply pasted the boilerplate shape of a [7onic](https://7onic.design) component and filled in the middle.

## Why CVA Earns Its Slot Elsewhere

Before getting into why removing it from breadcrumb was the right move, it helps to look at why that dependency is everywhere else in the first place.

`class-variance-authority` is one of the four core packages the `7onic add` CLI auto-installs alongside `@7onic-ui/tokens`, `clsx`, and `tailwind-merge`. Four dependencies. That is the absolute floor of this design system. If you install a single 7onic component, all four show up in your `node_modules`, and CVA is the only one that isn't either a pure utility (`clsx`, `tailwind-merge`) or the design token layer itself.

It earns that real estate mostly on components like Button.

The Button component has, in its current form, four variants (`solid`, `outline`, `ghost`, `link`), six sizes (`xs`, `sm`, `md`, `default`, `lg`, `icon`), nine radius values (`none` through `full`), and a `fullWidth` boolean. Multiply that out and you get something north of four hundred valid combinations, every single one of which needs to produce the exact right Tailwind class string. Without CVA, the alternative is a long, miserable staircase of nested ternaries and template literals, or some homegrown lookup map that re-implements the same idea worse. The CVA call collapses that entire matrix into a single declarative object:

```ts
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap transition-all duration-micro focus-visible:focus-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: { solid: 'font-semibold', outline: 'border border-border bg-background text-foreground hover:bg-background-muted', ghost: '...', link: '...' },
      size: { xs: 'h-7', sm: 'h-8', md: 'h-9', default: 'h-10', lg: 'h-12', icon: 'h-10 w-10' },
      radius: { none: '...', /* ...nine total */ full: '...' },
      fullWidth: { true: 'w-full' },
    },
    defaultVariants: { variant: 'solid', size: 'default', radius: 'default', fullWidth: false },
  }
)
```

But handling class strings is only the smaller half of what CVA actually does for the library.

## The Part That Isn't About Classes

The real reason CVA is worth a dedicated dependency slot is the line immediately following that `cva` call:

```ts
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { /* ... */ }
```

`VariantProps<typeof buttonVariants>` reads the variants object and infers the prop types directly from it. `variant` automatically becomes `'solid' | 'outline' | 'ghost' | 'link'`. `size` becomes `'xs' | 'sm' | 'md' | 'default' | 'lg' | 'icon'`. If I add a new size next month, the type system updates without me ever touching the props interface. If I rename `solid` to `filled`, every consumer site gets a red compile error the moment they pull the updated version.

You can easily build the class-string concatenation machinery yourself in twenty lines of code and tree-shake your way out of the dependency. What you cannot easily replicate yourself is this bidirectional link between the configuration object and the TypeScript types. CVA's true value lives inside the type system; the runtime class composition is just along for the ride.

Which is exactly what made the breadcrumb situation slightly ridiculous. Breadcrumb had a `cva` call with `variants: {}` — empty object, no variants — and it still had `VariantProps` imported at the top of the file. `VariantProps<typeof breadcrumbVariants>` resolves to `{}`. Zero props. The entire setup was a circle whose circumference was exactly zero.

## When Variants Aren't Enough

The other thing worth knowing about CVA, before addressing the problem with defaults, is that it has a known soft edge. CVA fundamentally expects each variant to be orthogonal — meaning `size` should be independent of `variant`, which should be independent of `radius`. The exact moment you introduce a prop that only makes sense in tight combination with another prop, you step outside the comfortable middle of the library.

Button's `color` prop is the clearest example. It accepts `default`, `primary`, `secondary`, or `destructive`, and it only actually does anything when `variant === 'solid'`. An outline button doesn't have a solid fill color in the same way; a ghost button doesn't either. If I were to put `color` inside the main CVA variants object, it would show up in the TypeScript types for all variants. Consumers could legally write `<Button variant="ghost" color="destructive" />` and get something that compiles cleanly but produces incoherent runtime styling.

So `color` lives outside CVA as a plain JavaScript lookup map:

```ts
const solidColorMap = {
  default: '...',
  primary: '...',
  secondary: '...',
  destructive: '...',
}
```

And the final class assembly looks like this:

```ts
cn(
  buttonVariants({ variant, size, radius, fullWidth }),
  variant === 'solid' && solidColorMap[color],
  className
)
```

The `variant === 'solid' && ...` line is load-bearing. CVA hands back the base utility classes; the conditional hands back the contextual color, but only when it is strictly relevant; `cn` flattens everything out while resolving any Tailwind utility conflicts. It's not exceptionally beautiful, but it's an architectural seam. CVA handles the clean, rectangular center of the design space and the conditional patches the corners.

For a long time I wanted to push `color` back into CVA via `compoundVariants` — the specific API designed for cross-prop interactions. I never found a way to express "this prop only exists when this other prop has this specific value" through `compoundVariants`. It can apply extra utility classes when two variants combine, but it cannot make a prop conditionally part of the TypeScript type interface itself. So the escape hatch remains.

## Where compoundVariants Does Pull Its Weight

Five of the 42 components use `compoundVariants`: divider, tabs, segmented, textarea, and input. These are the components where the cross-prop logic isn't "should this prop exist?" but rather "what specific class combination does this intersection produce?"

The clearest use case is Input, which maps out three entries:

```ts
compoundVariants: [
  { focusRing: true, className: 'focus-visible:shadow-[0_0_0_2px_var(--color-focus-ring)]' },
  { variant: 'default', focusRing: false, className: 'focus:border-border-strong' },
  { variant: 'filled', state: 'error', className: 'border-transparent ... bg-[var(--color-error-bg)]' },
]
```

The third entry is the interesting one. `variant: 'filled'` and `state: 'error'` are both perfectly legal in isolation. A filled input without an error renders with a subtle gray background. An outline input with an error renders with a stark red border. But the combination of *filled and errored* needs its own custom treatment — a transparent border (because there is no outline to color) and a red-tinted background instead of the standard gray. Without `compoundVariants` you would either need a third state value (`filled-error`?) or lift the conditional outside CVA, creating the exact same seam I had to build for Button's color.

Divider's `compoundVariants` block is less complex but significantly more dense — ten entries covering the cross product of `orientation` (horizontal/vertical) with `spacing` (sm/md/default/lg). Each combination produces the correct margin utility and border direction. `horizontal` + `default` yields `border-t my-4`. `vertical` + `sm` yields `border-l mx-2`. The entire matrix laid out with zero conditionals at the call site.

These are the exact use cases CVA was actually engineered for.

## What the Lint Sweep Was Actually Saying

So, the tally stood at five files with unused `VariantProps`. Four of them — divider, drawer, pagination, and toast — were using CVA productively but had simply forgotten to clean up the type import lines after a previous refactoring pass. An easy delete.

The fifth file, breadcrumb, was the one where I had to admit something to myself. Breadcrumb genuinely does not have variants. It has a rigid structure — a list of items separated by a visual separator — and the only thing that changes between instances is the literal content. There is no `size` prop because the size is inherited from the surrounding text context. There is no `variant` prop because there is only one way to render a breadcrumb in this system. The component is a thin, sensible wrapper around `<nav>` and `<ol>`.

Yet I had still given it a full `cva` call. With a completely empty `variants` object. Simply because every other file in the library had one.

That is the part worth writing down. The CLI installs CVA. The component templates start with CVA. Forty-two components use CVA. So when I sat down to author the breadcrumb file, my hands typed `import { cva, type VariantProps } from 'class-variance-authority'` before my brain ever caught up with the fact that there were no variants to manage. The lint sweep wasn't merely catching dead code; it was catching the underlying assumption that the pattern itself is the point.

The final result, after the cleanup: 0 errors, 0 warnings. Five files lighter on unused imports. One file lighter on an entire unused `cva` block. And a small, sobering note left in the ADR: *"Pattern boilerplate vs deliberate use: not the same thing."*

I think about that note more than I want to. The whole appeal of building a component library, from the inside, is that you stop having to make tiny, repetitive decisions. You reach for the established template, fill in the middle, and ship. The hidden cost is that you eventually stop noticing when the template is making the decisions for you. CVA inside the breadcrumb wasn't a load-bearing tool. It was just a habit wearing the costume of one.

---

*Next: 7onic ships one entry point. No `@7onic-ui/react/button` subpath imports. The reason is embarrassingly specific to one incident where generateCode() sent users to an import path that didn't exist.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

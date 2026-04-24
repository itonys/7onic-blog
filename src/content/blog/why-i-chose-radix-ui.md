---
title: 'Design to Code #4: Why I Chose Radix Over Custom Primitives'
description: >-
  I tried to build a dialog focus trap from scratch. Got it wrong in an
  afternoon. Here is what Radix actually handles — and what it still gets wrong.
pubDate: '2026-04-24T13:25:14.000Z'
category: design-system
tags:
  - radix-ui
  - accessibility
  - react
  - design-system
series: design-to-code
seriesOrder: 4
draft: false
devtoId: '3546424'
hashnodeId: 69eb717bc16ce5534f45978a
---

I spent an entire afternoon trying to write a focus trap from scratch.

The requirement seemed dead simple: when a modal is open, the Tab key should cycle through elements inside it—and nowhere else. When the modal closes, focus should snap back to whatever triggered it. I'd seen this in production apps a thousand times. How hard could it be? I sat down, cracked my knuckles, and started coding.

The first version worked... until I tested it with a portal. Since the modal was rendering outside the main DOM tree, my trap simply missed it. Fixed that. Then, Tab landed on a `contenteditable` element inside the modal, which my focusable query hadn't accounted for. Fixed that. Then I realized I'd completely ignored Shift+Tab. Fixed it. Finally, I fired up Safari with VoiceOver, and the screen reader didn't even acknowledge the thing was a modal—the ARIA was a mess.

At that point, I stopped fixing things and started asking myself if I was even the right person to be fixing them.

I deleted the file and looked up Radix UI.

## The accessibility argument is real, but...

Saying "Radix handles accessibility" is technically true, but it's also the kind of thing people say when they want to end a conversation.

The real story is more nuanced. Focus management in overlays isn't the kind of "hard" where you find the right answer once and you're done. It's the kind where combinations of browsers, assistive technologies, and OS versions behave in wildly inconsistent ways. The only way to find what's broken is to test it—systematically, on actual devices, with actual screen readers.

The Radix team has been shipping this since 2020. Their `Dialog` handles focus locks in portals. `Select` and `RadioGroup` implement roving tabindex so arrow keys work exactly how screen reader users expect. `Toast` doesn't scream duplicate announcements into the ARIA live region. These behaviors didn't appear by magic; they're the result of years of iteration and real-world bug reports.

I'm one person building a system with 42 components. Spending my hours on focus management in overlays is a poor use of time. It wasn't about checking a "Radix handles A11y" box—it was realizing that a dedicated team had already solved a class of problem I wasn't equipped to handle as well as they were.

## The other reason: truly zero styles

What people often understate is that Radix ships with genuinely zero CSS. Not "easy to override" or "CSS-variable-based." Just... nothing. You bring the design tokens; Radix brings the interaction semantics.

This is a massive win when you're building on a token system. [7onic](https://7onic.design) generates CSS custom properties, Tailwind v3 presets, Tailwind v4 `@theme` blocks, and TypeScript types from a single `figma-tokens.json`. The last thing that pipeline needs is a component library with hardcoded opinions about what "primary" looks like or what a dropdown's border radius should be.

Radix doesn't have those opinions. It's a skeleton I put skin on. Because there's no overlap between the token system and the component library, they can't contradict each other.

## Radix is not perfect

There was one specific behavior that took me way too long to figure out.

When you select an option in a `Select` or close a `DropdownMenu` with a mouse click, Radix calls `.focus()` on the trigger element as it closes. This is correct for keyboard users—after navigating a menu with arrow keys and hitting Enter, focus should return to the trigger so they can keep tabbing through the page.

The catch? If you used arrow keys at any point inside the dropdown before clicking with your mouse, the browser remembers that as "keyboard modality." So when Radix calls `.focus()` programmatically, the browser applies `:focus-visible` to the trigger. Result: you click with a mouse, the menu closes, and the trigger suddenly gets a focus ring for no reason.

It looks like a visual glitch. I spent ages thinking it was a CSS bug in my token output. It wasn't.

The fix is calling `e.preventDefault()` in the `onCloseAutoFocus` handler:

```tsx title="select.tsx"
onCloseAutoFocus={(e) => {
  e.preventDefault()
  onCloseAutoFocus?.(e)
}}
```

The tradeoff is that after a keyboard-close, focus no longer returns to the trigger—Tab will land on whatever comes next in the DOM. For most use cases, this is fine. For specific keyboard workflows, it might not be. I documented the decision, shipped it, and moved on.

That's what using Radix actually feels like: you delegate the hard problems, only to discover that "delegated" doesn't mean "invisible." The quirks are real, but they're localized and workable—which is a much better place to be than owning the entire problem yourself.

## The path not taken

I looked at Headless UI. Similar philosophy, but at the time, their API leaned more toward render props and transitions. For a system where I'm defining the component APIs anyway, Radix's compositional model (`Select.Content`, `Select.Item`) was much easier to keep consistent across 42 components.

React Aria from Adobe was also on the table. It's more comprehensive but also significantly more complex. Their hook-based API offers more granular control, but requires a lot more wiring per component. For a design system where I need a solid baseline but aren't shipping a low-level primitive library, it was more control than I actually needed.

Building from scratch? That was off the table after my afternoon with the focus trap. Some problems are solved well enough that trying to re-solve them is just stubbornness.

## Where things stand

All the interactive components in 7onic—Dialog, Select, Tabs, Accordion, and the rest—use Radix under the hood. The presentational ones like Skeleton or Spinner don't touch it because there's nothing to delegate.

The decision has held up. I've shipped components I wouldn't have trusted myself to build alone, and the accessibility baseline is higher than anything I could have achieved on my own. Some of that is Radix; some of it is that committing to Radix early forced me to think about keyboard behavior and ARIA patterns before I otherwise would have.

I still don't have a professional screen reader testing setup. I do basic VoiceOver checks, but "doesn't sound broken to me" isn't a substitute for "correct." It's on the list. It keeps getting pushed down the list.

That's probably the most honest thing I can say about accessibility in a solo-built design system: the foundation is better than it would be without Radix, but it's still not as thorough as it should be. Both things are true.

---

*Next: 42 components, and every interactive one has at least five size variants. The smallest is 28px. Here's why it's not 24px, and what WCAG 2.5.8 actually says about touch targets.*

---

**About 7onic** — An open-source React design system where design and code never drift. Free, MIT licensed. Docs and interactive playground at [7onic.design](https://7onic.design). Source code on [GitHub](https://github.com/itonys/7onic) — stars appreciated. More posts in this series at [blog.7onic.design](https://blog.7onic.design). Follow updates on X at [@7onicHQ](https://x.com/7onicHQ).

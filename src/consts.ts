// Site metadata
export const SITE_TITLE = '7onic Blog';
export const SITE_DESCRIPTION =
  'Design to Code — A designer\'s journey building a design system. Insights on design tokens, components, Tailwind, AI, and the full stack of building 7onic.';
export const SITE_URL = 'https://blog.7onic.design';
export const DOCS_URL = 'https://7onic.design';

// Author
export const AUTHOR_NAME = '7onic';
export const AUTHOR_TWITTER = '@7onicHQ';

// Categories
export const CATEGORIES = [
  { id: 'design-system', label: 'Design System' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'components', label: 'Components' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'ai', label: 'AI' },
  { id: 'cli', label: 'CLI' },
  { id: 'devops', label: 'DevOps' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

// Series
export const SERIES = [
  {
    id: 'design-to-code',
    label: 'Design to Code',
    description: "A designer's journey building a design system",
  },
  {
    id: 'solo-builder',
    label: 'Solo Builder',
    description: 'What it actually looks like to build a design system alone',
  },
] as const;

export type SeriesId = (typeof SERIES)[number]['id'];

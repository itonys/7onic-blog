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
  // TEST — remove after scroll test
  { id: 'token-deep-dive', label: 'Token Deep Dive', description: '' },
  { id: 'component-anatomy', label: 'Component Anatomy', description: '' },
  { id: 'cli-tooling', label: 'CLI & Tooling', description: '' },
  { id: 'build-release', label: 'Build & Release', description: '' },
  { id: 'ai-workflow', label: 'AI Workflow', description: '' },
] as const;

export type SeriesId = (typeof SERIES)[number]['id'];

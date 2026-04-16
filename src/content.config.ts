import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum([
      'design-system',
      'tokens',
      'components',
      'tailwind',
      'ai',
      'cli',
      'devops',
    ]),
    tags: z.array(z.string()).default([]),
    series: z.string().optional(),       // e.g. "design-to-code"
    seriesOrder: z.number().optional(),  // e.g. 1, 2, 3
    cover: z.string().optional(),
    draft: z.boolean().default(false),
    // Cross-post tracking (filled after publishing)
    devtoId: z.string().optional(),
    hashnodeId: z.string().optional(),
  }),
});

export const collections = { blog };

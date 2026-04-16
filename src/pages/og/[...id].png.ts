import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { SITE_TITLE, CATEGORIES } from '../../consts';

// Category background gradients
const CATEGORY_COLORS: Record<string, { from: string; to: string; accent: string }> = {
  'design-system': { from: '#1e1b4b', to: '#312e81', accent: '#a78bfa' },
  'tokens':        { from: '#1c1917', to: '#292524', accent: '#fb923c' },
  'components':    { from: '#0f172a', to: '#1e293b', accent: '#38bdf8' },
  'tailwind':      { from: '#0c1a2e', to: '#0f2d4a', accent: '#06b6d4' },
  'ai':            { from: '#0d1f0d', to: '#14321a', accent: '#4ade80' },
  'cli':           { from: '#1a0d2e', to: '#2d1a4a', accent: '#c084fc' },
  'devops':        { from: '#1a0a0a', to: '#2d1212', accent: '#f87171' },
};

const DEFAULT_COLORS = { from: '#111827', to: '#1f2937', accent: '#7c3aed' };

// Load font once (process.cwd() = project root, stable across build phases)
const fontRegular = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-regular.woff')
);
const fontBold = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-bold.woff')
);

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Awaited<ReturnType<typeof getStaticPaths>>[number]['props'];
  const { title, description, category, tags = [] } = post.data;

  const colors = CATEGORY_COLORS[category] ?? DEFAULT_COLORS;
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const displayTitle = title.length > 60 ? title.slice(0, 57) + '...' : title;
  const displayDesc =
    description.length > 80 ? description.slice(0, 77) + '...' : description;

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '60px 72px',
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
        },
        children: [
          // Top: site name
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '12px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: colors.accent,
                    },
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: {
                      fontSize: '20px',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.55)',
                      letterSpacing: '0.05em',
                    },
                    children: SITE_TITLE,
                  },
                },
              ],
            },
          },
          // Center: title + description
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', gap: '16px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: displayTitle.length > 40 ? '48px' : '56px',
                      fontWeight: '700',
                      color: '#ffffff',
                      lineHeight: '1.2',
                    },
                    children: displayTitle,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '22px',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.5)',
                      lineHeight: '1.5',
                    },
                    children: displayDesc,
                  },
                },
              ],
            },
          },
          // Bottom: category + tags
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', gap: '10px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '14px',
                      fontWeight: '700',
                      color: colors.accent,
                      background: 'rgba(255,255,255,0.08)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                      letterSpacing: '0.06em',
                    },
                    children: categoryLabel.toUpperCase(),
                  },
                },
                ...tags.slice(0, 3).map((tag: string) => ({
                  type: 'div',
                  props: {
                    style: {
                      fontSize: '14px',
                      fontWeight: '400',
                      color: 'rgba(255,255,255,0.4)',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '6px 14px',
                      borderRadius: '999px',
                    },
                    children: `#${tag}`,
                  },
                })),
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Atkinson', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Atkinson', data: fontBold, weight: 700, style: 'normal' },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

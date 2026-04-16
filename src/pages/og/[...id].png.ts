import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, SERIES } from '../../consts';

// Category colors
const CATEGORY_COLORS: Record<string, { from: string; to: string; accent: string; glow: string }> = {
  'design-system': { from: '#0a0812', to: '#130f28', accent: '#a78bfa', glow: 'rgba(139,92,246,0.18)' },
  'tokens':        { from: '#0c0a08', to: '#1c1510', accent: '#fb923c', glow: 'rgba(251,146,60,0.15)' },
  'components':    { from: '#080c14', to: '#0f1826', accent: '#38bdf8', glow: 'rgba(56,189,248,0.15)' },
  'tailwind':      { from: '#060e18', to: '#0a1a2e', accent: '#06b6d4', glow: 'rgba(6,182,212,0.15)' },
  'ai':            { from: '#060c06', to: '#0a160a', accent: '#4ade80', glow: 'rgba(74,222,128,0.15)' },
  'cli':           { from: '#0a0814', to: '#180d2e', accent: '#c084fc', glow: 'rgba(192,132,252,0.15)' },
  'devops':        { from: '#0c0606', to: '#1c0a0a', accent: '#f87171', glow: 'rgba(248,113,113,0.15)' },
};

const DEFAULT_COLORS = { from: '#0a0812', to: '#130f28', accent: '#7c3aed', glow: 'rgba(124,58,237,0.18)' };

// Load fonts
const fontRegular = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-regular.woff')
);
const fontBold = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-bold.woff')
);

// Load logo (SVG → PNG data URL for satori)
const logoSvgBuf = fs.readFileSync(path.resolve(process.cwd(), 'public/favicon.svg'));
const logoPngBuf = await sharp(logoSvgBuf).resize(null, 40).png().toBuffer();
const logoDataUrl = `data:image/png;base64,${logoPngBuf.toString('base64')}`;

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Awaited<ReturnType<typeof getStaticPaths>>[number]['props'];
  const { title, description, category, tags = [], series, seriesOrder } = post.data;

  const colors = CATEGORY_COLORS[category] ?? DEFAULT_COLORS;
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const seriesLabel = series ? SERIES.find((s) => s.id === series)?.label : undefined;

  const displayTitle = title.length > 55 ? title.slice(0, 52) + '...' : title;
  const displayDesc = description.length > 90 ? description.slice(0, 87) + '...' : description;
  const titleFontSize = displayTitle.length > 35 ? '46px' : '54px';

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: `radial-gradient(ellipse 900px 700px at 85% -10%, ${colors.glow} 0%, transparent 65%), linear-gradient(150deg, ${colors.from} 0%, ${colors.to} 100%)`,
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Top accent line
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '3px',
                background: `linear-gradient(90deg, ${colors.accent}, transparent)`,
              },
            },
          },

          // Large ghost "7" watermark (right side)
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-20px',
                top: '-40px',
                fontSize: '560px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.028)',
                lineHeight: '1',
                letterSpacing: '-0.05em',
                userSelect: 'none',
              },
              children: '7',
            },
          },

          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                padding: '52px 72px 52px 72px',
              },
              children: [
                // Top row: brand + URL
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                    children: [
                      // Logo mark
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', gap: '10px' },
                          children: [
                            {
                              type: 'img',
                              props: {
                                src: logoDataUrl,
                                width: 27,
                                height: 40,
                                style: { width: '27px', height: '40px' },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '20px',
                                  fontWeight: '700',
                                  color: 'rgba(255,255,255,0.9)',
                                  letterSpacing: '-0.01em',
                                },
                                children: 'onic',
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '14px',
                                  fontWeight: '400',
                                  color: 'rgba(255,255,255,0.35)',
                                  marginLeft: '4px',
                                  letterSpacing: '0.02em',
                                },
                                children: '/ Blog',
                              },
                            },
                          ],
                        },
                      },
                      // URL
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.3)',
                            letterSpacing: '0.02em',
                          },
                          children: 'blog.7onic.design',
                        },
                      },
                    ],
                  },
                },

                // Center: series badge + title + description
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      maxWidth: '780px',
                    },
                    children: [
                      // Series badge
                      ...(seriesLabel && seriesOrder ? [{
                        type: 'div',
                        props: {
                          style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: '4px',
                                  height: '18px',
                                  borderRadius: '2px',
                                  background: colors.accent,
                                },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '13px',
                                  fontWeight: '400',
                                  color: colors.accent,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                },
                                children: `${seriesLabel}  ·  #${seriesOrder}`,
                              },
                            },
                          ],
                        },
                      }] : []),
                      // Title
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: titleFontSize,
                            fontWeight: '700',
                            color: '#ffffff',
                            lineHeight: '1.18',
                            letterSpacing: '-0.02em',
                          },
                          children: displayTitle,
                        },
                      },
                      // Description
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '20px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.45)',
                            lineHeight: '1.55',
                            letterSpacing: '0.005em',
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
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    },
                    children: [
                      // Category pill
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12px',
                            fontWeight: '700',
                            color: colors.accent,
                            background: `rgba(255,255,255,0.07)`,
                            border: `1px solid ${colors.accent}40`,
                            padding: '5px 14px',
                            borderRadius: '999px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          },
                          children: categoryLabel,
                        },
                      },
                      // Tags
                      ...tags.slice(0, 3).map((tag: string) => ({
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.35)',
                            background: 'rgba(255,255,255,0.05)',
                            padding: '5px 14px',
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
